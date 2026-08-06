/**
 * Verificação visual dos capítulos do hero.
 *
 * Rola até o centro de cada janela de plano e reporta qual capítulo está
 * visível ali, com que opacidade, e se o vídeo chegou no frame certo.
 * Depois rola até cada fronteira e confere que nunca há dois capítulos
 * legíveis ao mesmo tempo.
 *
 * O critério de aprovação é humano: as imagens em .artifacts/capitulos
 * precisam mostrar o frame certo E o texto certo, legível, sem cair em cima
 * do assunto do plano.
 *
 * Uso: node scripts/verifica-capitulos.mjs [url] [largura] [altura]
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000";
const largura = Number(process.argv[3] ?? 1440);
const altura = Number(process.argv[4] ?? 900);
const SAIDA = ".artifacts/capitulos";

// lib/scenes.ts é TypeScript e este script é .mjs puro — lê os números do
// texto em vez de importar. Se o formato de scenes.ts mudar, isto quebra
// alto e claro, que é o que se quer.
const fonte = await readFile("lib/scenes.ts", "utf8");
const planos = [...fonte.matchAll(/nome:\s*"([^"]+)"[\s\S]*?v0:\s*([\d.]+),\s*v1:\s*([\d.]+)/g)]
  .map((m) => ({ nome: m[1], v0: Number(m[2]), v1: Number(m[3]) }));

if (planos.length !== 7) {
  console.error(`esperava 7 planos em lib/scenes.ts, achei ${planos.length}`);
  process.exit(1);
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: largura, height: altura },
  deviceScaleFactor: 1,
});

await mkdir(SAIDA, { recursive: true });
// nada de networkidle: com preload=auto o vídeo baixa continuamente e a rede
// nunca fica ociosa
await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

await pagina
  .waitForFunction(
    () => {
      const v = document.querySelector("video");
      if (!v || !Number.isFinite(v.duration) || v.readyState < 2) return false;
      const fim = v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0;
      return fim >= v.duration * 0.9;
    },
    { timeout: 90000 }
  )
  .catch(() => console.warn("aviso: buffer não chegou a 90% no prazo"));

const alturaHero = await pagina.evaluate(
  () => document.querySelector("[data-secao='O filme']")?.getBoundingClientRect().height ?? 0
);
const curso = alturaHero - altura;
if (curso <= 0) {
  console.error("hero não tem curso de scroll — está em modo mobile?");
  process.exit(1);
}

/** lê o estado de todos os capítulos montados */
const lerCapitulos = () =>
  pagina.evaluate(() =>
    [...document.querySelectorAll("[data-capitulo]")].map((el) => ({
      i: Number(el.getAttribute("data-capitulo")),
      opacidade: Number(getComputedStyle(el).opacity),
      texto: el.textContent?.replace(/\s+/g, " ").trim().slice(0, 60) ?? "",
    }))
  );

const irPara = async (p, nome) => {
  await pagina.evaluate((y) => window.scrollTo(0, y), Math.round(curso * p));
  // o damping do rAF do VideoRig precisa de tempo para alcançar o alvo
  await pagina.waitForTimeout(2500);
  const v = await pagina.evaluate(() => {
    const el = document.querySelector("video");
    return el ? Number((el.currentTime / el.duration).toFixed(3)) : null;
  });
  const caps = await lerCapitulos();
  return { p, nome, v, caps };
};

let falhas = 0;

console.log("\n— centro de cada capítulo —");
for (let i = 0; i < planos.length; i++) {
  const centro = (planos[i].v0 + planos[i].v1) / 2;
  const r = await irPara(centro, planos[i].nome);
  await pagina.screenshot({ path: `${SAIDA}/cap-${i}.png` });

  const visiveis = r.caps.filter((c) => c.opacidade > 0.5);
  const esperado = visiveis.length === 1 && visiveis[0].i === i;
  const desvioVideo = r.v === null ? 1 : Math.abs(r.v - centro);

  if (!esperado) falhas++;
  if (desvioVideo > 0.05) falhas++;

  console.log(
    `cap-${i}.png  ${planos[i].nome.padEnd(14)} alvo=${centro.toFixed(3)} ` +
      `video=${r.v}  visiveis=[${visiveis.map((c) => c.i).join(",")}] ` +
      `${esperado ? "ok" : "FALHA: capítulo errado ou nenhum"}` +
      `${desvioVideo > 0.05 ? "  FALHA: vídeo fora do plano" : ""}`
  );
  if (visiveis[0]) console.log(`            "${visiveis[0].texto}"`);
}

console.log("\n— fronteiras (nenhum par legível ao mesmo tempo) —");
for (let i = 0; i < planos.length - 1; i++) {
  const r = await irPara(planos[i].v1, `fronteira ${i}/${i + 1}`);
  await pagina.screenshot({ path: `${SAIDA}/fronteira-${i}.png` });
  const legiveis = r.caps.filter((c) => c.opacidade > 0.5);
  if (legiveis.length > 1) falhas++;
  console.log(
    `fronteira-${i}.png  legiveis=${legiveis.length} ` +
      `${legiveis.length > 1 ? "FALHA: dois capítulos ao mesmo tempo" : "ok"}`
  );
}

await navegador.close();
console.log(
  falhas === 0
    ? "\nsem falhas automáticas. Agora OLHE os PNGs em .artifacts/capitulos."
    : `\n${falhas} falha(s). Veja acima.`
);
process.exit(falhas === 0 ? 0 : 1);
