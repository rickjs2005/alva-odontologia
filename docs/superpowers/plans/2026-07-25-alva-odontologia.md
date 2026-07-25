# ALVA Odontologia — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site institucional da clínica fictícia ALVA Odontologia como peça de vitrine da MilWeb, com hero de vídeo cinematográfico scrubado pelo scroll e acabamento de agência internacional.

**Architecture:** Next.js App Router com uma única rota (`/`) composta por seções isoladas em `components/sections/`. O ativo central é um vídeo fullscreen fixo atrás da página cujo `currentTime` é perseguido com damping a partir do progresso do scroll. Um motivo gráfico único — o arco dourado — aparece em três modos. O fundo do `<body>` é interpolado ao longo do scroll para que a página clareie do grafite ao branco.

**Tech Stack:** Next.js (App Router, TypeScript, Turbopack) · Tailwind v4 (só tokens) · CSS Modules · GSAP 3 (ScrollTrigger, SplitText) · Lenis · `next/font/local` · Playwright (verificação visual) · ffmpeg (encode do vídeo) · Higgsfield MCP (geração de assets)

Spec de referência: `docs/superpowers/specs/2026-07-25-alva-odontologia-design.md`

## Global Constraints

- **Diretório do projeto:** `C:\Users\rickj\projetos\alva-odontologia` (repo git já iniciado, com o spec commitado).
- **Leia os docs do Next instalado antes de escrever código:** `node_modules/next/dist/docs/`. A versão instalada tem breaking changes em relação ao conhecimento de treino.
- **Nunca escrever arquivo por redirecionamento do PowerShell** (`>`, `Out-File`, `Set-Content`): gera BOM que quebra o parser. Sempre usar a ferramenta Write.
- **Mensagem de commit multi-linha:** usar here-string `@'...'@` com o `'@` na coluna 0.
- **Paleta, valores exatos:** `--branco: #FFFFFF` · `--petroleo: #0F4C81` · `--azul: #EAF5FF` · `--cinza: #F7F8FA` · `--grafite: #202124` · `--ouro: #C9A86A`.
- **O ouro só existe como fio de 1px ou texto em caixa alta ≥14px peso 500.** Nunca preenchimento, nunca botão sólido dourado.
- **Framer Motion está fora do escopo.** Toda animação é GSAP ou CSS. Não instalar.
- **Fontes:** Cormorant Garamond (display, weight 300) + Inter (texto, 400/500), self-hosted via `next/font/local`. Canela não entra: é paga.
- **Regra editorial:** nenhum texto do site pode conter "excelência", "soluções personalizadas" ou "compromisso com o seu sorriso". Frases curtas, um detalhe concreto por parágrafo.
- **Motion tokens:** ease `expo.out` / `cubic-bezier(0.22, 1, 0.36, 1)`; texto 0.9s; imagem 1.2s; stagger 0.08s; deslocamento máximo 24px; blur 12px→0; parallax máximo ±12%.
- **`prefers-reduced-motion` desliga tudo** — sem Lenis, sem pin, sem scrub, sem SplitText. A página continua completa e legível.
- **Teto de créditos Higgsfield: 250.** Custos medidos: clipe `kling3_0` pro sem áudio 5s = 8,75; imagem `nano_banana_pro` 1k = 2,00. Se a projeção passar de 250, parar e avisar.
- **Verificação visual é obrigatória**, não opcional: scrub de vídeo e layout só são aprovados depois de screenshots do Playwright headless olhados um a um. `curl` e code review não valem.

---

### Task 1: Fundação — scaffold, tokens, fontes, metadata

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` (via create-next-app)
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `lib/motion.ts`, `lib/clinica.ts`
- Create: `AGENTS.md`, `CLAUDE.md`
- Create: `public/fonts/` (arquivos .woff2)

**Interfaces:**
- Consumes: nada (primeira task)
- Produces: tokens CSS (`--branco`, `--petroleo`, `--azul`, `--cinza`, `--grafite`, `--ouro`, `--display`, `--texto`); `lib/motion.ts` exportando `EASE = "expo.out"`, `EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)"`, `DUR = { texto: 0.9, imagem: 1.2, stagger: 0.08 }`; `lib/clinica.ts` exportando o objeto `CLINICA` com nome, endereço, telefone, whatsapp, instagram, horários e responsável técnica.

- [ ] **Step 1: Scaffold**

```powershell
Set-Location C:\Users\rickj\projetos\alva-odontologia
npx --yes create-next-app@latest . --ts --app --turbopack --tailwind --eslint --no-src-dir --import-alias "@/*" --use-npm --yes
```

Se reclamar de diretório não vazio por causa de `docs/` e `.git`, confirmar que só existem esses e prosseguir.

- [ ] **Step 2: Ler os docs da versão instalada**

Ler `node_modules/next/dist/docs/` — em especial os guias de `app/layout`, `metadata` e `next/font`. Anotar qualquer divergência em relação ao que este plano assume.

- [ ] **Step 3: Criar AGENTS.md e CLAUDE.md**

`AGENTS.md`:

```markdown
# This is NOT the Next.js you know

Esta versão tem breaking changes — APIs, convenções e estrutura podem diferir
do conhecimento de treino. Leia o guia relevante em `node_modules/next/dist/docs/`
antes de escrever código. Respeite avisos de depreciação.

# ALVA

Peça de vitrine. Regras que não se negociam:
- Ouro (#C9A86A) só como fio de 1px ou caixa alta ≥14px/500. Nunca preenchimento.
- Sem Framer Motion. GSAP + CSS apenas.
- Nada de "excelência", "soluções personalizadas", "compromisso com o seu sorriso".
- Scrub de vídeo se verifica com screenshot do Playwright, não com code review.
```

`CLAUDE.md`: uma linha só — `@AGENTS.md`

- [ ] **Step 4: Baixar as fontes**

Baixar os `.woff2` de Cormorant Garamond 300 (latin) e Inter 400/500 (latin) para `public/fonts/`. Fonte: repositório `google/fonts` no GitHub, arquivos estáticos — não usar `next/font/google` (queremos self-hosted de verdade, sem request externo em build).

Arquivos esperados: `CormorantGaramond-Light.woff2`, `Inter-Regular.woff2`, `Inter-Medium.woff2`.

- [ ] **Step 5: Escrever `app/globals.css` com os tokens**

