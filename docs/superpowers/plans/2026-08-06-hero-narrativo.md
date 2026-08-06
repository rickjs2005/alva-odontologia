# Hero Narrativo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar os ~500vh de filme mudo do hero por sete capítulos de texto sincronizados com os sete planos do master, e trocar o anel do cursor por uma silhueta de incisivo.

**Architecture:** Nenhum rig novo. `Hero` já escreve o progresso do scrub em `lib/world.ts` e o `VideoRig` já o persegue num rAF. Adicionamos um segundo canal (`world.heroProgresso`), escrito só pelo `Hero`, e um componente `Capitulos` que o lê num rAF próprio e escreve opacidade/`y`/`blur` direto no DOM. Chapter 01 (o H1) continua no `Hero`, mas passa a sair pelo mesmo relógio dos outros seis, o que elimina a sobreposição que existiria hoje entre a saída da copy (18%) e a entrada do capítulo 02 (14,75%).

**Tech Stack:** Next.js (App Router), React 19, GSAP + ScrollTrigger, Lenis, CSS Modules, Playwright (só para verificação visual).

## Global Constraints

Copiados do `AGENTS.md`. Valem para todas as tarefas.

- **Ouro (`#C9A86A`) só como fio de 1px ou caixa alta ≥14px peso 500.** Nunca preenchimento, nunca botão sólido dourado. Em corpo de texto use `--ouro-texto` (fundo claro) ou `--ouro-claro` (fundo escuro).
- **Sem Framer Motion.** GSAP + CSS apenas.
- **Sem "excelência", "soluções personalizadas", "compromisso com o seu sorriso".** Frases curtas, um detalhe concreto por parágrafo.
- **Não escrever arquivo por redirecionamento do PowerShell** (`>`, `Out-File`, `Set-Content`): gera BOM e quebra o parser. Use a ferramenta Write.
- **Um componente por pasta**, com seu `.module.css` ao lado. Arquivo de seção que passa de ~200 linhas vira subcomponente.
- **Scrub de vídeo se verifica com screenshot do Playwright, olhado de verdade.** Code review e `curl` não valem.
- Meta de Lighthouse ≥95.

### Sobre "teste" neste repositório

**Não existe framework de teste unitário aqui.** As dependências são `gsap`, `lenis`, `next`, `react`, `playwright`. O ciclo vermelho→verde deste plano é:

1. `node scripts/verifica-capitulos.mjs` — sobe o browser, rola até o centro de cada janela de capítulo, imprime o que está visível e salva screenshot.
2. `npx tsc --noEmit` — tipos.
3. `npm run lint` — eslint.
4. Olhar os PNGs em `.artifacts/`.

Não invente Jest/Vitest. A Task 2 constrói o script de verificação **antes** do componente, e ele precisa falhar antes de passar.

### Como rodar o servidor

Os scripts de verificação esperam um dev server em `http://localhost:3000`. Suba com `npm run dev` num terminal separado e deixe rodando durante todas as tasks. Se preferir produção: `npm run build && npm run start`.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade | Task |
|---|---|---|
| `lib/scenes.ts` | modificar — os 7 planos ganham `linha`, `apoio`, `lado`, `peso` | 1 |
| `lib/world.ts` | modificar — ganha `heroProgresso` | 1 |
| `scripts/verifica-capitulos.mjs` | criar — verificação visual dos 7 capítulos | 2 |
| `components/Capitulos/Capitulos.tsx` | criar — camada de texto dos capítulos 02–07 | 3 |
| `components/Capitulos/Capitulos.module.css` | criar | 3 |
| `components/sections/Hero/Hero.tsx` | modificar — capítulo 01 no relógio dos planos, monta `Capitulos` | 4 |
| `components/sections/Hero/Hero.module.css` | modificar — esconde sub/ações/indicadores no desktop | 4 |
| `components/VideoRig/VideoRig.tsx` | modificar — ganha o scrim narrativo | 5 |
| `components/VideoRig/VideoRig.module.css` | modificar — scrim direcional vira variável, entra o simétrico | 5 |
| `components/Cursor/Cursor.tsx` | modificar — anel vira dente, sai o ponto | 6 |
| `components/Cursor/Cursor.module.css` | modificar | 6 |

---

### Task 1: Dados — roteiro e canal de progresso

**Files:**
- Modify: `lib/scenes.ts` (arquivo inteiro)
- Modify: `lib/world.ts:4`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `PLANOS: readonly Plano[]` onde `Plano = { nome: string; v0: number; v1: number; linha: string; apoio: string | null; lado: "esq" | "dir"; peso: number }`
  - `planoEm(t: number): number` — inalterado
  - `world.heroProgresso: number` — escrito só pelo `Hero`, lido pelo `Capitulos`

- [ ] **Step 1: Reescrever `lib/scenes.ts`**

Os valores `v0`/`v1` **não mudam** — são os centros dos crossfades do master de 32,53s.

