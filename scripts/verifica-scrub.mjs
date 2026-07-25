/**
 * Verificação visual do scrub do hero.
 *
 * Sobe o browser, espera o vídeo ficar pronto, rola o hero em N posições e
 * salva um screenshot de cada uma. O critério de aprovação é humano: as
 * imagens têm que mostrar frames diferentes, na ordem dos planos.
 *
 * Uso: node scripts/verifica-scrub.mjs [url] [largura] [altura]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000";
const largura = Number(process.argv[3] ?? 1440);
const altura = Number(process.argv[4] ?? 900);
const PASSOS = 6;
const SAIDA = ".artifacts/scrub";

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: largura, height: altura },
  deviceScaleFactor: 1,
});

await mkdir(SAIDA, { recursive: true });
await pagina.goto(url, { waitUntil: "networkidle" });

// o VideoRig avisa quando o vídeo pode tocar
await pagina
  .waitForFunction(
    () =>
      document.querySelector("video")?.readyState >= 2 &&
      Number.isFinite(document.querySelector("video")?.duration),
    { timeout: 30000 }
  )
  .catch(() => console.warn("aviso: vídeo não ficou pronto no prazo"));

const alturaHero = await pagina.evaluate(() => {
  const s = document.querySelector("section");
  return s ? s.getBoundingClientRect().height : window.innerHeight * 6;
});

for (let i = 0; i < PASSOS; i++) {
  const y = Math.round((alturaHero - altura) * (i / (PASSOS - 1)));
  await pagina.evaluate((alvo) => window.scrollTo(0, alvo), y);
  // o damping do rAF precisa de tempo para alcançar o alvo
  await pagina.waitForTimeout(2500);

  const estado = await pagina.evaluate(() => {
    const v = document.querySelector("video");
    return {
      scrollY: Math.round(window.scrollY),
      currentTime: v ? Number(v.currentTime.toFixed(2)) : null,
      duration: v ? Number(v.duration.toFixed(2)) : null,
    };
  });

  await pagina.screenshot({ path: `${SAIDA}/scrub-${i}.png` });
  console.log(
    `scrub-${i}.png  scrollY=${estado.scrollY}  t=${estado.currentTime}s / ${estado.duration}s`
  );
}

await navegador.close();