```css
@import "tailwindcss";

@theme {
  --color-branco: #FFFFFF;
  --color-petroleo: #0F4C81;
  --color-azul: #EAF5FF;
  --color-cinza: #F7F8FA;
  --color-grafite: #202124;
  --color-ouro: #C9A86A;
}

:root {
  --branco: #FFFFFF;
  --petroleo: #0F4C81;
  --azul: #EAF5FF;
  --cinza: #F7F8FA;
  --grafite: #202124;
  --ouro: #C9A86A;

  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-texto: 0.9s;
  --dur-imagem: 1.2s;

  --gutter: clamp(20px, 5vw, 96px);
  --max: 1440px;

  --sombra: 0 1px 2px rgba(32, 33, 36, 0.04), 0 8px 24px rgba(32, 33, 36, 0.04);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  /* o fundo é interpolado pelo scroll na Task 12 */
  background: var(--grafite);
  color: var(--grafite);
  font-family: var(--texto), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, .display {
  font-family: var(--display), Georgia, serif;
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.02;
  margin: 0;
}

h1 { font-size: clamp(2.75rem, 7vw, 6.5rem); line-height: 0.98; }
h2 { font-size: clamp(2rem, 4.5vw, 4rem); }

.eyebrow {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ouro);
}

:focus-visible {
  outline: 2px solid var(--petroleo);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Escrever `lib/clinica.ts`**

```ts
export const CLINICA = {
  nome: "ALVA",
  assinatura: "Odontologia de Precisão",
  fundacao: 2009,
  responsavel: "Dra. Marina Alencastro",
  cro: "CRO-SP 68.442",
  endereco: "Rua Doutor Melo Alves, 412 — Jardins, São Paulo/SP",
  cep: "01417-010",
  telefone: "(11) 3062-8840",
  telefoneRaw: "+551130628840",
  whatsapp: "(11) 99164-2207",
  whatsappRaw: "5511991642207",
  instagram: "@alva.odontologia",
  instagramUrl: "https://instagram.com/alva.odontologia",
  horarios: [
    { dias: "Segunda a sexta", horas: "8h — 20h" },
    { dias: "Sábado", horas: "8h — 13h" },
  ],
} as const;

export const WHATSAPP_URL =
  `https://wa.me/${CLINICA.whatsappRaw}?text=` +
  encodeURIComponent("Olá! Gostaria de agendar uma avaliação na ALVA.");