```ts
/** Os 7 planos do master (32,53s) e o roteiro que corre em cima deles.
 *
 *  Os limites são os centros dos crossfades de 0,4s — por isso não são
 *  frações redondas. Não mexa neles sem reencodar o vídeo.
 *
 *  `linha` e `apoio` saem de fatos que o lib/conteudo.ts já afirma (SOBRE,
 *  DIFERENCIAIS, JORNADA, FAQ). Nenhum número novo entra no site por aqui.
 *
 *  `lado` é dado de calibração, não regra: o assunto não está no mesmo canto
 *  do quadro nos sete planos. Onde o texto cair em cima do assunto, inverta
 *  o lado daquele plano — a decisão se toma olhando o screenshot da
 *  verificação, nunca lendo o código.
 *
 *  `peso` é quanta escuridão o texto daquele plano precisa para passar AA.
 *  Os respiros (01 depois da saída do H1, e 04) pedem menos. */
export const PLANOS = [
  {
    nome: "A porta",
    v0: 0.0,
    v1: 0.1475,
    // o H1, que vive no Hero por ser o elemento de LCP
    linha: "Atendemos cinco pessoas por dia.",
    apoio: null,
    lado: "esq",
    peso: 1,
  },
  {
    nome: "A recepção",
    v0: 0.1475,
    v1: 0.2889,
    linha: "Você chega e não espera.",
    apoio:
      "Cinco nomes na agenda do dia. Ninguém é atendido com o próximo esperando na porta.",
    lado: "esq",
    peso: 0.9,
  },
  {
    nome: "O encontro",
    v0: 0.2889,
    v1: 0.4303,
    linha: "A primeira consulta são cinquenta minutos.",
    apoio:
      "Escaneamento, fotos e conversa. Nenhum procedimento no mesmo dia.",
    lado: "dir",
    peso: 0.9,
  },
  {
    nome: "O corredor",
    v0: 0.4303,
    v1: 0.5717,
    // sem apoio: é o respiro do meio. Sete parágrafos de duas linhas
    // seguidos viram lista, não filme.
    linha: "Onze pessoas trabalham aqui. Cinco pacientes passam por dia.",
    apoio: null,
    lado: "esq",
    peso: 0.6,
  },
  {
    nome: "O consultório",
    v0: 0.5717,
    v1: 0.7131,
    linha: "O escaneamento leva quatro minutos.",
    apoio: "A moldagem com massa saiu de cena. Ninguém sente falta.",
    lado: "dir",
    peso: 0.9,
  },
  {
    nome: "O detalhe",
    v0: 0.7131,
    v1: 0.8545,
    linha: "Você vê o resultado antes do primeiro desgaste.",
    apoio:
      "O sorriso é desenhado em 3D e testado em provisório. Você aprova, aí começa.",
    lado: "esq",
    peso: 0.9,
  },
  {
    nome: "O sorriso",
    v0: 0.8545,
    v1: 1.0,
    linha: "Comece pelos cinquenta minutos.",
    apoio: "Sem procedimento no mesmo dia. Sem compromisso de fechar nada.",
    lado: "dir",
    peso: 1,
  },
] as const;

export const planoEm = (t: number) => {
  const i = PLANOS.findIndex((p) => t >= p.v0 && t < p.v1);
  return i < 0 ? PLANOS.length - 1 : i;
};
```

- [ ] **Step 2: Adicionar `heroProgresso` em `lib/world.ts`**

Arquivo inteiro:

