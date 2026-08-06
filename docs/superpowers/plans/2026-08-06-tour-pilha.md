# Tour em pilha — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o grid de seis fotos com lightbox da seção Tour por uma pilha
de quatro cartões que grudam no topo, cada um contando um fato concreto sobre
o espaço da clínica.

**Architecture:** `position: sticky` com `top` progressivo faz o empilhamento
em CSS puro — sobrevive sem JavaScript. O GSAP entra só para o scrub: enquanto
o próximo cartão sobe, o atual cresce de 1 para 1,05 e cai para 0,45 de
opacidade. Um `ScrollTrigger` por cartão, disparado pelo cartão seguinte, o
que evita medir um elemento sticky (que mente sobre a própria posição).

**Tech Stack:** Next.js 16 App Router, React 19, GSAP ScrollTrigger, CSS
Modules, Playwright para verificação.

**Spec:** `docs/superpowers/specs/2026-08-06-tour-pilha-design.md`

## Global Constraints

- Ouro (`#C9A961`) só como fio de 1px ou caixa alta ≥14px peso 500. Nunca
  preenchimento, nunca botão sólido dourado.
- O site é escuro do topo ao rodapé. `--fundo` (#1A1A1A) é o piso,
  `--superficie` (#272726) é o único degrau acima dele.
- Sem Framer Motion. GSAP + CSS apenas.
- Proibido no texto: "excelência", "soluções personalizadas", "compromisso com
  o seu sorriso". Frases curtas, um detalhe concreto por parágrafo.
- Um componente por pasta, com seu `.module.css` ao lado. Arquivo de seção que
  passa de ~200 linhas vira subcomponente.
- Nada de escrever arquivo por redirecionamento do PowerShell (`>`,
  `Out-File`, `Set-Content`): gera BOM e quebra o parser. Use a ferramenta de
  escrita de arquivo.
- Verificação visual se faz com screenshot do Playwright **olhado de verdade**.
  Code review e `curl` não valem.
- O servidor de verificação roda em `http://localhost:3001` nesta máquina
  (`next start -p 3001`). Os scripts aceitam a URL como primeiro argumento.

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `lib/conteudo.ts` | `TOUR` cai para 4 entradas, ganha `titulo` e `texto`, perde `area` e `legenda` |
| `components/sections/Tour/Tour.tsx` | Monta o cabeçalho e a pilha; registra os ScrollTriggers |
| `components/sections/Tour/Tour.module.css` | Seção em `--fundo`, geometria da pilha |
| `components/sections/Tour/CardTour/CardTour.tsx` | Um cartão: foto, rótulo, linha |
| `components/sections/Tour/CardTour/CardTour.module.css` | Aparência do cartão |
| `components/sections/Tour/Lightbox.tsx` | **removido** |
| `components/sections/Tour/Lightbox.module.css` | **removido** |
| `scripts/verifica-tour.mjs` | Mede a pilha e tira os screenshots |

---

### Task 1: Conteúdo — TOUR vira quatro cômodos com texto

**Files:**
- Modify: `lib/conteudo.ts:178-185`

**Interfaces:**
- Produces: `TOUR`, array de 4 objetos com as chaves `src: string`,
  `titulo: string`, `texto: string`. As Tasks 3, 4 e 5 consomem exatamente
  esses nomes. As chaves `legenda` e `area` deixam de existir.

- [ ] **Step 1: Substituir o bloco TOUR**

Trocar as linhas 178-185 de `lib/conteudo.ts` por:

```ts
/** Quatro cômodos, não seis. Instrumental é um close e não uma sala; Fachada
 *  colide com o plano 01 do hero, que já abre na porta.
 *
 *  Os textos falam do espaço — luz, orientação, material. O processo é
 *  assunto do hero (lib/scenes.ts). Nenhuma frase se repete entre os dois. */
export const TOUR = [
  {
    src: "/img/tour-01.webp",
    titulo: "Recepção",
    texto: "Seis poltronas. Raramente duas ocupadas ao mesmo tempo.",
  },
  {
    src: "/img/tour-02.webp",
    titulo: "Sala de espera",
    texto:
      "A luz entra pelo leste. Às nove da manhã ela chega no chão de tábua corrida.",
  },
  {
    src: "/img/tour-03.webp",
    titulo: "Consultório 1",
    texto:
      "A cadeira fica de costas para a janela. Você olha para a árvore, não para o refletor.",
  },
  {
    src: "/img/tour-04.webp",
    titulo: "Sala do escâner",
    texto:
      "A única sala sem janela. Escuro por projeto — a tela precisa ser a coisa mais clara do ambiente.",
  },
] as const;
```

- [ ] **Step 2: Verificar que o TypeScript acusa o consumidor quebrado**

Run: `npx tsc --noEmit`
Expected: FAIL, com erros em `components/sections/Tour/Tour.tsx` sobre
`f.legenda` e `f.area` não existirem. Isso confirma que a Task 1 chegou onde
precisava — o Tour antigo depende das chaves que acabaram de sair.

- [ ] **Step 3: Commit**

```bash
git add lib/conteudo.ts
git commit -m "content: o Tour passa a falar do espaco, em quatro comodos"
```

---

### Task 2: O verificador, antes da implementação

**Files:**
- Create: `scripts/verifica-tour.mjs`

**Interfaces:**
- Consumes: nada do código de aplicação ainda.
- Produces: o contrato que as Tasks 3-5 têm que satisfazer. O script exige no
  DOM: exatamente 4 elementos `[data-card]` dentro de `#tour`, cada um com
  `position: sticky` e `top` crescente de 14px em 14px, e nenhum
  `[data-lightbox]` na página.

- [ ] **Step 1: Escrever o script**

Criar `scripts/verifica-tour.mjs`:

```js
/**
 * A pilha do Tour: mede o que não dá para ver em code review — se os cartões
 * realmente grudam, se o top escalona, e se o anterior apaga quando o
 * seguinte sobe.
 *
 * Sai com código 1 se algum critério falhar. Os screenshots continuam sendo
 * julgados por gente: o critério de "está bonito" não é automatizável.
 *
 * Uso: node scripts/verifica-tour.mjs [url]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3001";
const SAIDA = ".artifacts/tour";

const navegador = await chromium.launch();
await mkdir(SAIDA, { recursive: true });

const pagina = await navegador.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await pagina.waitForTimeout(3000);

const falhas = [];
const ok = (cond, msg) => {
  console.log(`${cond ? "  ok  " : " FALHA"} ${msg}`);
  if (!cond) falhas.push(msg);
};

// 1. estrutura
const estrutura = await pagina.evaluate(() => {
  const secao = document.querySelector("#tour");
  if (!secao) return null;
  const cards = [...secao.querySelectorAll("[data-card]")];
  return {
    total: cards.length,
    sticky: cards.map((c) => getComputedStyle(c).position),
    tops: cards.map((c) => getComputedStyle(c).top),
    lightbox: !!document.querySelector("[data-lightbox]"),
    botoes: secao.querySelectorAll("button").length,
  };
});

ok(estrutura !== null, "seção #tour existe");
if (!estrutura) {
  console.log("\nsem #tour, nada a medir");
  await navegador.close();
  process.exit(1);
}

ok(estrutura.total === 4, `4 cartões (achei ${estrutura.total})`);
ok(
  estrutura.sticky.every((p) => p === "sticky"),
  `todos sticky (achei ${estrutura.sticky.join(", ")})`,
);
ok(!estrutura.lightbox, "nenhum lightbox no DOM");
ok(estrutura.botoes === 0, `nenhum botão na pilha (achei ${estrutura.botoes})`);

// o top escalona de 14px em 14px
const tops = estrutura.tops.map((t) => parseFloat(t));
const degraus = tops.slice(1).map((t, i) => Math.round(t - tops[i]));
ok(
  degraus.every((d) => d === 14),
  `top escalona 14px (achei ${degraus.join(", ")})`,
);

// 2. comportamento: o anterior apaga quando o seguinte gruda
const topoSecao = await pagina.evaluate(
  () => document.querySelector("#tour").getBoundingClientRect().top + scrollY,
);
const alturaCard = await pagina.evaluate(
  () => document.querySelector("[data-card]").getBoundingClientRect().height,
);

const medir = async (y) => {
  await pagina.evaluate((v) => scrollTo(0, v), y);
  await pagina.waitForTimeout(900);
  return pagina.evaluate(() =>
    [...document.querySelectorAll("[data-card]")].map((c) => ({
      opacidade: Number(getComputedStyle(c).opacity).toFixed(2),
      matriz: getComputedStyle(c).transform,
    })),
  );
};

// posição em que o cartão 02 já cobriu o 01
const y2 = topoSecao + alturaCard * 1.6;
const estado = await medir(y2);
ok(
  Number(estado[0].opacidade) < 0.6,
  `cartão 01 apagado quando o 02 sobe (opacidade ${estado[0].opacidade})`,
);
ok(
  estado[0].matriz !== "none",
  `cartão 01 recebeu transform (achei ${estado[0].matriz})`,
);

// 3. screenshots para olho humano
const paradas = [0, 0.9, 1.8, 2.7];
for (const [i, p] of paradas.entries()) {
  await pagina.evaluate((v) => scrollTo(0, v), topoSecao + alturaCard * p);
  await pagina.waitForTimeout(1200);
  await pagina.screenshot({
    path: `${SAIDA}/pilha-${String(i + 1).padStart(2, "0")}.png`,
  });
}
console.log(`\n${paradas.length} screenshots em ${SAIDA}/ — olhe um a um`);

// 4. reduced-motion desmonta a pilha
const p2 = await navegador.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
await p2.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p2.waitForTimeout(3000);
const rm = await p2.evaluate(() =>
  [...document.querySelectorAll("#tour [data-card]")].map(
    (c) => getComputedStyle(c).position,
  ),
);
ok(
  rm.length === 4 && rm.every((p) => p === "static"),
  `com reduced-motion a pilha desmonta (achei ${rm.join(", ")})`,
);
await p2.screenshot({ path: `${SAIDA}/reduced-motion.png`, fullPage: false });

await navegador.close();

if (falhas.length) {
  console.log(`\n${falhas.length} falha(s)`);
  process.exit(1);
}
console.log("\ntudo passou (o julgamento visual continua sendo seu)");
```

- [ ] **Step 2: Rodar contra a implementação atual e ver falhar**

Run: `node scripts/verifica-tour.mjs http://localhost:3001`
Expected: FAIL. `4 cartões (achei 0)`, `top escalona 14px (achei )` e
`nenhum botão na pilha (achei 6)` — o grid antigo ainda está no ar.

- [ ] **Step 3: Commit**

```bash
git add scripts/verifica-tour.mjs
git commit -m "test: verificador da pilha do Tour, falhando contra o grid"
```

---

### Task 3: O cartão

**Files:**
- Create: `components/sections/Tour/CardTour/CardTour.tsx`
- Create: `components/sections/Tour/CardTour/CardTour.module.css`

**Interfaces:**
- Consumes: as chaves `src`, `titulo`, `texto` de `TOUR` (Task 1).
- Produces: `CardTour`, default export. Props:
  `{ src: string; titulo: string; texto: string; indice: number; prioridade?: boolean }`.
  Renderiza um `<figure data-card style={{ "--i": indice }}>`. A Task 4 passa
  `indice` e usa `[data-card]` para achar os cartões; a Task 5 anima esse
  mesmo nó.

- [ ] **Step 1: Escrever o componente**

Criar `components/sections/Tour/CardTour/CardTour.tsx`:

```tsx
import Image from "next/image";
import type { CSSProperties } from "react";
import s from "./CardTour.module.css";

type Props = {
  src: string;
  titulo: string;
  texto: string;
  /** posição na pilha: alimenta o --i que escalona o top do sticky */
  indice: number;
  /** só o primeiro cartão; os outros entram lazy */
  prioridade?: boolean;
};

export default function CardTour({
  src,
  titulo,
  texto,
  indice,
  prioridade = false,
}: Props) {
  return (
    <figure
      className={s.card}
      data-card={indice}
      style={{ "--i": indice } as CSSProperties}
    >
      <Image
        className={s.foto}
        src={src}
        alt={`${titulo} da clínica ALVA`}
        width={1400}
        height={1400}
        sizes="(max-width: 899px) 92vw, 68vw"
        priority={prioridade}
      />
      <figcaption className={s.legenda}>
        <span className={s.rotulo}>{titulo}</span>
        <p className={s.texto}>{texto}</p>
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 2: Escrever o CSS**

Criar `components/sections/Tour/CardTour/CardTour.module.css`:

```css
/* O cartão é o degrau: a seção é --fundo, ele é --superficie. Sem esse
   degrau ele não lê como objeto sobre uma superfície, lê como um retângulo
   do mesmo tom. */
.card {
  position: sticky;
  /* 12vh de respiro no topo, mais 14px por cartão: é o escalonamento que
     deixa a borda do anterior aparecendo embaixo do seguinte */
  top: calc(12svh + var(--i) * 14px);
  display: grid;
  grid-template-rows: 1fr auto;
  height: 74svh;
  margin: 0;
  overflow: hidden;
  border-radius: 6px;
  background: var(--superficie);
  /* o fio de ouro mora aqui, com 1px, como manda a regra */
  border-top: 1px solid var(--ouro);
  transform-origin: 50% 20%;
  will-change: transform, opacity;
}

.foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.legenda {
  display: grid;
  gap: 10px;
  padding: clamp(20px, 3vw, 34px) clamp(20px, 3vw, 38px);
}

.rotulo {
  /* caixa alta em 14px peso 500 — a segunda forma permitida do ouro */
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ouro);
}

.texto {
  margin: 0;
  max-width: 46ch;
  color: var(--texto);
}

@media (max-width: 899px) {
  .card {
    height: 66svh;
  }
  .texto {
    font-size: 0.94rem;
  }
}

/* Sem movimento: a pilha desmonta e vira lista. Não basta matar o scrub —
   sticky sozinho já é movimento. */
@media (prefers-reduced-motion: reduce) {
  .card {
    position: static;
    height: auto;
    transform: none;
    opacity: 1;
  }
  .foto {
    height: auto;
    aspect-ratio: 4 / 3;
  }
}
```

- [ ] **Step 3: Confirmar que compila**

Run: `npx tsc --noEmit`
Expected: os erros de `f.legenda`/`f.area` em `Tour.tsx` **continuam** (a
Task 4 os resolve), e **nenhum erro novo** vindo de `CardTour.tsx`.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Tour/CardTour
git commit -m "feat: o cartao do Tour, com fio de ouro e rotulo em caixa alta"
```

---

### Task 4: A pilha substitui o grid, e o lightbox morre

**Files:**
- Modify: `components/sections/Tour/Tour.tsx` (reescrita completa)
- Modify: `components/sections/Tour/Tour.module.css` (reescrita completa)
- Delete: `components/sections/Tour/Lightbox.tsx`
- Delete: `components/sections/Tour/Lightbox.module.css`

**Interfaces:**
- Consumes: `TOUR` (Task 1), `CardTour` (Task 3).
- Produces: a seção `#tour` com `[data-card]` × 4. A Task 5 acrescenta o
  `useEffect` do GSAP neste mesmo arquivo.

- [ ] **Step 1: Reescrever Tour.tsx**

Substituir todo o conteúdo de `components/sections/Tour/Tour.tsx` por:

```tsx
import Reveal from "@/components/ui/Reveal/Reveal";
import { TOUR } from "@/lib/conteudo";
import CardTour from "./CardTour/CardTour";
import s from "./Tour.module.css";

export default function Tour() {
  return (
    <section id="tour" className={s.secao} data-secao="Tour">
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">A clínica por dentro</span>
        </Reveal>
        <Reveal as="h2" modo="palavras" delay={0.05} className={s.titulo}>
          Madeira, vidro e luz da manhã.
        </Reveal>

        <div className={s.pilha}>
          {TOUR.map((c, i) => (
            <CardTour
              key={c.src}
              src={c.src}
              titulo={c.titulo}
              texto={c.texto}
              indice={i}
              prioridade={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Nota: o componente deixa de ser `"use client"` nesta task — sem estado, sem
lightbox, ele volta a ser Server Component. A Task 5 o traz de volta para
cliente ao adicionar o GSAP.

- [ ] **Step 2: Reescrever Tour.module.css**

Substituir todo o conteúdo de `components/sections/Tour/Tour.module.css` por:

```css
/* A seção volta para --fundo: quem é --superficie agora é o cartão. */
.secao {
  position: relative;
  z-index: 1;
  background: var(--fundo);
  padding-block: clamp(88px, 14vh, 168px);
}

.titulo {
  margin-top: 20px;
  max-width: 16ch;
  margin-bottom: clamp(44px, 7vh, 78px);
}

/* Sem gap: os cartões precisam se encostar para um cobrir o outro. O espaço
   entre eles é o próprio scroll, não margem. */
.pilha {
  display: flex;
  flex-direction: column;
  gap: 0;
  /* respiro no fim, senão o último cartão descola antes de terminar de ser
     lido e o FAQ entra por baixo dele */
  padding-bottom: 18svh;
}

@media (prefers-reduced-motion: reduce) {
  .pilha {
    gap: clamp(24px, 5vh, 56px);
    padding-bottom: 0;
  }
}
```

- [ ] **Step 3: Apagar o lightbox**

```bash
git rm components/sections/Tour/Lightbox.tsx components/sections/Tour/Lightbox.module.css
```

- [ ] **Step 4: Verificar que compila limpo**

Run: `npx tsc --noEmit`
Expected: PASS, sem erros. Os erros de `f.legenda`/`f.area` sumiram junto com
o grid.

- [ ] **Step 5: Rebuildar e rodar o verificador**

```bash
npm run build
```

Reiniciar o servidor da 3001 e rodar:
`node scripts/verifica-tour.mjs http://localhost:3001`

Expected: passam `4 cartões`, `todos sticky`, `top escalona 14px`, `nenhum
lightbox`, `nenhum botão`. **Falha** `cartão 01 recebeu transform` — o GSAP
ainda não existe. Essa é a única falha esperada.

- [ ] **Step 6: Commit**

```bash
git add components/sections/Tour lib/conteudo.ts
git commit -m "feat: o grid do Tour vira pilha, e o lightbox sai junto"
```

---

### Task 5: O scrub

**Files:**
- Modify: `components/sections/Tour/Tour.tsx`

**Interfaces:**
- Consumes: `[data-card]` renderizado pela Task 4, `prefersReducedMotion` de
  `@/lib/motion`.
- Produces: nada que outra task consuma. É a última peça de código.

- [ ] **Step 1: Adicionar o useEffect do GSAP**

Substituir todo o conteúdo de `components/sections/Tour/Tour.tsx` por:

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/ui/Reveal/Reveal";
import { TOUR } from "@/lib/conteudo";
import { prefersReducedMotion } from "@/lib/motion";
import CardTour from "./CardTour/CardTour";
import s from "./Tour.module.css";

export default function Tour() {
  const pilha = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = pilha.current;
    if (!node || prefersReducedMotion()) return;

    const cards = [...node.querySelectorAll<HTMLElement>("[data-card]")];
    // o último não recua: não há cartão depois dele para cobri-lo
    const gatilhos = cards.slice(0, -1).map((card, i) =>
      gsap.fromTo(
        card,
        { scale: 1, opacity: 1 },
        {
          scale: 1.05,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: {
            // o gatilho é o cartão SEGUINTE, nunca o próprio: um elemento
            // sticky mente sobre a própria posição e o ScrollTrigger mede a
            // mentira
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top 12%",
            scrub: true,
          },
        },
      ),
    );

    return () => {
      gatilhos.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <section id="tour" className={s.secao} data-secao="Tour">
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">A clínica por dentro</span>
        </Reveal>
        <Reveal as="h2" modo="palavras" delay={0.05} className={s.titulo}>
          Madeira, vidro e luz da manhã.
        </Reveal>

        <div ref={pilha} className={s.pilha}>
          {TOUR.map((c, i) => (
            <CardTour
              key={c.src}
              src={c.src}
              titulo={c.titulo}
              texto={c.texto}
              indice={i}
              prioridade={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Registrar o plugin logo abaixo dos imports, como fazem `Diferenciais.tsx` e
`Jornada.tsx`:

```tsx
gsap.registerPlugin(ScrollTrigger);
```

- [ ] **Step 2: Rebuildar**

```bash
npm run build
```
Expected: build limpo.

- [ ] **Step 3: Rodar o verificador inteiro**

Reiniciar o servidor da 3001 e rodar:
`node scripts/verifica-tour.mjs http://localhost:3001`

Expected: PASS em todos os critérios, incluindo `cartão 01 apagado quando o 02
sobe` e `com reduced-motion a pilha desmonta`.

- [ ] **Step 4: Olhar os screenshots**

Abrir `.artifacts/tour/pilha-01.png` até `pilha-04.png` e
`reduced-motion.png`, **um a um**. Critérios humanos:

- a borda dourada do cartão anterior aparece embaixo do seguinte (o
  escalonamento de 14px está visível, não é teoria)
- o texto não cai em cima de assunto importante da foto
- o cartão que recua ainda se lê como cartão, não como mancha
- em reduced-motion são quatro fotos empilhadas, sem sobreposição

Se algum critério falhar, ajustar `top`, `height` ou o `end` do ScrollTrigger
e repetir. **Não seguir adiante com screenshot não olhado.**

- [ ] **Step 5: Commit**

```bash
git add components/sections/Tour/Tour.tsx
git commit -m "feat: o scrub da pilha, disparado pelo cartao seguinte"
```

---

### Task 6: Verificação de regressão e integração

**Files:**
- Nenhum. Esta task só mede.

**Interfaces:**
- Consumes: tudo das Tasks 1-5.

- [ ] **Step 1: Contraste**

Run: `node scripts/verifica-contraste.mjs http://localhost:3001`
Expected: nenhum nó reprovado. O texto do cartão está sobre `--superficie`,
que é composição nova nesta seção — é exatamente o modo de falha silencioso
que esse script existe para pegar.

- [ ] **Step 2: As seções vizinhas não quebraram**

Run: `node scripts/verifica-secoes.mjs http://localhost:3001`
Expected: gera os screenshots de todas as seções. Olhar em especial
`desktop-*-tour.png` e a seção imediatamente seguinte (FAQ): a pilha muda a
altura da página e o FAQ é quem entra por baixo dela.

- [ ] **Step 3: Lighthouse não regrediu**

A meta do projeto é ≥95. A pilha troca seis imagens por quatro e mata o
lightbox, então a expectativa é neutra ou melhor. Medir e registrar o número.

- [ ] **Step 4: Commit de qualquer ajuste**

Se as etapas 1-3 pediram correção, commitar com mensagem descrevendo o que a
medição mostrou — não "ajustes finais".

---

## Self-Review

**Cobertura da spec:**

| Seção da spec | Task |
|---|---|
| §4 Curadoria — 4 cômodos | Task 1 |
| §5 Texto — as quatro linhas | Task 1 |
| §5 Cabeçalho mantém Reveal | Task 4 Step 1 |
| §6 Sticky com top progressivo | Task 3 Step 2 |
| §6 GSAP scrub 1→1,05 e 1→0,45 | Task 5 Step 1 |
| §7 Seção `--fundo`, cartão `--superficie` | Task 4 Step 2 + Task 3 Step 2 |
| §7 Fio de 1px e rótulo 14px/500 | Task 3 Step 2 |
| §8 CardTour em pasta própria | Task 3 |
| §8 Lightbox removido | Task 4 Step 3 |
| §8 TOUR sem `area` | Task 1 |
| §9 reduced-motion desmonta | Task 3 Step 2 + Task 5 Step 1 |
| §9 `<figure>`/`<figcaption>`, sem botão | Task 3 Step 1 |
| §9 alt real | Task 3 Step 1 |
| §10 contraste, screenshots, build | Tasks 5 e 6 |

Sem lacunas.

**Consistência de tipos:** `TOUR` produz `src`/`titulo`/`texto` (Task 1);
`CardTour` consome `src`/`titulo`/`texto`/`indice`/`prioridade` (Task 3); o
Tour passa exatamente esses cinco (Tasks 4 e 5). O seletor `[data-card]` é
escrito na Task 3 e lido nas Tasks 2 e 5, com o mesmo nome.

**Risco conhecido:** o `end: "top 12%"` do ScrollTrigger e o
`top: calc(12svh + …)` do CSS expressam a mesma linha da tela em unidades
diferentes (porcentagem da viewport vs. svh). Em navegador com barra de URL
retrátil os dois divergem alguns pixels. A consequência é cosmética — o fade
termina um instante antes ou depois do encaixe — e o Step 4 da Task 5 é onde
isso se vê. Não vale acoplar os dois valores por JavaScript antes de olhar.