```

- [ ] **Step 7: Escrever `lib/motion.ts`**

```ts
export const EASE = "expo.out";
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const DUR = {
  texto: 0.9,
  imagem: 1.2,
  stagger: 0.08,
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

- [ ] **Step 8: Escrever `app/layout.tsx` com fontes e metadata**

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { CLINICA } from "@/lib/clinica";
import "./globals.css";

const display = localFont({
  src: [{ path: "../public/fonts/CormorantGaramond-Light.woff2", weight: "300", style: "normal" }],
  variable: "--display",
  display: "swap",
  preload: true,
});

const texto = localFont({
  src: [
    { path: "../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--texto",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alva-odontologia.vercel.app"),
  title: {
    default: "ALVA · Odontologia de Precisão — Jardins, São Paulo",
    template: "%s · ALVA",
  },
  description:
    "Clínica odontológica nos Jardins com escaneamento intraoral, planejamento digital e sedação consciente. Implantes, facetas, clareamento e ortodontia.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ALVA Odontologia",
    title: "ALVA · Odontologia de Precisão",
    description: "Tratamentos modernos com foco em conforto, estética e saúde bucal.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable}`}>
      <body>
        <a href="#conteudo" className="skip">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}
```

Adicionar em `globals.css` a classe `.skip` (fora da viewport por padrão, visível ao receber foco).

- [ ] **Step 9: Verificar build**

```powershell
npm run build
```

Esperado: build limpo, zero erro de tipo, zero warning de ESLint.

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m @'
feat: fundacao do projeto — tokens, fontes locais e metadata

Scaffold Next App Router, paleta em tokens CSS, Cormorant Garamond e Inter
self-hosted, dados da clinica centralizados em lib/clinica.ts.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
'@
```

---

### Task 2: Produção do vídeo do hero

Esta task gasta créditos. O checkpoint do piloto é obrigatório.

**Files:**
- Create: `public/video/hero-hd.mp4`, `public/video/hero.mp4`, `public/video/poster.jpg`
- Create: `docs/assets.md` (registro do que foi gerado, com job ids e custo)

**Interfaces:**
- Consumes: nada
- Produces: `/video/hero-hd.mp4` (1280px, ~28s, GOP 1), `/video/hero.mp4` (720px, corte de ~8s para mobile), `/video/poster.jpg`

- [ ] **Step 1: Gerar o keyframe mestre**

`generate_image`, modelo `nano_banana_pro`, `aspect_ratio: "16:9"`. Prompt na linha de:

> Interior of an upscale dental clinic reception in São Paulo, warm morning
> light entering from tall glass doors on the left, pale oak wood panelling,
> matte white surfaces, a large monstera plant, minimal furniture, a woman
> dentist in her late thirties in a tailored white clinical coat standing near
> the reception desk, natural unposed expression, shallow depth of field,
> shot on 35mm anamorphic, subtle film grain, muted natural colour grade,
> teal-blue and warm neutral palette, editorial architectural photography

Gerar `count: 4`, escolher o melhor. Este frame define rosto, luz, madeira e paleta de tudo que vem depois.

- [ ] **Step 2: Gerar os 7 stills de plano**

Para cada plano, `generate_image` com o keyframe mestre passado como referência (`medias`, role de referência de imagem) para manter a mesma pessoa e o mesmo ambiente:

| # | Still |
|---|---|
| 01 | Glass entrance door opening slowly from inside, morning light flooding in, lens flare |
| 02 | Reception seen from a camera walking in, oak, glass, plants, discreet equipment |
| 03 | The dentist smiling at a patient off-camera, unposed, candid |
| 04 | The dentist walking down a bright corridor, seen from behind and slightly to the side |
| 05 | Treatment room, modern chair, intraoral scanner, microscope, MacBook, everything aligned |
| 06 | Macro detail: gloved hands, sterile instruments on a tray, dental light overhead |
| 07 | The dentist looking straight into the lens, warm smile, shallow focus |

Custo: 7 × 2 = 14 créditos.

- [ ] **Step 3: Clipe piloto — CHECKPOINT**

Animar **apenas o still 01** com `generate_video`:

```json
{
  "model": "kling3_0",
  "duration": 5,
  "mode": "pro",
  "sound": "off",
  "aspect_ratio": "16:9",
  "medias": [{ "role": "start_image", "value": "<job_id do still 01>" }],
  "prompt": "Slow cinematic push-in through the opening glass door, morning light blooming, very slow camera movement, shallow depth of field, subtle lens flare, film grain, no cuts"
}
```

Custo: 8,75. Baixar o resultado e **olhar o vídeo**. Se a qualidade não servir, trocar de modelo agora — depois de 7 clipes é caro.

- [ ] **Step 4: Gerar os 6 clipes restantes**

Mesmo formato, um por still, cada prompt descrevendo movimento lento e contínuo. Custo: 6 × 8,75 = 52,5.

Regra: todo prompt termina com `very slow camera movement, shallow depth of field, film grain, no cuts`. É o que mantém os planos parecendo o mesmo filme.

- [ ] **Step 5: Baixar e concatenar**

Baixar os 7 mp4 para `assets/bruto/` (fora de `public/`, não vai pro bundle). Concatenar:

```powershell
$lista = "assets/bruto/lista.txt"
# escrever a lista com a ferramenta Write, nao com redirecionamento:
# file 'plano01.mp4'
# file 'plano02.mp4'  ... etc
ffmpeg -f concat -safe 0 -i assets/bruto/lista.txt -c copy assets/bruto/master.mp4
```

- [ ] **Step 6: Encode do master com GOP 1**

```powershell
ffmpeg -i assets/bruto/master.mp4 -an `
  -vf "minterpolate=fps=48:mi_mode=mci,scale=1280:-2" `
  -c:v libx264 -crf 20 -pix_fmt yuv420p `
  -g 1 -keyint_min 1 -sc_threshold 0 `
  -movflags +faststart `
  public/video/hero-hd.mp4
```

`-g 1` não é opcional. Sem GOP 1 o seek engasga e o efeito inteiro morre.

- [ ] **Step 7: Corte de mobile e poster**

```powershell
ffmpeg -i public/video/hero-hd.mp4 -t 8 -an `
  -vf "scale=720:-2" -c:v libx264 -crf 23 -pix_fmt yuv420p `
  -g 1 -keyint_min 1 -sc_threshold 0 -movflags +faststart `
  public/video/hero.mp4

ffmpeg -i public/video/hero-hd.mp4 -vframes 1 -q:v 3 public/video/poster.jpg
```

- [ ] **Step 8: Conferir peso e duração**

```powershell
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 public/video/hero-hd.mp4
```

Esperado: duração ~28s. Se `hero-hd.mp4` passar de 12MB, subir o `-crf` para 22 e reencodar. GOP 1 infla o arquivo — é o preço do scrub.

- [ ] **Step 9: Registrar em `docs/assets.md`**

Tabela com: plano, job id do still, job id do clipe, créditos gastos. Somar o total e comparar com o teto de 250.

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m @'
feat: video do hero — 7 planos, master GOP 1

Stills derivados de um keyframe mestre para manter a mesma dentista e o mesmo
ambiente nos 7 planos. Encode com -g 1 (todo frame keyframe) porque sem isso o
seek do scrub engasga.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
'@
```

---

### Task 3: Camada de motion — Lenis, Reveal, Cursor

**Files:**
- Create: `components/ui/SmoothScroll/SmoothScroll.tsx`
- Create: `components/ui/Reveal/Reveal.tsx`, `Reveal.module.css`
- Create: `components/Cursor/Cursor.tsx`, `Cursor.module.css`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `EASE`, `DUR`, `prefersReducedMotion` de `lib/motion.ts`
- Produces:
  - `<SmoothScroll />` — client component, monta Lenis e sincroniza com `ScrollTrigger`, sem children
  - `<Reveal as="div" delay={0} mode="mask" | "fade" | "blur">` — envolve conteúdo e anima na entrada
  - `<Cursor />` — anel global; elementos com `data-cursor="ver"` mudam o rótulo, `data-cursor="magnetico"` puxam o botão

- [ ] **Step 1: Instalar dependências**

```powershell
npm install gsap lenis
```

GSAP 3.13+ traz SplitText no pacote público — confirmar antes de importar de `gsap/SplitText`.

- [ ] **Step 2: SmoothScroll**

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
```

- [ ] **Step 3: Reveal**

Três modos, todos com `once: true` e deslocamento máximo de 24px:

```tsx
"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  mode?: "mask" | "fade" | "blur";
  delay?: number;
  className?: string;
};

export default function Reveal({ children, as: Tag = "div", mode = "fade", delay = 0, className }: Props) {
  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || prefersReducedMotion()) return;

    const from =
      mode === "mask"
        ? { clipPath: "inset(0 0 100% 0)", y: 24 }
        : mode === "blur"
        ? { filter: "blur(12px)", opacity: 0, y: 16 }
        : { opacity: 0, y: 20 };

    const to =
      mode === "mask"
        ? { clipPath: "inset(0 0 0% 0)", y: 0 }
        : mode === "blur"
        ? { filter: "blur(0px)", opacity: 1, y: 0 }
        : { opacity: 1, y: 0 };

    const anim = gsap.fromTo(node, from, {
      ...to,
      duration: DUR.texto,
      ease: EASE,
      delay,
      scrollTrigger: { trigger: node, start: "top 85%", once: true },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [mode, delay]);

  return <Tag ref={el} className={className}>{children}</Tag>;
}
```

- [ ] **Step 4: Cursor**

Anel de 28px com lerp 0.15 em rAF. Sobre `[data-cursor="ver"]` cresce para 64px e mostra o rótulo. Sobre `[data-cursor="magnetico"]` aplica translação de até 8px no elemento alvo. Desligado quando `(pointer: coarse)` ou reduced-motion. `pointer-events: none`, `mix-blend-mode: difference`, `z-index: 90`.

- [ ] **Step 5: Montar em `app/page.tsx`**

```tsx
import SmoothScroll from "@/components/ui/SmoothScroll/SmoothScroll";
import Cursor from "@/components/Cursor/Cursor";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <main id="conteudo">{/* seções entram nas tasks seguintes */}</main>
    </>
  );
}
```

- [ ] **Step 6: Verificar**

```powershell
npm run build
npm run dev
```

Abrir e conferir: página rola suave, cursor segue com atraso, nada pisca no primeiro paint. Com `prefers-reduced-motion` forçado no DevTools, a rolagem volta ao normal e o cursor some.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m @'
feat: camada de motion — Lenis, Reveal e cursor personalizado

Reveal em tres modos (mask, fade, blur) com once:true. Tudo desliga em
prefers-reduced-motion.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
'@
```

---

### Task 4: VideoRig e Hero

O coração do site. Depende das Tasks 2 e 3.

**Files:**
- Create: `lib/scenes.ts`, `lib/world.ts`
- Create: `components/VideoRig/VideoRig.tsx`, `VideoRig.module.css`
- Create: `components/sections/Hero/Hero.tsx`, `Hero.module.css`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `/video/hero-hd.mp4`, `/video/hero.mp4`, `/video/poster.jpg`
- Produces:
  - `lib/world.ts` exporta `world = { progresso: 0 }` — objeto mutável lido pelo rAF do rig
  - `lib/scenes.ts` exporta `PLANOS: { nome: string; v0: number; v1: number }[]` com os 7 planos
  - `<VideoRig />` — vídeo fixo, sem props
  - `<Hero />` — seção que faz o pin e alimenta `world.progresso`

- [ ] **Step 1: `lib/scenes.ts`**

```ts
export const PLANOS = [
  { nome: "A porta", v0: 0.0, v1: 0.14 },
  { nome: "A recepção", v0: 0.14, v1: 0.3 },
  { nome: "O encontro", v0: 0.3, v1: 0.44 },
  { nome: "O corredor", v0: 0.44, v1: 0.58 },
  { nome: "O consultório", v0: 0.58, v1: 0.72 },
  { nome: "O detalhe", v0: 0.72, v1: 0.88 },
  { nome: "O sorriso", v0: 0.88, v1: 1.0 },
] as const;
```

- [ ] **Step 2: `lib/world.ts`**

```ts
/** Escrito pelo ScrollTrigger do Hero, lido pelo rAF do VideoRig.
 *  Estado mutável de propósito: passar isso por React state re-renderiza
 *  a árvore 60 vezes por segundo e mata o scrub. */
export const world = { progresso: 0 };
```

- [ ] **Step 3: VideoRig**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { world } from "@/lib/world";
import { PLANOS } from "@/lib/scenes";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./VideoRig.module.css";

export default function VideoRig() {
  const video = useRef<HTMLVideoElement>(null);
  const hud = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;

    const desktop = window.innerWidth >= 1024;
    // src fora do JSX: no JSX o browser baixaria as duas fontes
    v.src = desktop ? "/video/hero-hd.mp4" : "/video/hero.mp4";
    v.load();

    const pronto = () => window.dispatchEvent(new CustomEvent("alva:pronto"));
    if (v.readyState >= 3) pronto();
    else v.addEventListener("canplay", pronto, { once: true });

    // mobile e reduced-motion: sem scrub. Mobile toca em loop, reduced fica no poster.
    if (!desktop || prefersReducedMotion()) {
      if (!prefersReducedMotion()) {
        v.loop = true;
        v.play().catch(() => {});
      }
      return () => v.removeEventListener("canplay", pronto);
    }

    v.pause();
    let atual = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dur = v.duration;
      if (!dur || v.readyState < 2) return;

      const alvo = world.progresso;
      const proximo = atual + (alvo - atual) * 0.1; // damping: amarrar direto treme
      if (Math.abs(proximo - atual) > 0.0004) {
        atual = proximo;
        // -0.05s: seek exatamente em duration congela no ultimo frame
        v.currentTime = atual * (dur - 0.05);
      }

      if (hud.current) {
        const i = PLANOS.findIndex((p) => atual >= p.v0 && atual < p.v1);
        const n = String((i < 0 ? PLANOS.length - 1 : i) + 1).padStart(2, "0");
        const txt = `plano ${n} / 07`;
        if (hud.current.textContent !== txt) hud.current.textContent = txt;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("canplay", pronto);
    };
  }, []);

  return (
    <div className={s.rig} aria-hidden>
      <video ref={video} className={s.video} muted playsInline preload="metadata" poster="/video/poster.jpg" />
      <div className={s.vinheta} />
      <span ref={hud} className={s.hud}>plano 01 / 07</span>
    </div>
  );
}
```

`VideoRig.module.css`: `.rig` é `position: fixed; inset: 0; z-index: 0`, `.video` é `width: 100%; height: 100%; object-fit: cover`, `.vinheta` é um gradiente radial escurecendo as bordas mais um véu grafite a 30% para o texto branco passar em contraste AA, `.hud` é Inter 500 `0.68rem` com `letter-spacing: 0.18em` em branco a 55%, canto inferior esquerdo.

- [ ] **Step 4: Hero com o pin**

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/clinica";
import s from "./Hero.module.css";

export default function Hero() {
  const raiz = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const node = raiz.current;
    if (!node || prefersReducedMotion() || window.innerWidth < 1024) return;

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top top",
      end: "+=520%",
      pin: `.${s.palco}`,
      scrub: true,
      onUpdate: (self) => { world.progresso = self.progress; },
    });

    return () => st.kill();
  }, []);

  // entrada do titulo: palavra a palavra, por mascara
  useEffect(() => {
    if (!titulo.current || prefersReducedMotion()) return;
    const palavras = titulo.current.querySelectorAll("span > i");
    gsap.fromTo(
      palavras,
      { yPercent: 110 },
      { yPercent: 0, duration: DUR.texto, ease: EASE, stagger: DUR.stagger, delay: 0.25 }
    );
  }, []);

  return (
    <section ref={raiz} className={s.hero}>
      <div className={s.palco}>
        {/* h1 com cada palavra em <span><i>palavra</i></span>, span com overflow:hidden */}
        {/* subtitulo, botoes (Agendar -> WHATSAPP_URL, Conhecer -> #sobre), indicadores */}
      </div>
    </section>
  );
}
```

Marcar as palavras do H1 manualmente em vez de usar SplitText: o texto é fixo e conhecido, e assim não há flash de layout antes do JS rodar. SplitText fica reservado para os títulos de seção.

Textos, literais:
- H1: *Seu sorriso merece tecnologia, precisão e cuidado.*
- Sub: *Tratamentos modernos com foco em conforto, estética e saúde bucal.*
- Botões: **Agendar Consulta** (fundo petróleo, texto branco) · **Conhecer a Clínica** (ghost, borda branca a 30%)
- Indicadores: `★★★★★` · `Mais de 1.500 pacientes atendidos` · `98% de satisfação`, separados por um ponto médio em ouro

- [ ] **Step 5: Montar em `app/page.tsx`**

`<VideoRig />` fora do `<main>`, antes dele. `<Hero />` como primeira seção do `<main>`.

- [ ] **Step 6: Build de produção**

```powershell
npm run build
npm start
```

Modo dev tem overhead que faz o scrub parecer mais travado do que é. Só o build de produção mostra o comportamento real.

- [ ] **Step 7: VERIFICAÇÃO VISUAL — obrigatória**

```powershell
npm install -D playwright
npx playwright install chromium
```

Escrever `scripts/verifica-scrub.mjs`: abre `http://localhost:3000` em 1440×900, espera o evento `alva:pronto`, e tira 6 screenshots rolando de 0% a 100% da altura do pin, salvando em `.artifacts/scrub-0.png` … `scrub-5.png`.

