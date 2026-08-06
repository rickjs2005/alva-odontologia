/**
 * A pilha do Tour: mede o que não dá para ver em code review — se os cartões
 * realmente grudam, se o top escalona, e se o anterior apaga quando o
 * seguinte sobe.
 *
 * Sai com código 1 se algum critério falhar. Os screenshots continuam sendo
 * julgados por gente: o critério de "está bonito" não é automatizável.
 *
 * Uso: node scripts/verifica-tour.mjs [url]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3001";
const SAIDA = ".artifacts/tour";

const navegador = await chromium.launch();
await mkdir(SAIDA, { recursive: true });

const pagina = await navegador.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await pagina.waitForTimeout(3000);

const falhas = [];
const ok = (cond, msg) => {
  console.log(`${cond ? "  ok  " : " FALHA"} ${msg}`);
  if (!cond) falhas.push(msg);
};

// 1. estrutura
const estrutura = await pagina.evaluate(() => {
  const secao = document.querySelector("#tour");
  if (!secao) return null;
  const cards = [...secao.querySelectorAll("[data-card]")];
  return {
    total: cards.length,
    sticky: cards.map((c) => getComputedStyle(c).position),
    tops: cards.map((c) => getComputedStyle(c).top),
    lightbox: !!document.querySelector("[data-lightbox]"),
    botoes: secao.querySelectorAll("button").length,
  };
});

ok(estrutura !== null, "seção #tour existe");
if (!estrutura) {
  console.log("\nsem #tour, nada a medir");
  await navegador.close();
  process.exit(1);
}

ok(estrutura.total === 4, `4 cartões (achei ${estrutura.total})`);
ok(
  estrutura.total > 0 && estrutura.sticky.every((p) => p === "sticky"),
  `todos sticky (achei ${estrutura.sticky.join(", ") || "nada"})`,
);
ok(!estrutura.lightbox, "nenhum lightbox no DOM");
ok(estrutura.botoes === 0, `nenhum botão na pilha (achei ${estrutura.botoes})`);

// o top escalona de 14px em 14px
const tops = estrutura.tops.map((t) => parseFloat(t));
const degraus = tops.slice(1).map((t, i) => Math.round(t - tops[i]));
ok(
  degraus.length === 3 && degraus.every((d) => d === 14),
  `top escalona 14px (achei ${degraus.join(", ") || "nada"})`,
);

// 2. comportamento: o anterior apaga quando o seguinte gruda
const topoSecao = await pagina.evaluate(
  () => document.querySelector("#tour").getBoundingClientRect().top + scrollY,
);
const alturaCard = await pagina.evaluate(() => {
  const c = document.querySelector("[data-card]");
  return c ? c.getBoundingClientRect().height : 0;
});

if (alturaCard > 0) {
  const medir = async (y) => {
    await pagina.evaluate((v) => scrollTo(0, v), y);
    await pagina.waitForTimeout(900);
    return pagina.evaluate(() =>
      [...document.querySelectorAll("[data-card]")].map((c) => ({
        opacidade: Number(getComputedStyle(c).opacity).toFixed(2),
        matriz: getComputedStyle(c).transform,
      })),
    );
  };

  // posição em que o cartão 02 já cobriu o 01
  const estado = await medir(topoSecao + alturaCard * 1.6);
  ok(
    Number(estado[0].opacidade) < 0.6,
    `cartão 01 apagado quando o 02 sobe (opacidade ${estado[0].opacidade})`,
  );
  ok(
    estado[0].matriz !== "none",
    `cartão 01 recebeu transform (achei ${estado[0].matriz})`,
  );
} else {
  ok(false, "há cartão para medir (não achei nenhum)");
}

// 3. screenshots para olho humano
const passo = alturaCard > 0 ? alturaCard : 700;
const paradas = [0, 0.9, 1.8, 2.7];
for (const [i, p] of paradas.entries()) {
  await pagina.evaluate((v) => scrollTo(0, v), topoSecao + passo * p);
  await pagina.waitForTimeout(1200);
  await pagina.screenshot({
    path: `${SAIDA}/pilha-${String(i + 1).padStart(2, "0")}.png`,
  });
}
console.log(`\n${paradas.length} screenshots em ${SAIDA}/ — olhe um a um`);

// 4. reduced-motion desmonta a pilha
const p2 = await navegador.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
await p2.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p2.waitForTimeout(3000);
const rm = await p2.evaluate(() =>
  [...document.querySelectorAll("#tour [data-card]")].map(
    (c) => getComputedStyle(c).position,
  ),
);
ok(
  rm.length === 4 && rm.every((p) => p === "static"),
  `com reduced-motion a pilha desmonta (achei ${rm.join(", ") || "nada"})`,
);
await p2.evaluate(
  (v) => scrollTo(0, v),
  await p2.evaluate(
    () => document.querySelector("#tour").getBoundingClientRect().top + scrollY,
  ),
);
await p2.waitForTimeout(800);
await p2.screenshot({ path: `${SAIDA}/reduced-motion.png` });

await navegador.close();

if (falhas.length) {
  console.log(`\n${falhas.length} falha(s)`);
  process.exit(1);
}
console.log("\ntudo passou (o julgamento visual continua sendo seu)");
