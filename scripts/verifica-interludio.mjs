/**
 * Verificação visual do interlúdio: a janela em forma de arco tem que abrir
 * progressivamente e revelar o filme. Critério humano — olhar as imagens.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000";
const SAIDA = ".artifacts/interludio";
const PASSOS = 6;

const nav = await chromium.launch();
const p = await nav.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await mkdir(SAIDA, { recursive: true });
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

await p
  .waitForFunction(
    () => {
      const v = document.querySelector("video");
      return v && Number.isFinite(v.duration) && v.readyState >= 2;
    },
    { timeout: 60000 }
  )
  .catch(() => console.warn("aviso: vídeo não ficou pronto"));

const alvo = await p.evaluate(() => {
  const s = [...document.querySelectorAll("main > section")].find(
    (n) => n.dataset.secao === "Interlúdio"
  );
  if (!s) return null;
  return {
    top: Math.round(s.getBoundingClientRect().top + window.scrollY),
    altura: Math.round(s.getBoundingClientRect().height),
  };
});

if (!alvo) {
  console.error("seção do interlúdio não encontrada");
  await nav.close();
  process.exit(1);
}

console.log(`interlúdio em y=${alvo.top}, altura ${alvo.altura}`);

for (let i = 0; i < PASSOS; i++) {
  const y = alvo.top + Math.round(((alvo.altura - 900) * i) / (PASSOS - 1));
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(2200);

  const estado = await p.evaluate(() => {
    const v = document.querySelector("video");
    const veu = document.querySelector("[data-secao='Interlúdio'] div");
    return {
      t: v ? Number(v.currentTime.toFixed(2)) : null,
      abertura: veu ? getComputedStyle(veu).getPropertyValue("--abertura") : "?",
    };
  });

  await p.screenshot({ path: `${SAIDA}/int-${i}.png` });
  console.log(`int-${i}.png  t=${estado.t}s  abertura=${estado.abertura.trim()}`);
}

await nav.close();