**Olhar as 6 imagens uma a uma.** Critério: cada uma mostra um frame visivelmente diferente, e a ordem bate com a sequência dos planos (porta → recepção → dentista → corredor → consultório → sorriso). Se duas imagens forem iguais, o scrub não está funcionando — provavelmente GOP errado no encode ou `world.progresso` não sendo alimentado.

Code review e `curl` não valem como verificação desta task.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m @'
feat: hero com video scrubado pelo scroll

Video fixo atras da pagina, currentTime perseguido com damping a partir do
progresso do ScrollTrigger. Mobile e reduced-motion nao scrubam. Verificado
com screenshots do Playwright nas 6 posicoes de scroll.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
'@
```

---

### Task 5: O arco, a navegação e o loader

**Files:**
- Create: `components/Arco/Arco.tsx`, `Arco.module.css`
- Create: `components/Nav/Nav.tsx`, `Nav.module.css`
- Create: `components/Loader/Loader.tsx`, `Loader.module.css`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: evento `alva:pronto` disparado pelo VideoRig
- Produces: `<Arco modo="progresso" | "trilha" | "assinatura" progresso={0..1} />` — o mesmo `<path>` SVG em três apresentações. `PATH_ARCO` exportado como constante para a Task 7 posicionar os nós da jornada sobre ele.

- [ ] **Step 1: Definir o path**

```ts
// curvatura de arcada superior, viewBox 0 0 1000 260
export const PATH_ARCO =
  "M 40 240 C 40 90, 240 20, 500 20 C 760 20, 960 90, 960 240";