```ts
/** Escrito pelo ScrollTrigger do Hero, lido pelo rAF do VideoRig.
 *  Estado mutável de propósito: passar isso por React state re-renderizaria a
 *  árvore 60 vezes por segundo e mataria o scrub. */
export const world = {
  /** posição do filme, 0–1. O Hero escreve durante o hero; o Interlúdio
   *  reescreve mais adiante na página, mirando o plano 07. */
  progresso: 0,
  /** posição dentro do hero, 0–1. Só o Hero escreve. Existe separado porque
   *  `progresso` volta a 0.855 quando o Interlúdio assume, e os capítulos não
   *  podem reagir a isso. */
  heroProgresso: 0,
};
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

Esperado: sem erros. `VideoRig.tsx` importa `PLANOS[i].nome` e `planoEm` — os dois continuam existindo com a mesma forma.

- [ ] **Step 4: Commit**

```bash
git add lib/scenes.ts lib/world.ts
git commit -m "feat: o roteiro dos sete capitulos entra no scenes.ts"
```

---

### Task 2: A verificação, antes do componente

**Files:**
- Create: `scripts/verifica-capitulos.mjs`

**Interfaces:**
- Consumes: `PLANOS` da Task 1 (relê o arquivo por regex — o script é `.mjs` puro e não passa pelo bundler do Next, então não pode importar TypeScript).
- Produces: `.artifacts/capitulos/cap-N.png` e um relatório no stdout.

Este é o passo vermelho. O script tem que rodar **antes** do `Capitulos` existir e reportar "nenhum capítulo visível" em 6 das 7 posições.

- [ ] **Step 1: Escrever o script**

```js
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
```

- [ ] **Step 2: Rodar e confirmar que falha**

Com `npm run dev` rodando noutro terminal:

```bash
node scripts/verifica-capitulos.mjs
```

Esperado: **falha**. `[data-capitulo]` ainda não existe, então `visiveis=[]` em todas as sete posições e o relatório fecha com 7 falhas. O eixo do vídeo deve passar (`video≈alvo`) — o scrub já funciona hoje.

Se o vídeo também falhar, pare: há regressão anterior a este plano e ela precisa ser entendida antes de seguir.

- [ ] **Step 3: Commit**

```bash
git add scripts/verifica-capitulos.mjs
git commit -m "test: script que verifica os sete capitulos contra o filme"
```

---

### Task 3: O componente `Capitulos`

**Files:**
- Create: `components/Capitulos/Capitulos.tsx`
- Create: `components/Capitulos/Capitulos.module.css`

**Interfaces:**
- Consumes: `PLANOS` (Task 1), `world.heroProgresso` (Task 1), `WHATSAPP_URL` de `lib/clinica`, `isDesktop`/`prefersReducedMotion` de `lib/motion`.
- Produces: `export default function Capitulos(): JSX.Element` — sem props. Renderiza `[data-capitulo="1"]`…`[data-capitulo="6"]`. Escreve as CSS vars `--scrim-dir` e `--scrim-narr` em `document.documentElement` (consumidas na Task 5).

Nesta task o componente ainda **não é montado** — a Task 4 faz isso. Aqui ele só precisa compilar e passar no lint.

- [ ] **Step 1: Escrever `components/Capitulos/Capitulos.module.css`**

```css
/* camada de texto do filme: sticky dentro do hero, acima do vídeo e abaixo
   da nav */
.camada {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  pointer-events: none;
  z-index: 2;
}

.capitulo {
  position: absolute;
  top: 50%;
  width: min(46ch, 42vw);
  opacity: 0;
  color: var(--branco);
  /* o rAF escreve transform, opacity e filter. Nada de transition aqui:
     interpolar por cima do scrub deixa o texto meio quadro atrasado. */
  will-change: transform, opacity, filter;
}

.esq {
  left: var(--gutter);
}

.dir {
  right: var(--gutter);
  text-align: right;
}

/* display serif, mas menor que o H1 — ele continua sendo o topo da
   hierarquia. Sem scale na animação: em Cormorant o scale borra a serifa
   durante a interpolação. */
.linha {
  margin: 0;
  font-family: var(--display), "Cormorant Garamond", Georgia, serif;
  font-weight: 300;
  font-size: clamp(2rem, 4.2vw, 3.75rem);
  line-height: 1.04;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.apoio {
  margin: clamp(16px, 2.2vh, 26px) 0 0;
  max-width: 42ch;
  font-size: clamp(0.95rem, 1.1vw, 1.1rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.82);
}

.dir .apoio {
  margin-left: auto;
}

/* capítulo 07: o CTA volta */
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: clamp(28px, 4vh, 44px);
  /* liberado pelo rAF só enquanto o capítulo está legível — senão vira alvo
     invisível sobre o filme inteiro */
  pointer-events: inherit;
}

.dir .acoes {
  justify-content: flex-end;
}

.botao {
  display: inline-flex;
  align-items: center;
  height: 56px;
  padding-inline: 32px;
  border-radius: 2px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: background-color 0.4s var(--ease), color 0.4s var(--ease),
    border-color 0.4s var(--ease);
}

.primario {
  background: var(--petroleo);
  color: var(--branco);
}

.primario:hover {
  background: #0c3d68;
}

.ghost {
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: var(--branco);
}

.ghost:hover {
  border-color: var(--branco);
  background: rgba(255, 255, 255, 0.08);
}

/* Os dois casos em que o rAF do Capitulos.tsx desiste na entrada: sem o
   filme andando, os capítulos ficariam parados em opacity 0 para sempre —
   texto invisível e, pior, dois links de CTA alcançáveis por Tab.
   As duas queries espelham exatamente os guardas do JS (isDesktop e
   prefersReducedMotion). Se mudar um lado, mude o outro.
   O texto continua no HTML servido, que é o que os crawlers leem. */
