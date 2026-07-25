import { chromium } from "playwright";

const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 390, height: 844 } });

await p.addInitScript(() => {
  window.__lcp = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__lcp.push({
        t: Math.round(e.startTime),
        tag: e.element?.tagName,
        cls: e.element?.className?.toString?.().slice(0, 60),
        txt: e.element?.textContent?.trim().slice(0, 50),
        url: e.url,
      });
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => window.__lcp), null, 1));
await nav.close();
