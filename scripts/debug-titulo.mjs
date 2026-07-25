import { chromium } from "playwright";

const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);

const info = await p.evaluate(() => {
  const h1 = document.querySelector("h1");
  if (!h1) return { erro: "sem h1" };
  const r = h1.getBoundingClientRect();
  const primeira = h1.querySelector("i");
  const rp = primeira?.getBoundingClientRect();
  const cs = primeira ? getComputedStyle(primeira) : null;
  const csSpan = getComputedStyle(h1.querySelector("span"));
  return {
    texto: h1.textContent,
    h1: { x: r.x, y: r.y, w: r.width, h: r.height },
    h1cor: getComputedStyle(h1).color,
    palavra: rp ? { x: rp.x, y: rp.y, w: rp.width, h: rp.height } : null,
    transform: cs?.transform,
    span: { overflow: csSpan.overflow, display: csSpan.display, h: csSpan.height },
    fonte: getComputedStyle(h1).fontFamily,
    tamanho: getComputedStyle(h1).fontSize,
  };
});

console.log(JSON.stringify(info, null, 2));
await nav.close();
