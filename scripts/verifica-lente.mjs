/** A lente do comparador só existe sob o ponteiro — screenshot normal não a
 *  captura. Este script move o mouse até o meio da foto e fotografa. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000";
const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });

await mkdir(".artifacts/lente", { recursive: true });
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2500);

const caixa = await p.locator("[role='slider']").first();
await caixa.scrollIntoViewIfNeeded();
await p.waitForTimeout(2500);

const r = await caixa.boundingBox();
if (!r) throw new Error("comparador não encontrado");

// entra pela esquerda e vai até os dentes
await p.mouse.move(r.x + 40, r.y + r.height * 0.5);
await p.waitForTimeout(400);
await p.mouse.move(r.x + r.width * 0.46, r.y + r.height * 0.35, { steps: 12 });
await p.waitForTimeout(900);

await p.screenshot({ path: ".artifacts/lente/lente.png" });
console.log("lente.png salvo");

await nav.close();