export const VIEWBOX_ARCO = "0 0 1000 260";
```

- [ ] **Step 2: Componente Arco**

Um `<svg>` com `<path>` de `stroke: var(--ouro)`, `stroke-width: 1`, `fill: none`, `vector-effect: non-scaling-stroke`.

- `modo="progresso"`: fixo no canto direito, rotacionado 90°, largura 120px, opacidade 0.35, `stroke-dashoffset` amarrado ao scroll global.
- `modo="trilha"`: largura total da seção, os nós da jornada são posicionados com `getPointAtLength()`.
- `modo="assinatura"`: largura 320px, desenha-se ao entrar na viewport, 1.6s, `EASE`.

Todos usam `pathLength` normalizado para 1, o que torna o cálculo de dashoffset independente do tamanho real do path.

- [ ] **Step 3: Nav**

Barra fina, fixa, fundo transparente que ganha `backdrop-filter: blur(12px)` e fundo branco a 82% depois de 80px de scroll. Logotipo ALVA em Cormorant à esquerda, links no centro (Sobre · Especialidades · Resultados · Tour · FAQ), botão Agendar à direita. Link ativo ganha hairline dourado embaixo.

Mobile: hambúrguer abrindo painel full-screen. **Cuidado com z-index do botão** — ele precisa ficar acima do painel para poder fechar.

- [ ] **Step 4: Loader**

Fundo grafite cobrindo tudo, `ALVA` em Cormorant no centro com o arco desenhando-se abaixo. Sai com fade de 0.6s ao receber `alva:pronto` (ou após 2.5s de timeout, para não travar a página se o vídeo falhar). `aria-hidden`, e o `<main>` não fica preso atrás dele para leitores de tela.

- [ ] **Step 5: Verificar**

Build, depois screenshot em 1440 e 390. Conferir: loader sai, nav muda de estado ao rolar, hambúrguer abre e fecha, arco de progresso preenche.

- [ ] **Step 6: Commit**

---

### Task 6: Sobre e Especialidades

**Files:**
- Create: `components/sections/Sobre/Sobre.tsx`, `Sobre.module.css`
- Create: `components/sections/Especialidades/Especialidades.tsx`, `Especialidades.module.css`
- Create: `components/sections/Especialidades/icones.tsx`
- Create: `lib/conteudo.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `<Reveal />`, tokens
- Produces: `lib/conteudo.ts` exportando `ESPECIALIDADES`, `DIFERENCIAIS`, `JORNADA`, `DEPOIMENTOS`, `FAQ`, `TOUR` — todo o conteúdo textual do site em um lugar só.

- [ ] **Step 1: `lib/conteudo.ts` — especialidades**

```ts
export const ESPECIALIDADES = [
  { id: "implantes", titulo: "Implantes", texto: "Do planejamento digital à coroa definitiva, com o osso mapeado antes de qualquer corte." },
  { id: "clareamento", titulo: "Clareamento", texto: "Protocolo ajustado à sua sensibilidade, não ao relógio da agenda." },
  { id: "facetas", titulo: "Facetas", texto: "Ensaio digital antes de tocar no dente. Você aprova o resultado primeiro." },
  { id: "ortodontia", titulo: "Ortodontia", texto: "Alinhadores transparentes ou aparelho fixo — a escolha começa no diagnóstico." },
  { id: "harmonizacao", titulo: "Harmonização Facial", texto: "Medida, discreta e reversível. O objetivo é você parecer descansado, não outro." },
  { id: "estetica", titulo: "Odontologia Estética", texto: "Resinas e recontornos para quem quer ajuste fino, não reconstrução." },
] as const;
```

- [ ] **Step 2: Ícones autorais**

