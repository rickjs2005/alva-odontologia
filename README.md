# ALVA · Odontologia de Precisão

Peça de vitrine da **MilWeb**: site institucional de uma clínica odontológica
fictícia de alto padrão. O ativo central é um filme de 32,5s em sete planos
— e **o scroll é o botão de play**: o `currentTime` do vídeo é perseguido a
partir do progresso do scroll.

Tudo no site é fictício, inclusive a clínica, a responsável técnica e os
depoimentos. O rodapé declara isso.

## Conceito

Duas ideias, e só duas:

1. **A alvorada.** `Alva` é a primeira luz do dia. O visitante entra na
   penumbra e sai na luz: o fundo do documento é interpolado ao longo do
   scroll, do grafite ao branco. É a metáfora do tratamento, não decoração.
2. **O arco.** Um fio dourado de 1px com a curvatura de uma arcada superior.
   O mesmo path aparece três vezes — progresso do scroll, trilha da jornada
   do paciente e assinatura do rodapé. Nenhuma outra forma decorativa entra.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind v4 só para tokens em `@theme`; estilo de componente em CSS Modules
- GSAP 3 (ScrollTrigger) + Lenis
- `next/font/local` — Cormorant Garamond 300 + Inter 400/500, self-hosted
- Playwright para verificação visual, ffmpeg para o vídeo

Framer Motion ficou de fora de propósito: somaria ~40kb para fazer o que o
GSAP já faz, contra a meta de Lighthouse.

## O vídeo

Sete clipes de 5s gerados a partir de um mesmo keyframe mestre (ver
`docs/assets.md`), montados com crossfade de 0,4s:

```bash
ffmpeg -i p1.mp4 ... -i p7.mp4 \
  -filter_complex_script assets/filtro-master.txt -map "[saida]" -an \
  -c:v libx264 -crf 29 -preset slow -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -movflags +faststart \
  public/video/hero-hd.mp4
```

- `minterpolate` interpola 24→30fps **por clipe, antes do crossfade**. Depois
  borraria os cortes.
- **`-g 1` é o que faz o efeito existir.** GOP 1 transforma todo frame em
  keyframe; sem isso o seek do scrub engasga e o hero inteiro morre.
- `+faststart` joga o índice do MP4 para o começo do arquivo.
- O CRF 29 não é capricho de peso: ver "o scrub na CDN", abaixo.

Duas fontes: `hero-hd.mp4` (1280px, desktop, 11,4 MB) e `hero.mp4` (720px,
corte de 9,4s para mobile, 330 KB). O `src` é escolhido em runtime, nunca no
JSX — no JSX o browser baixaria as duas.

### O scrub na CDN

**Isto não aparece no localhost.** Em disco, cada seek do scrub responde
instantaneamente; servido pela CDN, cada seek vira um range request. Na
primeira publicação o vídeo ficava minutos atrás do scroll — ao fim do hero
tinha avançado 10s de 32s.

Duas correções, as duas necessárias:

1. `preload="auto"` no desktop, não `metadata`. Com só os metadados em mãos o
   browser não tem os bytes para saltar.
2. Peso do master de 17,9 MB para 11,4 MB (CRF 24 → 29). GOP 1 infla muito;
   é o preço do scrub, mas dá para pagar menos.

Depois disso o `currentTime` em produção bate exatamente com o do localhost.

### O interlúdio

No meio da página o filme volta. A seção é um véu opaco com um buraco em forma
de arcada, e o buraco cresce com o scroll: o arco deixa de ser traço decorativo
e vira janela. Ao mesmo tempo o vídeo reencontra o último plano em câmera
lenta, e a frase por cima usa `mix-blend-mode: difference` para se inverter
contra qualquer frame.

A janela é feita com duas camadas de máscara compostas por `exclude` — uma
cobre tudo, a outra é o arco. Onde `mask-composite` não existir, o véu
simplesmente cobre: sem janela, mas a seção continua legível.

É o único momento em que a identidade e o ativo principal se encontram, e é o
que faz a página ter um segundo pico em vez de só o hero.

## Comportamento

| Contexto | O que acontece |
|---|---|
| Desktop ≥1024px | Hero sticky, vídeo scrubado pelo scroll com damping, Lenis ativo |
| Mobile <1024px | Sem scrub. O vídeo sai do caminho crítico e só carrega no idle |
| `prefers-reduced-motion` | Sem loader, sem scrub, sem Lenis. Página completa e estática |
| Vídeo indisponível | Fundo grafite sólido, página segue legível e navegável |

## Rodar

```bash
npm install
npm run dev
```

Performance real só aparece no build (`npm run build && npm start`) — o modo
dev tem overhead que faz o scrub parecer mais travado do que é.

## Verificação

Nenhuma dessas features se aprova por code review:

```bash
node scripts/verifica-scrub.mjs     # 6 posições do hero → .artifacts/scrub
node scripts/verifica-secoes.mjs    # cada seção em 390/768/1440
```

Os scripts geram os screenshots; o critério é humano — **olhar as imagens uma
a uma**. Foi assim que apareceram os três bugs registrados no histórico: o
título invisível, os ícones que só existiam no hover e o mapa caindo para a
segunda linha da grade do rodapé.

## Lighthouse

Medido contra a URL de produção, Chrome headless.

| | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 90 | 100 | 100 | 100 |

O mobile caiu de ~95 para 90 quando entraram o interlúdio, a lente e o grão.
O grão custava sozinho ~7 pontos: `mix-blend-mode` obriga o browser a compor a
página inteira a cada frame. Ele foi cortado do mobile — numa tela de 6" o
ganho visual não pagava a conta.

O mobile oscila entre execuções (LCP 2,3–3,1s). O maior ganho veio de tirar a
saída do loader das mãos do React: enquanto ela dependia da hidratação, a tela
ficava coberta até ~3s e o LCP era medido ali.

### Hero narrativo (2026-08-06)

Fechamento da task 8: só Performance, só desktop, contra o build de produção
local (`npm run start` na porta 3001; `npx lighthouse` não achava Chrome
instalado no ambiente — apontou para o Chromium que o Playwright já baixa).

| | Perf |
|---|---|
| Desktop | 99 |

LCP 0,7s · TBT 20ms · CLS 0 · FCP 0,3s · Speed Index 0,7s. Os sete blocos de
texto do hero narrativo (`Capitulos.tsx`) ficam sempre no DOM e só mudam
opacidade — não custou o esperado, `BORRAO` e o `will-change` não precisaram
de ajuste.

## Documentos

- `docs/superpowers/specs/` — o design aprovado antes da primeira linha de código
- `docs/superpowers/plans/` — o plano de implementação em 14 tasks
- `docs/assets.md` — o que foi gerado, com job ids e custo em créditos
