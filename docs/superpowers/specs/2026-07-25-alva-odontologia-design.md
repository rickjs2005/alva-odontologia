# ALVA · Odontologia de Precisão — design

Data: 2026-07-25
Status: aprovado (design), pendente plano de implementação

## 1. Objetivo

Peça de vitrine da MilWeb. Site institucional de uma clínica odontológica
fictícia de alto padrão, construído para que um prospect olhe e pense "quero
esse nível para a minha empresa".

Não é um site para vender a clínica. É um site para vender a capacidade de
fazer sites assim. Consequência prática: **acabamento acima de cobertura**.
Vale mais ter 10 seções impecáveis do que 14 razoáveis.

Critério de sucesso subjetivo, mas real: alguém que chega sem contexto precisa
acreditar que a clínica existe.

## 2. Marca

| | |
|---|---|
| Nome | **ALVA** |
| Assinatura | Odontologia de Precisão |
| Fundação (ficção) | 2009 |
| Responsável técnica | Dra. Marina Alencastro — CRO-SP 68.442 |
| Endereço | Rua Doutor Melo Alves, 412 — Jardins, São Paulo/SP |
| Telefone | (11) 3062-8840 |
| WhatsApp | (11) 99164-2207 |
| Instagram | @alva.odontologia |
| Horários | Seg–Sex 8h–20h · Sáb 8h–13h |

`Alva` = a primeira luz do dia. O nome carrega a metáfora do site inteiro.

Todo dado é fictício. O rodapé traz uma linha discreta declarando isso — não
por medo, mas porque um site que se assume peça de portfólio é mais elegante
que um que finge.

## 3. Conceito diretor — "A alvorada"

Duas ideias, e só duas. Disciplina aqui é o que separa autoral de enfeitado.

### 3.1 A página clareia

O visitante entra na penumbra e sai na luz. O fundo progride ao longo do
scroll:

```
Hero      #202124  (grafite, contraluz)
Sobre     #F7F8FA
Espec.    #FFFFFF
Difer.    #EAF5FF
Jornada   #FFFFFF
Result.   #202124  (volta ao escuro — o antes/depois pede contraste)
Depoim.   #F7F8FA
Tour      #FFFFFF
FAQ       #FFFFFF
CTA       #FFFFFF  (branco puro, luz total)
Rodapé    #0F4C81
```

A transição entre blocos é feita por `background-color` interpolado no
ScrollTrigger do `<body>`, não por seções empilhadas com fundos duros. O olho
não deve conseguir apontar onde trocou.

Isso não é decoração: é a metáfora do tratamento. Do "não sorrio em foto" ao
sorriso aberto.

### 3.2 O arco

Um fio dourado (`#C9A86A`) de 1px que desenha a curvatura de uma arcada
dentária. Mesmo path SVG, três funções:

1. **Progresso do site** — fixo no canto direito, quase invisível, preenchendo
   por `stroke-dashoffset` conforme o scroll.
2. **Trilha da jornada do paciente** — os 5 passos são nós sobre o arco, cada
   um acendendo quando o scroll passa.
3. **Assinatura do rodapé** — desenha-se ao entrar na viewport.

Um motivo, três usos. Nenhuma outra forma decorativa entra no site.

## 4. Identidade visual

### 4.1 Tokens

```css
--branco:  #FFFFFF;
--petroleo:#0F4C81;
--azul:    #EAF5FF;
--cinza:   #F7F8FA;
--grafite: #202124;
--ouro:    #C9A86A;
```

Regra do ouro: **só fio e texto pequeno**. Nunca preenchimento, nunca botão
sólido dourado. O ouro aparece no arco, nos eyebrows em caixa alta, no item
ativo do FAQ, na alça do slider e no hairline sob o link ativo. Se parecer
"dourado", passou do ponto.

Sombras: no máximo `0 1px 2px rgba(32,33,36,.04), 0 8px 24px rgba(32,33,36,.04)`.
Raio: 2px em botões e chips, 4px em cards, 0 em imagens grandes.

### 4.2 Tipografia