`icones.tsx` exporta seis componentes SVG, todos em `viewBox="0 0 48 48"`, `stroke="currentColor"`, `stroke-width="1"`, `fill="none"`, `stroke-linecap="round"`. Nenhum ícone de biblioteca — cada um é desenhado à mão para o seu conceito:

- Implantes: um pino com rosca e a coroa acima, em corte
- Clareamento: um dente com um gradiente de tom em três degraus
- Facetas: uma lâmina fina destacando-se da face do dente
- Ortodontia: três dentes com um fio passando e um bráquete
- Harmonização: um perfil facial reduzido a três linhas
- Estética: uma lupa sobre uma borda de dente

Cada path recebe `pathLength={1}`, `strokeDasharray={1}`, `strokeDashoffset={1}` e o CSS do card anima para `0` no hover em 0.6s com `var(--ease)`.

- [ ] **Step 3: Seção Sobre**

Grid 12 colunas: imagem nas colunas 1–5, texto nas 7–12 (invertido no mobile, imagem primeiro). Imagem com parallax de ±12% via ScrollTrigger em `yPercent`.

Texto, literal do spec — dois parágrafos, o da sala emprestada em 2009 e o do escâner que aposentou o alginato. Eyebrow: `A CLÍNICA`. Título: *Sem pressa, desde 2009.*

- [ ] **Step 4: Seção Especialidades**

Grid de 3 colunas (1 no mobile, 2 em tablet). Card: padding 40px, `border: 1px solid rgba(32,33,36,.08)`, raio 4px. Hover: `translateY(-4px)`, sombra do token, hairline dourado varrendo a base da esquerda para a direita (`transform: scaleX(0) → 1`, `transform-origin: left`), seta deslizando 6px, ícone desenhando-se.

Entrada: `<Reveal mode="fade">` com stagger de 0.08 por card.

- [ ] **Step 5: Verificar**

Build + screenshots em 390, 768 e 1440. Conferir hover dos seis cards um a um (o ícone desenha? o hairline varre?).

- [ ] **Step 6: Commit**

---

### Task 7: Diferenciais e Jornada do paciente

**Files:**
- Create: `components/sections/Diferenciais/Diferenciais.tsx` + css
- Create: `components/sections/Jornada/Jornada.tsx` + css
- Modify: `lib/conteudo.ts`, `app/page.tsx`

**Interfaces:**
- Consumes: `PATH_ARCO`, `VIEWBOX_ARCO` de `components/Arco/Arco.tsx`
- Produces: nada além das seções

- [ ] **Step 1: Conteúdo**

```ts
export const DIFERENCIAIS = [
  { titulo: "Escâner 3D", texto: "A moldagem com massa saiu de cena. O escaneamento leva quatro minutos e você vê o resultado na tela na hora." },
  { titulo: "Planejamento Digital", texto: "O tratamento é simulado antes de começar. Você aprova o desenho do sorriso antes do primeiro procedimento." },
  { titulo: "Sedação Consciente", texto: "Para quem trava só de sentar na cadeira. Você fica acordado, relaxado, e sai dirigindo." },
  { titulo: "Atendimento Humanizado", texto: "Cinco pacientes por dia, por decisão. Ninguém é atendido com o próximo esperando na porta." },
] as const;

export const JORNADA = [
  { passo: "01", titulo: "Primeira consulta", texto: "Cinquenta minutos. Escaneamento, fotos e conversa — sem procedimento no mesmo dia." },
  { passo: "02", titulo: "Diagnóstico Digital", texto: "As imagens viram um modelo 3D da sua boca. É nele que o plano é desenhado." },
  { passo: "03", titulo: "Plano Personalizado", texto: "Etapas, prazos e valores por escrito. Você leva para casa antes de decidir." },
  { passo: "04", titulo: "Tratamento", texto: "Sessões agendadas com folga entre elas. Nada de maratona." },
  { passo: "05", titulo: "Acompanhamento", texto: "Retornos em 30, 90 e 180 dias, já marcados na saída." },
] as const;
```

- [ ] **Step 2: Diferenciais**

Desktop: timeline horizontal, quatro marcos sobre uma linha de 1px em `rgba(15,76,129,.2)`. A linha se preenche em petróleo conforme o scroll atravessa a seção (ScrollTrigger com `scrub: 0.6`, `scaleX` de 0 a 1). Cada marco tem um ponto que acende ao ser ultrapassado.

Mobile: vira vertical, linha à esquerda, marcos empilhados.

- [ ] **Step 3: Jornada**

`<Arco modo="trilha" />` ocupando a largura da seção. Os 5 nós posicionados com `getPointAtLength(path.getTotalLength() * t)` para `t` em `[0.08, 0.29, 0.5, 0.71, 0.92]` — assim eles seguem a curva de verdade, não uma aproximação.

Cada nó: círculo de 10px com fio dourado, número do passo em Inter 500 `0.7rem`, título em Cormorant. Ao ser ultrapassado pelo scroll: escala 1 → 1.15 em 0.5s, opacidade do fio 0.4 → 1, e o card de texto correspondente entra por `<Reveal mode="blur">`.

Mobile: o arco some (fica ilegível abaixo de 700px) e os cinco passos viram uma coluna com o fio vertical ligando-os.

- [ ] **Step 4: Verificar**

Screenshots em três larguras + um vídeo curto do Playwright rolando pela seção, para conferir que os nós acendem na ordem certa.

- [ ] **Step 5: Commit**

---

### Task 8: Imagens do site

Segunda task que gasta créditos.

**Files:**
- Create: `public/img/*.webp`
- Modify: `docs/assets.md`

**Interfaces:**
- Produces: `sobre.webp`, `dra-marina.webp`, `tour-01..06.webp`, `depoimento-01..03.webp`, `antes.webp`, `depois.webp`

- [ ] **Step 1: Gerar, sempre com o keyframe mestre como referência**

Todas as imagens derivam do mesmo keyframe da Task 2. Direção de fotografia idêntica em todos os prompts: luz natural lateral, temperatura levemente quente, madeira clara e vidro, profundidade de campo rasa, grão discreto, sem sorriso posado de banco de imagem.