@media (max-width: 1023px) {
  .camada {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .camada {
    display: none;
  }
}
```

- [ ] **Step 2: Escrever `components/Capitulos/Capitulos.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { PLANOS } from "@/lib/scenes";
import { world } from "@/lib/world";
import { prefersReducedMotion, isDesktop } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/clinica";
import s from "./Capitulos.module.css";

/** O texto que corre em cima do filme. Um capítulo por plano, na janela
 *  v0→v1 que o lib/scenes.ts define.
 *
 *  O capítulo 01 não está aqui: ele é o H1, vive no Hero por ser o elemento
 *  de LCP e sai pelo mesmo relógio (ver Hero.tsx).
 *
 *  Lê world.heroProgresso num rAF em vez de criar um segundo ScrollTrigger
 *  sobre o hero. Dois triggers no mesmo elemento com o Lenis no meio saem de
 *  fase; e heroProgresso, diferente de progresso, não é reescrito pelo
 *  Interlúdio mais adiante na página. */

/** fração da janela de cada capítulo gasta entrando e saindo */
const RAMPA = 0.18;
/** o texto entra 20px abaixo e sai 20px acima. Em px, não em %: o teto de
 *  24px do lib/motion vale aqui, e 20% da altura de um bloco de três linhas
 *  passaria de 60px. */
const DESLOC = 20;
/** desfoque máximo nas pontas da rampa */
const BORRAO = 6;
/** escuridão mínima do scrim narrativo, mesmo nos respiros */
const SCRIM_BASE = 0.34;

const trava = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** capítulos 02–07. O 01 é o H1 e mora no Hero. */
const CAPITULOS = PLANOS.slice(1);

export default function Capitulos() {
  const camada = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = camada.current;
    if (!node || prefersReducedMotion() || !isDesktop()) return;

    const blocos = [
      ...node.querySelectorAll<HTMLElement>("[data-capitulo]"),
    ];
    const raiz = document.documentElement;
    let raf = 0;
    // null e não `true`: o primeiro quadro precisa escrever de qualquer jeito.
    // Começando em `true`, um capítulo que nasce fora de cena nunca receberia
    // `inert`, e os dois links do capítulo 07 ficariam alcançáveis por Tab
    // desde o carregamento da página.
    const inertes: (boolean | null)[] = blocos.map(() => null);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = world.heroProgresso;

      // o scrim segue o capítulo mais forte em cena; o 01 entra na conta
      // porque o H1 também precisa de contraste
      let forca = SCRIM_BASE;

      PLANOS.forEach((plano, i) => {
        const largura = plano.v1 - plano.v0;
        const rampa = largura * RAMPA;
        const dentro = trava((p - plano.v0) / rampa);
        const fora = trava((p - (plano.v1 - rampa)) / rampa);
        const op = dentro * (1 - fora);

        if (op * plano.peso > forca) forca = op * plano.peso;

        // o plano 0 é o H1: só contribui para o scrim, quem o anima é o Hero
        if (i === 0) return;

        const el = blocos[i - 1];
        if (!el) return;

        el.style.opacity = String(op);
        // dois translateY: o primeiro em % centra o bloco na sua própria
        // altura (o CSS o ancora em top: 50%), o segundo em px é o movimento.
        // Somar os dois num valor só misturaria as unidades.
        el.style.transform = `translateY(-50%) translateY(${
          (1 - dentro) * DESLOC - fora * DESLOC
        }px)`;
        el.style.filter =
          op > 0.995 ? "none" : `blur(${((1 - dentro) + fora) * BORRAO}px)`;

        // fora de cena o capítulo não pode receber clique nem foco de
        // teclado — senão o CTA do 07 vira alvo invisível sobre o filme
        const inerte = op < 0.5;
        if (inertes[i - 1] !== inerte) {
          inertes[i - 1] = inerte;
          el.inert = inerte;
          el.style.pointerEvents = inerte ? "none" : "auto";
        }
      });

      raiz.style.setProperty("--scrim-narr", forca.toFixed(3));
      // o scrim direcional original serve só ao H1, embaixo à esquerda;
      // depois do plano 01 ele sai e o simétrico assume
      raiz.style.setProperty(
        "--scrim-dir",
        (1 - trava((p - PLANOS[0].v1 * 0.55) / (PLANOS[0].v1 * 0.45))).toFixed(3)
      );
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      raiz.style.removeProperty("--scrim-narr");
      raiz.style.removeProperty("--scrim-dir");
    };
  }, []);

  return (
    <div ref={camada} className={s.camada}>
      {CAPITULOS.map((c, i) => {
        // i é o índice dentro de CAPITULOS; o plano real é i + 1
        const plano = i + 1;
        const ultimo = plano === PLANOS.length - 1;

        return (
          <div
            key={c.nome}
            data-capitulo={plano}
            className={`${s.capitulo} ${c.lado === "dir" ? s.dir : s.esq}`}
            style={{ transform: "translateY(-50%)" }}
          >
            <p className={s.linha}>{c.linha}</p>
            {c.apoio ? <p className={s.apoio}>{c.apoio}</p> : null}

            {ultimo ? (
              <div className={s.acoes}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.botao} ${s.primario}`}
                  data-magnetico
                >
                  Agendar Consulta
                </a>
                <a
                  href="#sobre"
                  className={`${s.botao} ${s.ghost}`}
                  data-magnetico
                >
                  Conhecer a Clínica
                </a>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Esperado: sem erros.

Se `el.inert` reclamar de tipo, o `lib.dom` da sua versão de TypeScript é antigo: troque por `el.toggleAttribute("inert", inerte)`. Não use `@ts-expect-error`.

- [ ] **Step 4: Commit**

```bash
git add components/Capitulos
git commit -m "feat: camada de capitulos que corre em cima do filme"
```

---

### Task 4: Hero encolhe e monta os capítulos

**Files:**
- Modify: `components/sections/Hero/Hero.tsx:34-77` (o `useEffect`), `:79-156` (o JSX)
- Modify: `components/sections/Hero/Hero.module.css`

**Interfaces:**
- Consumes: `Capitulos` (Task 3), `PLANOS` e `world.heroProgresso` (Task 1).
- Produces: `world.heroProgresso` populado; `<Capitulos />` montado dentro da `<section data-secao="O filme">`.

O `gsap.to` de saída da copy some. No lugar entra a mesma matemática de janela que os outros capítulos usam, aplicada dentro do `onUpdate` que já existe. Motivo: hoje a copy sai em 18% do curso e o capítulo 02 entra em 14,75% — os dois ficariam legíveis ao mesmo tempo. Amarrando a saída em `PLANOS[0].v1`, o repasse é limpo e não depende da altura da viewport.

- [ ] **Step 1: Substituir o `useEffect` do Hero (linhas 34–77)**

```tsx
  // scrub: alimenta o world, que o VideoRig persegue
  useEffect(() => {
    const node = raiz.current;
    if (!node || prefersReducedMotion() || !isDesktop()) return;

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        world.progresso = p;
        world.heroProgresso = p;

        // O capítulo 01 sai no relógio dos planos, não numa porcentagem do
        // curso. Com "18% top" a copy ainda estaria legível quando o
        // capítulo 02 entrasse (v0 = 0.1475) e os dois se sobreporiam.
        // Aqui a saída começa em 55% da janela do plano 01 e termina
        // exatamente no corte para o plano 02.
        const { v1 } = PLANOS[0];
        const saida = gsap.utils.clamp(0, 1, (p - v1 * 0.55) / (v1 * 0.45));

        const el = palco.current;
        if (el) {
          el.style.opacity = String(1 - saida);
          el.style.transform = `translateY(${-saida * 40}px)`;
        }
      },
    });

    return () => {
      st.kill();
    };
  }, []);
```

- [ ] **Step 2: Ajustar os imports do Hero**

No topo do arquivo, a linha de imports do GSAP e do motion. `EASE` e `DUR` deixam de ser usados (o `gsap.to` saiu) — remova-os ou o lint acusa. Adicione `PLANOS` e o componente.

```tsx
import { world } from "@/lib/world";
import { PLANOS } from "@/lib/scenes";
import { prefersReducedMotion, isDesktop } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/clinica";
import Capitulos from "@/components/Capitulos/Capitulos";
import s from "./Hero.module.css";
```

`ScrollTrigger` e `gsap` continuam sendo usados (`gsap.utils.clamp`), mantenha os dois.

- [ ] **Step 3: Montar `<Capitulos />` no JSX**

Como irmão do `palco`, **depois** dele, ainda dentro da `<section>`. Depois porque o capítulo 02 precisa pintar por cima do resto do fade do 01.

```tsx
      <div ref={palco} className={s.palco}>
        {/* … conteúdo existente, inalterado … */}
      </div>

      <Capitulos />
    </section>
```

- [ ] **Step 4: Esconder sub, ações e indicadores no desktop**

O H1, a eyebrow e a seta ficam. O resto continua no HTML — o mobile precisa dele e o SEO também — e sai só por CSS acima de 1023px.

Adicione ao fim de `Hero.module.css`, **antes** do bloco `@media (max-width: 1023px)`:

```css
/* Desktop: a primeira dobra é uma cena, não uma landing page. Ficam a
   eyebrow, o H1 e a seta; o CTA volta em tela cheia no capítulo 07 e o
   "Agendar" da navbar cobre o intervalo.
   Estes três continuam no HTML de propósito: são o que o mobile mostra, onde
   o filme não anda. */
@media (min-width: 1024px) {
  .sub,
  .acoes,
  .indicadores {
    display: none;
  }
}
```

E ajuste o comentário do `.palco` para dizer a verdade nova — a opacidade agora vem do rAF do Hero:

```css
/* sticky em vez de pin do ScrollTrigger: menos briga com o Lenis e sem
   pin-spacer alterando a altura do documento.
   opacity e transform são escritos pelo onUpdate do Hero, no relógio do
   plano 01 — não ponha transition aqui. */
.palco {
```

- [ ] **Step 5: Rodar a verificação**

```bash
node scripts/verifica-capitulos.mjs
```

Esperado agora: **0 falhas**. Sete linhas `ok`, cada uma com o texto do capítulo certo, e seis fronteiras com `legiveis=0` ou `legiveis=1`.

- [ ] **Step 6: Olhar os PNGs — este passo não é opcional**

Abra os sete arquivos em `.artifacts/capitulos/cap-*.png`, um por um.

Para cada um, responda:
1. O frame é o plano certo? (`cap-1` tem que ser a recepção, `cap-4` o consultório, etc.)
2. O texto está legível sobre aquele frame?
3. **O texto está caindo em cima do assunto do plano?** É o risco conhecido do spec. Se em `cap-2` (O encontro, lado `dir`) a pessoa filmada estiver à direita do quadro, o texto está em cima dela.

Onde houver colisão, inverta o `lado` daquele plano em `lib/scenes.ts` e rode de novo. Repita até os sete estarem limpos. Anote no commit quais lados você inverteu e por quê.

- [ ] **Step 7: Conferir o mobile**

```bash
node scripts/verifica-scrub.mjs http://localhost:3000 390 844
```

Esperado: a dobra única de sempre, com H1, subtítulo, os dois botões e os indicadores visíveis. Nenhum capítulo. Olhe `.artifacts/scrub/scrub-0.png`.

- [ ] **Step 8: Commit**

```bash
git add components/sections/Hero lib/scenes.ts
git commit -m "feat: o hero vira sete capitulos em vez de 500vh de filme mudo"
```

---

### Task 5: O scrim para de sumir

**Files:**
- Modify: `components/VideoRig/VideoRig.tsx:119`
- Modify: `components/VideoRig/VideoRig.module.css:15-37`

**Interfaces:**
- Consumes: as CSS vars `--scrim-dir` e `--scrim-narr` que o `Capitulos` escreve em `document.documentElement` (Task 3).
- Produces: nada para tasks seguintes.

Hoje o `#alva-scrim` é direcional (pesado embaixo à esquerda, onde a copy vive) e ia a zero em 18% do curso. Com texto branco em cima do filme até o fim, isso quebra o contraste.

Refinamento sobre o spec, que dizia só "o scrim fica": com os capítulos **alternando de lado**, um scrim pesado à esquerda estaria errado metade do tempo. Então o direcional continua servindo só ao H1 e sai depois do plano 01, e um scrim **simétrico** assume dali em diante, com a força vinda do `peso` de cada plano. Efeito líquido: nunca há ausência de scrim, que era a intenção.

- [ ] **Step 1: Trocar o CSS do scrim**

Substitua o bloco `.scrim` (linhas 15–37) por:

```css
/* Dois scrims. O direcional é pesado embaixo à esquerda porque é lá que o H1
   vive, e alguns planos estouram de luz justo ali; ele sai depois do plano
   01, quando o H1 sai. O narrativo é simétrico porque os capítulos 02–07
   alternam de lado — um scrim de canto estaria errado metade do tempo.
   As duas opacidades vêm do rAF do Capitulos. Sem transition: interpolar por
   cima do scrub deixa a escuridão meio quadro atrasada. */
.scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: var(--scrim-dir, 1);
  background: linear-gradient(
      100deg,
      rgba(32, 33, 36, 0.8) 0%,
      rgba(32, 33, 36, 0.44) 34%,
      rgba(32, 33, 36, 0.06) 68%
    ),
    linear-gradient(
      to bottom,
      rgba(32, 33, 36, 0.16) 0%,
      rgba(32, 33, 36, 0) 34%,
      rgba(32, 33, 36, 0.22) 66%,
      rgba(32, 33, 36, 0.5) 100%
    );
}

.scrimNarrativo {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: var(--scrim-narr, 0);
  background: linear-gradient(
      to bottom,
      rgba(32, 33, 36, 0.42) 0%,
      rgba(32, 33, 36, 0.5) 50%,
      rgba(32, 33, 36, 0.42) 100%
    );
}
```

- [ ] **Step 2: Adicionar o elemento no `VideoRig.tsx`**

Logo depois do `#alva-scrim` (linha 119):

```tsx
      <div id="alva-scrim" className={s.scrim} />
      <div className={s.scrimNarrativo} />
      <div className={s.vinheta} />
```

- [ ] **Step 3: Rodar a verificação e medir contraste**

```bash
node scripts/verifica-capitulos.mjs
```

Depois abra cada `cap-*.png` e verifique o texto branco contra o frame. O critério é AA (4.5:1 para o apoio, 3:1 para a linha display que passa de 24px).

Onde não passar, suba o `peso` daquele plano em `lib/scenes.ts` (máximo 1) e rode de novo. Não mexa no gradiente para resolver um plano só — é para isso que o `peso` existe.

- [ ] **Step 4: Confirmar que o `#alva-scrim` não é mais apagado por ninguém**

```bash
grep -rn "alva-scrim" --include=*.tsx --include=*.css components app
```

Esperado: só duas ocorrências — a declaração no `VideoRig.tsx` e nada mais. Se o `Hero.tsx` ainda aparecer, a Task 4 Step 1 não foi aplicada por inteiro.

- [ ] **Step 5: Commit**

```bash
git add components/VideoRig
git commit -m "fix: o scrim para de sumir aos 18% e vira simetrico nos capitulos"
```

---

### Task 6: O cursor vira dente

**Files:**
- Modify: `components/Cursor/Cursor.tsx`
- Modify: `components/Cursor/Cursor.module.css`

**Interfaces:**
- Consumes: nada das tasks anteriores.
- Produces: nada para tasks seguintes.

Silhueta de incisivo central preenchida. Mantém `mix-blend-mode: difference`, o lerp de 0.15, o puxão de `[data-magnetico]` e a expansão com rótulo em `[data-cursor]`. Sai o ponto central de 4px: com forma cheia ele vira sujeira.

Só existe um rótulo no site hoje (`data-cursor="ver"` em `Tour.tsx:36`), de três letras — cabe na coroa.

- [ ] **Step 1: Reescrever `Cursor.module.css`**

```css
/* Incisivo central: coroa larga de cantos arredondados, duas raízes com o
   sulco no meio. mix-blend-mode difference mantém a leitura tanto sobre os
   planos estourados de luz quanto sobre o grafite das seções claras. */
.dente {
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 26px;
  margin: -13px 0 0 -10px;
  pointer-events: none;
  z-index: 90;
  mix-blend-mode: difference;
  opacity: 0;
  transition: width 0.35s var(--ease), height 0.35s var(--ease),
    margin 0.35s var(--ease), opacity 0.3s linear;
  will-change: transform;
}

.svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: rgba(255, 255, 255, 0.92);
}

.visivel {
  opacity: 1;
}

/* expandido: a coroa cresce o bastante para o rótulo caber dentro dela */
.expandido {
  width: 56px;
  height: 72px;
  margin: -36px 0 0 -28px;
}

/* o rótulo vive na coroa, não no centro geométrico — a metade de baixo é
   raiz e afina */
.rotulo {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--grafite);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.25s linear;
  mix-blend-mode: normal;
}

.expandido .rotulo {
  opacity: 1;
}

@media (pointer: coarse) {
  .dente {
    display: none;
  }
}
```

- [ ] **Step 2: Reescrever `Cursor.tsx`**

O bloco do `useEffect` é o de hoje sem a linha do `ponto`. O JSX troca o anel pelo SVG.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Cursor.module.css";

/** Incisivo central que persegue o ponteiro com lerp. Sobre [data-cursor]
 *  cresce e mostra o rótulo na coroa; sobre [data-magnetico] puxa o próprio
 *  elemento até 8px. Desligado em touch e em reduced-motion.
 *
 *  O ponto de precisão de 4px que existia junto com o anel saiu: com a forma
 *  cheia ele virava sujeira. */
const DENTE =
  "M4 6 C4 2.5 7 1 12 1 C17 1 20 2.5 20 6 C20 11 18.4 15 17.2 20 " +
  "C16.3 24 15.8 30 14.2 30 C12.9 30 12.5 25 12 22 C11.5 25 11.1 30 9.8 30 " +
  "C8.2 30 7.7 24 6.8 20 C5.6 15 4 11 4 6 Z";

export default function Cursor() {
  const dente = useRef<HTMLDivElement>(null);
  const [rotulo, setRotulo] = useState("");
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const alvo = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const suave = { ...alvo };
    let raf = 0;
    let magnetico: HTMLElement | null = null;

    const mover = (e: PointerEvent) => {
      alvo.x = e.clientX;
      alvo.y = e.clientY;
      setAtivo(true);

      const sob = (e.target as HTMLElement)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      setRotulo(sob?.dataset.cursor ?? "");

      const mag = (e.target as HTMLElement)?.closest?.(
        "[data-magnetico]"
      ) as HTMLElement | null;

      if (magnetico && magnetico !== mag) {
        magnetico.style.transform = "";
        magnetico.style.transition = "transform .5s var(--ease)";
      }
      magnetico = mag;

      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const limite = 8;
        mag.style.transition = "transform .18s linear";
        mag.style.transform = `translate(${Math.max(
          -limite,
          Math.min(limite, dx * 0.25)
        )}px, ${Math.max(-limite, Math.min(limite, dy * 0.25))}px)`;
      }
    };

    const sair = () => setAtivo(false);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      suave.x += (alvo.x - suave.x) * 0.15;
      suave.y += (alvo.y - suave.y) * 0.15;
      if (dente.current) {
        dente.current.style.transform = `translate3d(${suave.x}px, ${suave.y}px, 0)`;
      }
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", sair);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", sair);
      if (magnetico) magnetico.style.transform = "";
    };
  }, []);

  const expandido = rotulo.length > 0;

  return (
    <div
      ref={dente}
      aria-hidden
      className={`${s.dente} ${ativo ? s.visivel : ""} ${
        expandido ? s.expandido : ""
      }`}
    >
      <svg className={s.svg} viewBox="0 0 24 32">
        <path d={DENTE} />
      </svg>
      <span className={s.rotulo}>{rotulo}</span>
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 4: Olhar o dente**

O Playwright não desenha o cursor do SO, mas este é um elemento DOM — ele aparece no screenshot desde que o ponteiro tenha se movido. Crie e rode:

```bash
node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  await p.mouse.move(700, 450);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '.artifacts/cursor-normal.png' });
  await p.evaluate(() => document.querySelector('#tour')?.scrollIntoView());
  await p.waitForTimeout(2000);
  const alvo = await p.locator('[data-cursor]').first().boundingBox();
  if (alvo) await p.mouse.move(alvo.x + alvo.width / 2, alvo.y + alvo.height / 2);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '.artifacts/cursor-expandido.png' });
  await b.close();
});
"
```

Abra os dois PNGs. Em `cursor-normal.png`, ampliando na posição (700, 450): a forma tem que ler como dente, não como gota nem como escudo. Em `cursor-expandido.png`: o "VER" tem que estar dentro da coroa, não em cima da raiz.

Se a silhueta não convencer, ajuste o `DENTE` — os pontos que mais importam são a largura da coroa (o `4` e o `20` em x) e a profundidade do sulco entre as raízes (o `12 22` no meio).

- [ ] **Step 5: Commit**

```bash
git add components/Cursor
git commit -m "feat: o cursor vira silhueta de incisivo"
```

---

### Task 7: Fechamento — build, Lighthouse e a passagem completa

**Files:** nenhum, a menos que algo falhe.

- [ ] **Step 1: Build de produção**

```bash
npm run build
```

Esperado: sem erros e sem warnings novos.

- [ ] **Step 2: Verificação completa contra o build**

```bash
npm run start
```

Noutro terminal:

```bash
node scripts/verifica-capitulos.mjs http://localhost:3000
node scripts/verifica-scrub.mjs http://localhost:3000
node scripts/verifica-secoes.mjs http://localhost:3000
node scripts/verifica-interludio.mjs http://localhost:3000
```

Os dois últimos são regressão: o `Interludio` mexe em `world.progresso` e precisa continuar reencontrando o plano 07 sem que os capítulos reapareçam por cima dele. Se `verifica-interludio` acusar texto de capítulo em cena, o `heroProgresso` da Task 1 não está sendo respeitado em algum ponto.

- [ ] **Step 3: Lighthouse**

Rode o Lighthouse do Chrome DevTools em modo desktop contra `http://localhost:3000` (build de produção, não `npm run dev`).

Meta: **≥95 em Performance**. Os sete blocos de texto estão sempre no DOM e só mudam opacidade, então não deveria custar nada. Se caiu:
- Suspeite primeiro do `filter: blur()`. O código já o desliga quando `op > 0.995`; se ainda pesar, baixe `BORRAO` de 6 para 3 em `Capitulos.tsx`.
- Confirme que o `will-change` do `.capitulo` não está promovendo sete camadas grandes ao mesmo tempo. Se estiver, tire `filter` da lista do `will-change`.

Anote o número real no `README.md`, junto das notas de Lighthouse que já estão lá. Não anote o número que você esperava.

- [ ] **Step 4: Passagem humana**

Abra `http://localhost:3000` e role o hero inteiro, devagar, com o mouse. Confira:
- Os sete capítulos entram e saem no ritmo do filme, sem nenhum instante de tela sem texto entre um e outro que pareça esquecimento (os respiros do 01 e do 04 são intencionais — mas o corte entre capítulos não deve piscar).
- O CTA do capítulo 07 é clicável quando visível e **não** é clicável antes.
- `Tab` a partir do topo não pega os links do capítulo 07 enquanto ele está invisível.
- O dente segue o ponteiro sem tremer.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "docs: registra as notas de Lighthouse do hero narrativo"
```

---

## Self-review

**Cobertura do spec.** Cada seção do spec e a task que a implementa:

| Spec | Task |
|---|---|
| Os sete capítulos (tabela de copy) | 1 |
| Nota editorial | 1 (comentário no `scenes.ts`) |
| Primeira dobra limpa, CTA no 07 | 4 (CSS), 3 (o CTA) |
| Ancoragem alternando + risco de colisão | 1 (`lado`), 4 Step 6 (calibração) |
| `components/Capitulos/` | 3 |
| `Hero` encolhe | 4 |
| Scrim para de sumir | 5 |
| Cursor de dente | 6 |
| Mobile e reduced-motion | 3 (guarda no JS + `@media` no CSS), 4 Step 7 (verificação) |
| Verificação por Playwright | 2, 4 Step 6, 5 Step 3, 6 Step 4, 7 |
| Lighthouse ≥95 | 7 Step 3 |
| Fora de escopo (vídeo, `Cta`, `Interludio`, `Arco`) | nenhuma task os toca; 7 Step 2 verifica a não-regressão |

**Nomes usados entre tasks.** `world.heroProgresso` (T1→T3, T4), `PLANOS[].lado/peso/linha/apoio` (T1→T3, T5), `[data-capitulo]` (T3→T2), `--scrim-dir`/`--scrim-narr` (T3→T5), `data-secao="O filme"` (existente→T2). Conferidos.

**Desvio consciente do spec, registrado aqui:** o spec dizia "o scrim para de sumir". A Task 5 mantém o scrim direcional saindo depois do plano 01 e faz um scrim simétrico assumir no lugar. O motivo é a ancoragem alternada, decidida depois: um scrim de canto esquerdo estaria errado nos capítulos 03, 05 e 07. A intenção do spec — nunca haver texto branco sem escuridão embaixo — é cumprida.