- **Display:** Cormorant Garamond 300 — títulos, números grandes, o CTA.
  Tracking negativo (`-0.02em`), leading apertado (`0.95`–`1.05`).
- **Texto/UI:** Inter 400/500 — corpo, botões, labels.
- **Eyebrow:** Inter 500, `0.72rem`, `letter-spacing: 0.18em`, caixa alta,
  cor `--ouro`.

Canela ficou fora: é fonte paga (Commercial Type). Cormorant Garamond era a
segunda opção do briefing e casa melhor com Inter.

Escala display fluida via `clamp()`:
`h1 clamp(2.75rem, 7vw, 6.5rem)` · `h2 clamp(2rem, 4.5vw, 4rem)`.

### 4.3 Grid

12 colunas, gutter 24px, max-width 1440px, margens laterais `clamp(20px, 5vw, 96px)`.
Nenhuma seção usa as 12 colunas cheias para texto — corpo nunca passa de 7.

## 5. Stack

| Camada | Escolha |
|---|---|
| Base | Next.js (App Router, TypeScript, Turbopack) |
| Estilo | Tailwind v4 apenas para tokens em `@theme`; estilo de componente em CSS Modules |
| Motion | GSAP 3 (ScrollTrigger, SplitText) + Lenis |
| Fontes | `next/font/local` — Cormorant Garamond + Inter, self-hosted, subset latin |
| Imagens | `next/image`, AVIF/WebP |
| Deploy | Vercel |

**Framer Motion fica de fora.** O briefing pedia GSAP *e* Framer Motion; rodar
os dois adiciona ~40kb de JS para fazer o que o GSAP já faz, contra a meta de
Lighthouse >95. Decisão registrada para não ser relitigada na implementação.

### 5.1 Estrutura

```
app/
  layout.tsx          fontes, metadata, JSON-LD
  page.tsx            composição das seções
  opengraph-image.tsx
components/
  VideoRig/           vídeo fixo + scrub
  Arco/               o motivo SVG (3 modos: progress | trilha | assinatura)
  Cursor/
  Nav/
  Loader/
  sections/           Hero Sobre Especialidades Diferenciais Jornada
                      Resultados Depoimentos Tour Faq Cta Footer
  ui/                 SmoothScroll Reveal Eyebrow Botao Magnetico Counter
lib/
  scenes.ts           mapa scroll → tempo do vídeo
  motion.ts           tokens de easing/duração
public/
  video/ img/ fonts/
```

Um componente por pasta, com seu `.module.css` ao lado. Nenhum arquivo de
seção passa de ~200 linhas — se passar, quebra em subcomponente.

## 6. Hero — vídeo scrubado pelo scroll

O ativo central. Mesmo pipeline já validado em `atelier-vertex-v2` e `dagrao`.

### 6.1 Mecânica

Vídeo fullscreen **fixo atrás de toda a página** (`position: fixed`, `z-index`
abaixo do conteúdo). Um `requestAnimationFrame` lê o progresso do scroll e
persegue o tempo-alvo com damping (`current += (target - current) * 0.1`).
Nunca amarrar `currentTime` direto ao progresso: fica trepidado.

`preload="metadata"` — o browser busca os trechos sob demanda em vez de baixar
o arquivo inteiro de cara. `poster` no primeiro frame evita flash preto.

### 6.2 Encode (não negociável)

```bash
ffmpeg -i bruto.mp4 -an \
  -vf "minterpolate=fps=48:mi_mode=mci" \
  -c:v libx264 -crf 20 -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -movflags +faststart \
  public/video/hero-hd.mp4
```

`-g 1` faz todo frame virar keyframe. **Sem isso o seek engasga e o efeito
inteiro morre.** `minterpolate` sobe para 48fps porque a 24 o scrub pica.

Duas fontes: `hero-hd.mp4` (1280px, desktop) e `hero.mp4` (720px, mobile),
escolhidas em runtime por `window.innerWidth` — nunca as duas no JSX, senão o
browser baixa ambas.

### 6.3 Os 7 planos

O master de ~28s é dividido em planos que o scroll atravessa:

| # | Plano | Fração |
|---|---|---|
| 01 | Porta abrindo, luz natural entrando | 0.00–0.14 |
| 02 | Câmera entra — recepção, madeira, vidro, plantas | 0.14–0.30 |
| 03 | Dentista sorri para o paciente, natural | 0.30–0.44 |
| 04 | Câmera acompanha ela caminhando | 0.44–0.58 |
| 05 | Consultório — escâner, microscópio, tudo organizado | 0.58–0.72 |
| 06 | Closes — luvas, instrumentos, luz odontológica | 0.72–0.88 |
| 07 | Ela olha para a câmera e sorri, fade | 0.88–1.00 |

HUD discreto em mono: `plano 03 / 07`.

Texto do hero (literal do briefing):

- H1: *Seu sorriso merece tecnologia, precisão e cuidado.*
- Sub: *Tratamentos modernos com foco em conforto, estética e saúde bucal.*
- Botões: **Agendar Consulta** (primário, petróleo) · **Conhecer a Clínica** (ghost)
- Indicadores: ★★★★★ · Mais de 1.500 pacientes atendidos · 98% de satisfação

O H1 entra por máscara (`clip-path` + `y`), palavra a palavra, sobre o plano 02.

### 6.4 Comportamento por contexto

| Contexto | Comportamento |
|---|---|
| Desktop ≥1024px | Hero pinado, vídeo scrubado, Lenis ativo |
| Tablet/Mobile <1024px | Sem pin e sem scrub — corte de ~8s em autoplay, muted, loop, `playsinline`. iOS não é confiável em seek. |
| `prefers-reduced-motion` | Poster estático, sem pin, sem Lenis, sem SplitText |
| Vídeo indisponível | Fundo `--grafite` sólido, página segue legível e navegável |

## 7. Seções

### 7.1 Sobre

Split assimétrico 5/7. Imagem grande com parallax de profundidade (a imagem se
move ~12% mais devagar que o container).

Copy — deve soar como alguém contando, não como institucional:

> A ALVA começou em 2009, numa sala emprestada na Alameda Lorena. A Dra.
> Marina Alencastro tinha voltado de um período em Genebra com uma ideia fixa:
> dava para fazer odontologia sem pressa. Nos primeiros dois anos ela atendia
> oito pacientes por dia. Hoje atende cinco, de propósito.
>
> O prédio mudou. A equipe virou onze pessoas. O escâner intraoral aposentou a
> moldagem de alginato, de que ninguém sente falta. O tempo por consulta é o
> único número que continua igual.

Regra editorial para todo o site: **nada de "excelência", "soluções
personalizadas", "compromisso com o seu sorriso"**. Frases curtas, um detalhe
concreto por parágrafo, e no máximo uma piada por texto.

### 7.2 Especialidades

Seis cards. Ícone SVG autoral em traço de 1px que **se desenha no hover**
(`stroke-dashoffset` 0.6s). Nenhum ícone de biblioteca.

| Card | Linha de apoio |
|---|---|
| Implantes | Do planejamento digital à coroa definitiva, com o osso mapeado antes de qualquer corte. |
| Clareamento | Protocolo ajustado à sua sensibilidade, não ao relógio da agenda. |
| Facetas | Ensaio digital antes de tocar no dente. Você aprova o resultado primeiro. |
| Ortodontia | Alinhadores transparentes ou aparelho fixo — a escolha começa no diagnóstico. |
| Harmonização Facial | Medida, discreta e reversível. O objetivo é você parecer descansado, não outro. |
| Odontologia Estética | Resinas e recontornos para quem quer ajuste fino, não reconstrução. |

Hover: elevação 4px, hairline dourado varrendo a base, seta deslizando 6px.

### 7.3 Diferenciais

Timeline horizontal no desktop (scroll-driven, o traço avança), vertical no
mobile. Quatro marcos: Escâner 3D · Planejamento Digital · Sedação Consciente ·
Atendimento Humanizado.

### 7.4 Jornada do paciente

Os 5 passos sobre o arco dourado: Primeira consulta → Diagnóstico Digital →
Plano Personalizado → Tratamento → Acompanhamento.