| Arquivo | Conteúdo | Proporção |
|---|---|---|
| `sobre.webp` | A Dra. Marina no corredor da clínica, meia distância, luz de janela | 4:5 |
| `tour-01..06` | Recepção, sala de espera, consultório, sala do escâner, detalhe de instrumentos, fachada | alternando 3:4, 16:9, 1:1 |
| `depoimento-01..03` | Três retratos: mulher ~34 arquiteta, homem ~41, mulher ~38 professora | 1:1 |
| `antes` / `depois` | Mesma pessoa, mesmo enquadramento, mesma luz — sorriso antes e depois | 3:2 |

O par antes/depois é o mais difícil: gerar o "antes" primeiro e usá-lo como referência direta do "depois", pedindo apenas a mudança nos dentes. Se o rosto mudar entre os dois, refazer — um par inconsistente destrói a credibilidade da seção inteira.

Custo estimado: ~15 imagens × 2 = 30 créditos.

- [ ] **Step 2: Converter para WebP e dimensionar**

```powershell
ffmpeg -i entrada.png -vf "scale=1600:-2" -q:v 82 public/img/saida.webp
```

Nenhuma imagem passa de 1600px na maior dimensão. Tour pode ir a 1200.

- [ ] **Step 3: Somar créditos em `docs/assets.md`** e conferir contra o teto de 250.

- [ ] **Step 4: Commit**

---

### Task 9: Resultados e Depoimentos

**Files:**
- Create: `components/sections/Resultados/Resultados.tsx` + css
- Create: `components/sections/Depoimentos/Depoimentos.tsx` + css
- Modify: `lib/conteudo.ts`, `app/page.tsx`

**Interfaces:**
- Consumes: `/img/antes.webp`, `/img/depois.webp`, `/img/depoimento-0{1,2,3}.webp`
- Produces: nada além das seções

- [ ] **Step 1: Slider antes/depois**

Duas imagens sobrepostas; a de cima recebe `clip-path: inset(0 calc(100% - var(--corte)) 0 0)`. A alça é um `<div>` de 2px em ouro com um puxador circular de 44px.

Estado em `useRef` + escrita direta no style (não em React state) — mover o slider re-renderizando a árvore a cada `mousemove` engasga.

Acessibilidade: `role="slider"`, `aria-valuemin/max/now`, `aria-label="Comparação antes e depois"`, `tabIndex={0}`, setas ← → movendo 2% e Home/End indo aos extremos.

Suporte a `pointerdown`/`pointermove`/`pointerup` (cobre mouse e touch com um código só).

- [ ] **Step 2: Auto-demo**

Ao entrar na viewport, uma vez: 50% → 68% → 50% em 1.1s com `EASE`. Cancela ao primeiro `pointerdown`. Não roda em reduced-motion.

- [ ] **Step 3: Depoimentos**

Três cards grandes, cada um com retrato circular de 88px, texto em Cormorant `1.6rem` `line-height: 1.35`, e assinatura em Inter. Os três textos literais do spec (Camila Rezende, Rodrigo Sampaio, Patrícia Nolasco).

Desktop: os cards entram com stagger e um leve deslocamento vertical alternado (o do meio 24px mais baixo) — quebra a simetria de template.

- [ ] **Step 4: Verificar**

Screenshots. Testar o slider com teclado e com touch emulado. Conferir que o auto-demo roda uma vez só.

- [ ] **Step 5: Commit**

---

### Task 10: Tour com lightbox e FAQ

**Files:**
- Create: `components/sections/Tour/Tour.tsx` + css
- Create: `components/sections/Tour/Lightbox.tsx` + css
- Create: `components/sections/Faq/Faq.tsx` + css
- Modify: `lib/conteudo.ts`, `app/page.tsx`

**Interfaces:**
- Consumes: `/img/tour-0{1..6}.webp`
- Produces: `<Lightbox fotos={...} indice={n|null} onFechar={} onNavegar={(n) => void} />`

- [ ] **Step 1: Grid do tour**

Seis fotos em proporções desiguais, montadas com `grid-template-areas` explícito — sem simetria, sem todas do mesmo tamanho. Hover: `scale(1.06)` na imagem em 1.2s dentro de um container com `overflow: hidden`, legenda subindo por máscara, cursor vira "ver" (`data-cursor="ver"`).

- [ ] **Step 2: Lightbox**

Fundo `rgba(32,33,36,.96)`. Imagem centralizada com `object-fit: contain`, máximo 92vh. Navegação: setas ← →, Esc fecha, clique fora fecha.

Acessibilidade: `role="dialog"`, `aria-modal="true"`, foco preso dentro do modal enquanto aberto, foco devolvido ao thumbnail de origem ao fechar, `overflow: hidden` no body enquanto aberto (e Lenis pausado).

- [ ] **Step 3: FAQ**

Accordion com `grid-template-rows: 0fr → 1fr` — anima altura sem medir nada em JS. Item aberto ganha fio dourado de 1px à esquerda e o `+` gira 45°.

Semântica: `<button aria-expanded>` controlando uma região com `id` correspondente. Um item aberto por vez.

Seis perguntas do spec. A resposta sobre convênio explica o modelo particular em duas frases e oferece parcelamento, sem tom defensivo.

- [ ] **Step 4: Verificar**

Percorrer o site inteiro só com teclado: Tab chega em todas as fotos, Enter abre o lightbox, setas navegam, Esc fecha e o foco volta ao lugar certo. Accordion abre e fecha com Enter e Espaço.

- [ ] **Step 5: Commit**

---

### Task 11: CTA e Rodapé

**Files:**
- Create: `components/sections/Cta/Cta.tsx` + css
- Create: `components/sections/Footer/Footer.tsx` + css
- Create: `components/ui/Botao/Botao.tsx` + css
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `CLINICA`, `WHATSAPP_URL`, `<Arco modo="assinatura" />`
- Produces: `<Botao href variante="primario"|"ghost"|"gigante" magnetico />`

- [ ] **Step 1: Botão magnético**

Em `pointermove` dentro de um raio de 80px, o botão translada até 8px na direção do cursor com lerp; ao sair, volta com `EASE` em 0.5s. Desligado em `(pointer: coarse)` e em reduced-motion.

- [ ] **Step 2: CTA**

Tela cheia, `background: var(--branco)`. Título em Cormorant `clamp(3rem, 9vw, 9rem)`: *Pronto para transformar seu sorriso?* Botão gigante (altura 72px, padding lateral 56px) levando ao WhatsApp. Abaixo, uma linha seca: *Respondemos no mesmo dia útil.*

- [ ] **Step 3: Rodapé**

