/**
 * Verificação visual dos capítulos do hero.
 *
 * Rola até o centro de cada janela de plano e reporta qual capítulo está
 * visível ali, com que opacidade, e se o vídeo chegou no frame certo.
 * Depois checa cada fronteira em dois pontos:
 *
 * 1. No corte exato (`planos[i].v1`): por construção, os dois capítulos
 *    estão em opacidade 0 ali (é o fim da rampa de saída de um e o começo
 *    da rampa de entrada do outro). Confere que nunca há dois `> 0.5` ao
 *    mesmo tempo — barato, mas não pega o bug que importa.
 * 2. No MEIO da rampa de entrada do capítulo que chega (`v0 + largura *
 *    RAMPA / 2`): é aí que o capítulo entrando passa por ~0.5 de opacidade
 *    — e é exatamente aí que uma saída lenta demais do capítulo anterior
 *    apareceria, ainda em ~0,25–0,3 de opacidade, sem nunca cruzar 0.5.
 *    Amostrar só o corte deixa esse fantasma invisível: os dois nunca
 *    ficam "sólidos" ao mesmo tempo, mas um texto fantasma por cima do
 *    outro entrando é a colisão real que o relógio de saída desta task
 *    existe para evitar. Por isso o limiar aqui é `> 0.05`, não `> 0.5`:
 *    o ponto todo desta checagem é pegar resíduo, não sobreposição
 *    "sólida". Não troque isto de volta para amostrar só o corte — o
 *    corte por si só passa mesmo com a fórmula de saída errada (foi
 *    assim que esse bug escapou da primeira versão deste script).
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
// mesmo valor de RAMPA em components/Capitulos/Capitulos.tsx — se um mudar
// sem o outro, esta checagem passa a amostrar o ponto errado da curva
const RAMPA = 0.18;

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

console.log("\n— fronteiras, no corte (nenhum par legível ao mesmo tempo) —");
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

console.log("\n— rampas, no meio da entrada (nada residual do capítulo anterior) —");
for (let i = 0; i < planos.length - 1; i++) {
  const entra = i + 1; // índice do capítulo que está entrando nesta rampa
  const alvo = planos[entra];
  const p = alvo.v0 + (alvo.v1 - alvo.v0) * (RAMPA / 2);
  const r = await irPara(p, `rampa ${i}/${entra}`);
  await pagina.screenshot({ path: `${SAIDA}/rampa-${i}.png` });

  // no meio da própria rampa de entrada, o capítulo que chega está em
  // ~0.5 — não faz parte do que estamos checando aqui. O que importa é
  // que nenhum OUTRO capítulo (o que acabou de sair, inclusive) tenha
  // sobrado acima de um resíduo desprezível
  const fantasmas = r.caps.filter((c) => c.i !== entra && c.opacidade > 0.05);
  if (fantasmas.length > 0) falhas++;
  console.log(
    `rampa-${i}.png  entra=${entra} ` +
      `${
        fantasmas.length > 0
          ? `FALHA: fantasma [${fantasmas
              .map((c) => `${c.i}=${c.opacidade.toFixed(3)}`)
              .join(", ")}]`
          : "ok"
      }`
  );
}

await navegador.close();
console.log(
  falhas === 0
    ? "\nsem falhas automáticas. Agora OLHE os PNGs em .artifacts/capitulos."
    : `\n${falhas} falha(s). Veja acima.`
);
process.exit(falhas === 0 ? 0 : 1);
