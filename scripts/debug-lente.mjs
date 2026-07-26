import { chromium } from "playwright";

const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2500);

const caixa = p.locator("[role='slider']").first();
await caixa.scrollIntoViewIfNeeded();
await p.waitForTimeout(2000);
const r = await caixa.boundingBox();
await p.mouse.move(r.x + r.width * 0.46, r.y + r.height * 0.42, { steps: 8 });
await p.waitForTimeout(600);

console.log(
  JSON.stringify(
    await p.evaluate(() => {
      const c = document.querySelector("[role='slider']");
      const cs = getComputedStyle(c);
      const lente = c.querySelector("span[class*='lente']");
      const interna = lente?.firstElementChild;
      const rc = c.getBoundingClientRect();
      const ri = interna?.getBoundingClientRect();
      const rl = lente?.getBoundingClientRect();
      return {
        comparador: { w: Math.round(rc.width), h: Math.round(rc.height) },
        lx: cs.getPropertyValue("--lx").trim(),
        ly: cs.getPropertyValue("--ly").trim(),
        lw: cs.getPropertyValue("--lw").trim(),
        lh: cs.getPropertyValue("--lh").trim(),
        lenteRect: rl && {
          x: Math.round(rl.x - rc.x),
          y: Math.round(rl.y - rc.y),
          w: Math.round(rl.width),
        },
        internaRect: ri && {
          x: Math.round(ri.x - rc.x),
          y: Math.round(ri.y - rc.y),
          w: Math.round(ri.width),
          h: Math.round(ri.height),
        },
        internaTransform: interna ? getComputedStyle(interna).transform : null,
      };
    }),
    null,
    1
  )
);
await nav.close();