Cada nó acende (escala 1→1.15, fio ganha opacidade) quando o scroll passa por
ele. O arco se desenha junto.

### 7.5 Resultados — antes/depois

Fundo escuro. Slider em tela quase cheia, alça vertical com fio dourado e
duas setas mínimas. Labels "antes" / "depois" em chips.

**Auto-demo:** ao entrar na viewport, a alça varre 50% → 68% → 50% em 1.1s,
uma vez. Ensina o gesto sem tooltip. Arrastar cancela a demo.

Suporte a mouse, touch e teclado (setas ← →, `role="slider"`).

### 7.6 Depoimentos

Cards grandes, retrato + texto. Três depoimentos:

> Eu adiei isso por uns seis anos. Não por medo de dentista — por medo de ouvir
> o tamanho do problema. A Dra. Marina virou a tela do escaneamento pra mim e
> dividiu em três etapas. Aí ficou possível. Terminei em outubro.
> — **Camila Rezende**, 34, arquiteta

> Cheguei achando que ia sair com orçamento de faceta em oito dentes. Saí com
> clareamento e uma resina. Foi a primeira vez que um dentista me disse pra
> fazer menos.
> — **Rodrigo Sampaio**, 41, gerente comercial

> Minha filha tem 9 anos e chorava na porta de qualquer consultório. Aqui ela
> pediu pra voltar. Não sei o que fizeram, mas funcionou.
> — **Patrícia Nolasco**, 38, professora

### 7.7 Tour da clínica

Grid cinematográfico de proporções desiguais (3:4, 16:9, 1:1 alternados, sem
simetria). Hover: zoom 1.06 em 1.2s + legenda subindo por máscara.

Lightbox próprio: fundo grafite a 96%, navegação por teclado (← → Esc),
foco preso no modal, retorno do foco ao fechar.

### 7.8 FAQ

Accordion com altura animada (`grid-template-rows: 0fr → 1fr`, sem medir
altura em JS). Item aberto ganha fio dourado à esquerda.

Seis perguntas:

1. Quanto tempo dura a primeira consulta?
2. Vocês atendem por convênio?
3. Clareamento deixa o dente sensível?
4. Em quanto tempo o implante fica pronto?
5. O que é sedação consciente — eu vou dormir?
6. Dá para ver como vai ficar antes de começar?

Respostas diretas, sem defensiva. A do convênio explica o modelo particular em
duas frases e oferece parcelamento, sem pedir desculpa.

### 7.9 CTA

Tela cheia, branco puro. Cormorant em `clamp(3rem, 9vw, 9rem)`:

> Pronto para transformar seu sorriso?

Botão magnético grande (o cursor puxa o botão até 8px). Abaixo, uma linha
seca: *Respondemos no mesmo dia útil.*

### 7.10 Rodapé

Petróleo. Mapa (embed estático leve, carregado sob interação para não pesar no
LCP), WhatsApp, Instagram, telefone, endereço, horários, arco de assinatura,
nota de projeto fictício + assinatura MilWeb.

## 8. Sistema de motion

```
ease padrão     expo.out — cubic-bezier(0.22, 1, 0.36, 1)
duração texto   0.9s
duração imagem  1.2s
stagger         0.08s
blur reveal     12px → 0
mask reveal     clip-path: inset(0 0 100% 0) → inset(0 0 0 0)
parallax        ±12% máximo
scale hover     1.03 (card) / 1.06 (imagem)
```

Regras:

- Nada entra com deslocamento maior que 24px.
- Nada dura menos de 0.4s nem mais de 1.4s.
- Nenhum elemento anima duas propriedades de layout ao mesmo tempo.
- Toda animação de entrada dispara uma vez (`once: true`).
- `prefers-reduced-motion` desliga tudo — o site continua completo, só estático.

**Cursor personalizado:** anel de 28px com lerp 0.15. Sobre mídia inverte e
cresce para 64px com label ("ver"). Sobre botões, magnetiza. Desligado em
touch e em reduced-motion.

## 9. Assets

### 9.1 Produção

