/**
 * Contraste real de cada nó de texto contra o que está atrás dele.
 *
 * Não lê o CSS: percorre o DOM renderizado, pega a cor computada de cada nó
 * de texto visível e caminha os ancestrais até achar um fundo opaco, compondo
 * os translúcidos pelo caminho. É a única forma de pegar o modo de falha
 * desta mudança de paleta, que é silencioso — texto cinza sobre fundo cinza
 * continua "funcionando", só não dá para ler.
 *
 * Limite: não enxerga texto sobre vídeo ou imagem (o hero, o interlúdio, a
 * galeria). Lá o fundo é um frame, não uma cor, e quem verifica é
 * verifica-capitulos.mjs olhado no olho.
 *
 * Uso: node scripts/verifica-contraste.mjs [url] [largura] [altura]
 */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const largura = Number(process.argv[3] ?? 1440);
const altura = Number(process.argv[4] ?? 900);

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: largura, height: altura },
  deviceScaleFactor: 1,
});

await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
// o loader cobre a tela por ~1,5s e o Reveal só revela ao entrar na viewport
await pagina.waitForTimeout(3000);

const achados = await pagina.evaluate(() => {
  const canal = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = ([r, g, b]) =>
    0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const rgba = (s) => {
    const m = s.match(/[\d.]+/g);
    if (!m) return null;
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  };
  /** compõe src (com alfa) sobre dst (opaco) */
  const sobre = (src, dst) =>
    [0, 1, 2].map((i) => Math.round(src[i] * src[3] + dst[i] * (1 - src[3])));

  /** sobe a árvore compondo fundos translúcidos até achar um opaco */
  const fundoDe = (el) => {
    const pilha = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = rgba(getComputedStyle(n).backgroundColor);
      if (bg && bg[3] > 0) {
        pilha.push(bg);
        if (bg[3] === 1) break;
      }
      n = n.parentElement;
    }
    let base = rgba(getComputedStyle(document.body).backgroundColor) ?? [
      26, 26, 26, 1,
    ];
    base = [base[0], base[1], base[2]];
    for (let i = pilha.length - 1; i >= 0; i--) base = sobre(pilha[i], base);
    return base;
  };

  const fora = [];
  const nos = document.evaluate(
    "//text()[normalize-space(.) != '']",
    document.body,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0; i < nos.snapshotLength; i++) {
    const no = nos.snapshotItem(i);
    const el = no.parentElement;
    if (!el) continue;
    if (el.closest(".sr-only, .skip, [aria-hidden='true']")) continue;

    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (Number(cs.opacity) < 0.6) continue;

    const caixa = el.getBoundingClientRect();
    if (caixa.width < 2 || caixa.height < 2) continue;

    // texto sobre mídia: fundo não é cor, o script não tem o que medir
    if (el.closest("[data-secao='O filme'], [data-capitulo], .lightbox"))
      continue;

    const cor = rgba(cs.color);
    if (!cor) continue;
    const frente =
      cor[3] === 1
        ? [cor[0], cor[1], cor[2]]
        : sobre(cor, fundoDe(el));

    const px = parseFloat(cs.fontSize);
    const peso = Number(cs.fontWeight) || 400;
    // WCAG: "texto grande" é ≥24px, ou ≥18.66px em negrito
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const piso = grande ? 3 : 4.5;

    const r = ratio(frente, fundoDe(el));
    if (r < piso) {
      fora.push({
        texto: no.textContent.trim().slice(0, 44),
        seletor: el.tagName.toLowerCase() + "." + (el.className || "").toString().split(" ")[0],
        px: Math.round(px),
        ratio: Number(r.toFixed(2)),
        piso,
        cor: cs.color,
        fundo: `rgb(${fundoDe(el).join(",")})`,
      });
    }
  }
  return fora;
});

await navegador.close();

if (achados.length === 0) {
  console.log(`sem falhas de contraste em ${largura}x${altura}.`);
  process.exit(0);
}

console.log(`${achados.length} nó(s) abaixo do piso AA em ${largura}x${altura}:\n`);
for (const a of achados) {
  console.log(
    `  ${String(a.ratio).padStart(5)}:1 (piso ${a.piso})  ${a.px}px  ${a.seletor}`
  );
  console.log(`         "${a.texto}"`);
  console.log(`         ${a.cor} sobre ${a.fundo}`);
}
process.exit(1);
