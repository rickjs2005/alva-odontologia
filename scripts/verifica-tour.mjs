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

// 2. os momentos de descanso: cada cartão grudado, antes do seguinte cobrir
const repousos = await pagina.evaluate(() =>
  [...document.querySelectorAll("#tour [data-card]")].map(
    // 12svh é onde ele gruda; +40px entra um pouco no descanso
    (c) => c.getBoundingClientRect().top + scrollY - innerHeight * 0.12 + 40,
  ),
);

const irPara = async (y) => {
  await pagina.evaluate((v) => scrollTo(0, v), Math.max(0, y));
  await pagina.waitForTimeout(1000);
};

const estadoDosCards = () =>
  pagina.evaluate(() =>
    [...document.querySelectorAll("#tour [data-card]")].map((c) => {
      const cap = c.querySelector("figcaption");
      const r = cap.getBoundingClientRect();
      return {
        opacidade: Number(getComputedStyle(c).opacity).toFixed(2),
        matriz: getComputedStyle(c).transform,
        // a legenda cabe na tela? o modo de falha da primeira volta foi ela
        // viver no rodapé do cartão, coberta pelo seguinte antes de ser lida
        legendaVisivel: r.top >= 0 && r.bottom <= innerHeight && r.height > 0,
      };
    }),
  );

if (repousos.length === 4) {
  // no descanso de cada cartão, a legenda dele tem que estar legível na tela
  for (const [i, y] of repousos.entries()) {
    await irPara(y);
    const estado = await estadoDosCards();
    ok(
      estado[i].legendaVisivel,
      `legenda do cartão 0${i + 1} visível no descanso dele`,
    );
    await pagina.screenshot({
      path: `${SAIDA}/repouso-0${i + 1}.png`,
    });
  }

  // no descanso do 02, o 01 já recuou
  await irPara(repousos[1]);
  const cobertos = await estadoDosCards();
  ok(
    Number(cobertos[0].opacidade) < 0.6,
    `cartão 01 apagado quando o 02 gruda (opacidade ${cobertos[0].opacidade})`,
  );
  ok(
    cobertos[0].matriz !== "none",
    `cartão 01 recebeu transform (achei ${cobertos[0].matriz})`,
  );

  // e a transição no meio do caminho, que é onde a sobreposição se julga
  await irPara((repousos[0] + repousos[1]) / 2);
  await pagina.screenshot({ path: `${SAIDA}/transicao.png` });
} else {
  ok(false, `4 cartões para medir (achei ${repousos.length})`);
}

console.log(`\nscreenshots em ${SAIDA}/ — olhe um a um`);

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
