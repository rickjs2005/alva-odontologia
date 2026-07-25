/**
 * Screenshot de cada seção, em cada largura. O critério é humano: olhar as
 * imagens uma a uma.
 *
 * Uso: node scripts/verifica-secoes.mjs [url]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000";
const LARGURAS = [
  { nome: "mobile", w: 390, h: 844 },
  { nome: "tablet", w: 768, h: 1024 },
  { nome: "desktop", w: 1440, h: 900 },
];
const SAIDA = ".artifacts/secoes";

const navegador = await chromium.launch();
await mkdir(SAIDA, { recursive: true });

for (const larg of LARGURAS) {
  const pagina = await navegador.newPage({
    viewport: { width: larg.w, height: larg.h },
    deviceScaleFactor: 1,
  });
  // networkidle não serve: no desktop o vídeo usa preload=auto e a rede
  // nunca fica ociosa
  await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await pagina.waitForTimeout(3500);

  const alvos = await pagina.evaluate(() => {
    const nos = [...document.querySelectorAll("main > section, footer")];
    return nos.map((n, i) => ({
      i,
      id: n.id || `secao-${i}`,
      top: Math.round(n.getBoundingClientRect().top + window.scrollY),
      altura: Math.round(n.getBoundingClientRect().height),
    }));
  });

  for (const alvo of alvos) {
    // no hero (muito alto) pega o topo; nas outras, centraliza
    const y =
      alvo.altura > larg.h * 2
        ? alvo.top
        : alvo.top - Math.max(0, (larg.h - alvo.altura) / 2);
    await pagina.evaluate((v) => window.scrollTo(0, v), Math.max(0, y));
    await pagina.waitForTimeout(1800);
    await pagina.screenshot({
      path: `${SAIDA}/${larg.nome}-${String(alvo.i).padStart(2, "0")}-${alvo.id}.png`,
    });
  }

  console.log(`${larg.nome}: ${alvos.length} seções`);
  await pagina.close();
}

await navegador.close();