Fundo petróleo, texto branco. Quatro colunas no desktop: identidade + arco de assinatura · contato (telefone, WhatsApp, Instagram) · endereço + horários · mapa.

Mapa: não embutir iframe do Google no carregamento inicial — ele sozinho derruba a nota de performance. Mostrar uma imagem estática do mapa com um botão "abrir no mapa"; o iframe só monta ao clique.

Última linha: `Projeto fictício de demonstração — desenvolvido por MilWeb` com link.

- [ ] **Step 4: Commit**

---

### Task 12: A alvorada — progressão de fundo e polimento responsivo

**Files:**
- Create: `components/FundoProgressivo/FundoProgressivo.tsx`
- Modify: todos os `.module.css` de seção (ajuste de contraste)

**Interfaces:**
- Consumes: nada
- Produces: `<FundoProgressivo />` — client component sem props que interpola `background-color` do `<body>` ao longo do scroll

- [ ] **Step 1: Implementar**

Um `ScrollTrigger` com `scrub: 0.8` sobre o documento inteiro, interpolando entre as paradas definidas no spec (§3.1). Usar `gsap.utils.interpolate` sobre um array de cores e escrever em `document.body.style.backgroundColor`.

As seções ficam com `background: transparent`, exceto Resultados (grafite) e Rodapé (petróleo), que são blocos sólidos por decisão de contraste.

- [ ] **Step 2: Ajustar contraste seção a seção**

Como o fundo muda, cada seção precisa de cor de texto que passe AA nos dois extremos da sua faixa. Onde não passar, fixar o fundo da seção em vez de deixar interpolar.

- [ ] **Step 3: Passar o site inteiro em três larguras**

390px (iPhone), 768px (tablet), 1440px (desktop). Screenshot de cada seção, olhados um a um. Checklist: nada estoura horizontalmente, nenhuma linha de texto passa de 75 caracteres, nenhum toque é menor que 44×44px, o hero não corta o botão no mobile.

- [ ] **Step 4: Commit**

---

### Task 13: Performance, SEO e acessibilidade

**Files:**
- Create: `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`
- Create: `components/JsonLd.tsx`
- Modify: `app/layout.tsx`, `next.config.ts`

- [ ] **Step 1: JSON-LD**

`@type: Dentist` com `name`, `image`, `address` (PostalAddress completo), `telephone`, `openingHoursSpecification` para os dois blocos de horário, `aggregateRating` (4.9 / 1500), `medicalSpecialty`, `priceRange: "$$$"`, `founder`. Injetado com `<script type="application/ld+json">` e `dangerouslySetInnerHTML`.

Validar mentalmente contra schema.org — campo inventado invalida o bloco inteiro.

- [ ] **Step 2: OG image**

Rota `app/opengraph-image.tsx` gerando 1200×630: fundo grafite, ALVA em Cormorant, o arco dourado, assinatura embaixo.

- [ ] **Step 3: sitemap e robots**

- [ ] **Step 4: Lighthouse**

```powershell
npm run build
npm start
npx --yes lighthouse http://localhost:3000 --preset=desktop --output=json --output-path=.artifacts/lh-desktop.json --chrome-flags="--headless"
npx --yes lighthouse http://localhost:3000 --output=json --output-path=.artifacts/lh-mobile.json --chrome-flags="--headless"
```

Meta: ≥95 nas quatro categorias no mobile. Se Performance ficar abaixo, os suspeitos em ordem: peso do vídeo, imagens sem `sizes`, JS do GSAP no caminho crítico, iframe do mapa.

Registrar as notas finais em `docs/assets.md`.

- [ ] **Step 5: Auditoria de acessibilidade**

Percorrer o site inteiro só com teclado. Conferir contraste de todo texto (o ouro sobre branco **não** passa em corpo — se aparecer em algum lugar como texto de leitura, corrigir). Conferir que reduced-motion entrega a página completa e estática.

- [ ] **Step 6: Commit**

---

### Task 14: Deploy

- [ ] **Step 1: Push para o GitHub** em `rickjs2005/alva-odontologia`
- [ ] **Step 2: Deploy na Vercel**, confirmando que Deployment Protection está desligado (projeto novo vem com ela ligada e o link fica pedindo login)
- [ ] **Step 3: Verificar em produção** — abrir a URL, rolar o hero inteiro, conferir que o vídeo carrega e scruba fora do localhost
- [ ] **Step 4: Rodar Lighthouse contra a URL de produção**, não contra o localhost
- [ ] **Step 5: Commit final e resumo dos créditos gastos**

---

## Self-review

**Cobertura do spec:**

| Seção do spec | Task |
|---|---|
| §3.1 A página clareia | 12 |
| §3.2 O arco (3 modos) | 5, 7, 11 |
| §4 Tokens, tipografia, grid | 1 |
| §5 Stack e estrutura | 1, 3 |
| §6 Hero scrubado, encode, 7 planos, breakpoints | 2, 4 |
| §7.1 Sobre | 6 |
| §7.2 Especialidades + ícones | 6 |
| §7.3 Diferenciais | 7 |
| §7.4 Jornada | 7 |
| §7.5 Resultados | 9 |
| §7.6 Depoimentos | 9 |
| §7.7 Tour + lightbox | 10 |
| §7.8 FAQ | 10 |
| §7.9 CTA | 11 |
| §7.10 Rodapé | 11 |
| §8 Motion e cursor | 3, 11 |
| §9 Assets e orçamento | 2, 8 |
| §10 Performance e SEO | 13 |
| §11 Acessibilidade | 10, 13 |
| §12 Critérios de aceite | 4, 12, 13 |

Sem lacuna.

**Consistência de tipos:** `world.progresso` (não `world.t`) usado nas Tasks 4 e 12. `PLANOS` com `{ nome, v0, v1 }` em `lib/scenes.ts`, consumido só pelo VideoRig. `PATH_ARCO` exportado em `components/Arco/Arco.tsx` e consumido na Task 7. `<Botao>` definido na Task 11 mas usado no Hero da Task 4 — **corrigido:** o Hero da Task 4 usa `<a>` estilizado no seu próprio módulo CSS; o `<Botao>` da Task 11 é uma extração posterior e o Hero migra para ele na Task 11.

**Placeholders:** nenhum "TBD" ou "handle edge cases". Os textos de conteúdo estão literais no plano ou no spec referenciado.