Ordem obrigatória para garantir continuidade: **um keyframe mestre** da Dra.
Marina na recepção define rosto, luz, paleta e arquitetura. Todos os clipes e
todas as fotos derivam dele por image-to-video ou referência. É o que impede
o site de parecer sete lugares diferentes.

Direção de fotografia para todo asset: luz natural lateral, temperatura
levemente quente, madeira clara e vidro, profundidade de campo rasa, grão de
filme discreto, sem sorriso posado de banco de imagem.

### 9.2 Orçamento

Teto: **250 créditos** (de 456 disponíveis).

Custos medidos por preflight em 2026-07-25:

| Operação | Créditos |
|---|---|
| Clipe 5s — `kling3_0` mode `pro`, `sound: off`, 16:9 | 8,75 |
| Clipe 5s — `kling3_0` mode `std` | 7,50 |
| Clipe 5s — `seedance_2_0` 720p std (modelo de identidade) | 22,50 |
| Imagem — `nano_banana_pro` 1k | 2,00 |

**Estratégia escolhida:** não usar o modelo caro de identidade. Gerar 7 stills
derivados do keyframe mestre com `nano_banana_pro` (2 cada) e animar cada um
com `kling3_0` pro (8,75 cada). A continuidade vem dos stills, que são baratos
de refazer até ficarem certos — não do modelo de vídeo.

| Bloco | Contagem | Créditos |
|---|---|---|
| Keyframe mestre + variações | 6 img | 12 |
| Stills de plano | 7 img | 14 |
| Clipes | 7 × 8,75 | 61,25 |
| Retratos, tour, antes/depois | ~15 img | 30 |
| **Projetado** | | **~117** |
| Folga para refação | | ~133 |

Checkpoint mantido: gerar **um clipe piloto** e olhar o resultado antes de
disparar os outros seis. Se a qualidade não vier, trocar de modelo é decisão
barata nesse ponto e cara depois.

## 10. Performance e SEO

Metas: Lighthouse mobile **≥95** em Performance, Acessibilidade, Best
Practices e SEO. CLS < 0.02. LCP < 2.5s.

- Fontes self-hosted, `display: swap`, subset latin, preload só do display
- Vídeo fora do caminho do LCP (`preload="metadata"` + poster)
- Imagens em AVIF/WebP com `sizes` correto e `priority` só no hero
- GSAP importado por módulo (`gsap/ScrollTrigger`), sem bundle completo
- Mapa carregado sob interação

SEO: Metadata API completa, canonical, OG image própria gerada em rota,
`robots`, `sitemap`. JSON-LD `@type: Dentist` com `address`,
`openingHoursSpecification`, `aggregateRating`, `medicalSpecialty`.

## 11. Acessibilidade

Contraste AA em todo texto (o ouro sobre branco **não** passa em corpo — por
isso ele só existe em fio e em caixa alta ≥14px com peso 500 sobre fundo
escuro ou em elementos não textuais).

Navegação completa por teclado, foco visível com anel petróleo, skip link,
landmarks semânticos, `alt` descritivo, lightbox e accordion com ARIA correto,
slider antes/depois operável por seta.

## 12. Critérios de aceite

Verificáveis, não opinativos:

1. `npm run build` limpo, sem warning de ESLint ou de tipo.
2. Lighthouse mobile ≥95 nas quatro categorias, no build de produção.
3. **Scrub verificado visualmente com Playwright headless**: screenshots em 5
   posições de scroll do hero mostrando frames diferentes e coerentes com a
   ordem dos planos. Code review e `curl` não valem como verificação.
4. Screenshots de todas as seções em 390px, 768px e 1440px, olhados um a um.
5. `prefers-reduced-motion` ativo: página completa, legível, sem movimento.
6. Teclado sozinho percorre o site inteiro, abre e fecha o lightbox, opera o
   accordion e move o slider.
7. Nenhum texto do site contém "excelência", "soluções personalizadas" ou
   "compromisso com o seu sorriso".

## 13. Fora de escopo

- Framer Motion (decisão da seção 5)
- Formulário com backend — "Agendar Consulta" leva ao WhatsApp
- CMS, blog, área do paciente, multi-idioma
- Cookie banner (site sem analytics de terceiros)
