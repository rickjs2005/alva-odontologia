# Paleta escura: preto e ouro

Data: 2026-08-06
Branch: `paleta-escura`, empilhada sobre `hero-narrativo` (PR #1, não mergeada)

## O que muda

O site sai de "alvorada" — hero escuro que clareia até o branco — e passa a
ser escuro do topo ao rodapé, em preto e ouro.

```
--fundo:        #1A1A1A
--superficie:   #272726
--ouro-base:    #B08D57
--ouro:         #C9A961
--ouro-claro:   #E8D6A5
--texto:        #F8F8F8
```

O azul `--petroleo` (#0f4c81) sai do site. Não é escolha estética: sobre
`#1A1A1A` ele dá **1,97:1**. Azul profundo sobre quase-preto é ilegível.

## Contraste, medido

Sobre `#1A1A1A`:

| Cor | Ratio | Serve para |
|---|---|---|
| `#F8F8F8` | 16,4:1 | texto corrido, títulos |
| `#E8D6A5` | 12,1:1 | caixa alta, rótulos |
| `#C9A961` | 7,74:1 | fios, caixa alta |
| `#B08D57` | 5,63:1 | fios discretos |
| ~~`#0f4c81`~~ | 1,97:1 | nada |

Os três dourados passam AA com folga. Isso não afrouxa a regra de uso (ver
abaixo) — só significa que nenhum deles vai falhar por contraste onde for
usado dentro dela.

## A regra do ouro continua

`AGENTS.md` muda **só o hex**:

> **Ouro (`#C9A961`) só como fio de 1px ou caixa alta ≥14px peso 500.** Nunca
> preenchimento, nunca botão sólido dourado.

O ouro segue sendo acento raro. É o que o faz parecer caro.

**Uma cláusula não sobrevive, e não por afrouxamento:** a frase final da regra
hoje diz *"Em corpo de texto ele não passa AA — para isso existe
`--ouro-texto`"*. O `--ouro-texto` (#6f5626) existia para dar um tom da família
do ouro que passasse AA **sobre fundo claro**. Não há mais fundo claro, e o
ouro continua proibido em corpo de texto pela primeira metade da regra. O token
é deletado e a frase sai junto. A restrição de uso fica intacta.

## A alvorada vira "a luz subindo"

O `FundoProgressivo` não é deletado. Ele continua interpolando o fundo ao longo
do scroll, mas dentro do escuro: de `#1A1A1A` (frio, no hero) a `#272726`
(grafite quente, no rodapé).

Preserva o que o componente existe para fazer — dissolver a borda entre seções,
para o olho não conseguir apontar onde uma terminou — e mantém a descida com
direção. Deixa de ser o sol nascendo e passa a ser a luz da sala subindo.

As nove paradas atuais (`#202124 → #ffffff`) viram uma rampa curta entre os dois
tons. Poucas paradas, porque a distância é menor: um degrau grande demais entre
duas paradas próximas vira faixa visível.

## O botão primário

Fundo `--superficie`, fio de 1px em `--ouro`, texto em `--ouro-claro`.

Isso é mais fraco que o azul sólido que ele substitui — foi dito e foi a
escolha. A compensação é geométrica, não cromática: o CTA primário usa
`tamanho="gigante"` e ganha a seta (`seta`), que o componente `ui/Botao` já
suporta. Presença por área e por movimento, não por saturação.

O botão ghost mantém a estrutura de hoje: fio branco translúcido, texto
`--texto`.

## Os ~50 rgba crus

`rgba(32, 33, 36, α)` — o antigo grafite escrito à mão — aparece cerca de
cinquenta vezes nos arquivos de seção, fora do sistema de tokens. Num site
escuro cada uma dessas ocorrências está invertida: são escurecimentos sobre
fundo claro.

Elas não são substituídas uma a uma por `rgba(248, 248, 248, α)` com o mesmo
alfa — isso produziria fios brancos gritantes onde hoje há fios cinza discretos.
Entram quatro tokens semânticos, e cada ocorrência é mapeada para um deles:

```
--texto-2:     rgba(248, 248, 248, 0.72)   apoio, legendas
--texto-3:     rgba(248, 248, 248, 0.50)   metadados, HUD
--linha:       rgba(248, 248, 248, 0.12)   fios, divisores, bordas de card
--linha-forte: rgba(248, 248, 248, 0.22)   bordas de botão ghost, foco
```

O critério de mapeamento é a **função** da ocorrência, não o alfa antigo. Um
`rgba(32,33,36,0.08)` que era borda de card e um `rgba(32,33,36,0.22)` que era
borda de botão viram `--linha` e `--linha-forte` respectivamente, mesmo tendo
alfas distantes no original — porque sobre escuro a percepção de um fio branco
não é simétrica à de um fio preto.

Depois disso, `rgba(32, 33, 36, ...)` não deve sobrar em nenhum arquivo de
seção. As exceções legítimas são os scrims sobre vídeo (`VideoRig`,
`Capitulos`, `Interludio`), que escurecem frames de propósito e continuam
usando o grafite como cor de escurecimento.

## Três coisas globais que quebram em silêncio

Nenhuma delas dá erro; todas simplesmente param de fazer efeito.

**O grão** (`components/Grao`) usa `mix-blend-mode: overlay`. Overlay sobre
preto é quase inócuo — o grão que hoje dá textura de filme desaparece. Precisa
virar `soft-light` ou `screen`, com a opacidade recalibrada. É o item de maior
risco visual da mudança: sem grão, o site fica "renderizado" em vez de
"colorizado", que é exatamente o que esse componente existe para evitar.

**A vinheta** do mesmo componente fecha os cantos com `rgba(32,33,36,0.1)`.
Sobre `#1A1A1A` isso é invisível. Ou inverte para um brilho central sutil, ou
sai.

**A nav grudada** (`.colada`) vira vidro **branco** a 86% com texto grafite.
Passa a ser vidro escuro: `rgba(26,26,26,0.72)` com o mesmo `backdrop-filter`,
texto `--texto`, borda inferior `--linha`.

## Sombras

`--sombra` é composta de `rgba(32,33,36,α)` e tem um consumidor
(`Depoimentos`). Sombra preta sobre fundo preto não existe. O token vira
elevação por superfície: o card usa `--superficie` e um fio `--linha`, sem
sombra. `--sombra` é deletado.

## Cor de marca fora do CSS

Três lugares que o grep de CSS não pega:

- `app/layout.tsx:67` — `themeColor: "#202124"` → `#1A1A1A`
- `app/opengraph-image.tsx:19-20` — fundo `#202124` → `#1A1A1A`, texto
  `#ffffff` → `#F8F8F8`
- `app/opengraph-image.tsx:36` — o arco em `#c9a86a` → `#C9A961`

## Tokens: o mapa completo

| Hoje | Depois | Nota |
|---|---|---|
| `--branco` #ffffff | `--texto` #F8F8F8 | 34 usos; branco puro é agressivo sobre preto |
| `--grafite` #202124 | `--fundo` #1A1A1A | 12 usos, a maioria como cor de texto → vira `--texto` |
| `--ouro` #c9a86a | `--ouro` #C9A961 | 34 usos |
| `--ouro-claro` #e0c88f | `--ouro-claro` #E8D6A5 | 2 usos |
| `--ouro-texto` #6f5626 | deletado | 4 usos, todos em fundo claro que deixa de existir |
| `--petroleo` #0f4c81 | deletado | 13 usos em 6 componentes; 1,97:1 sobre o fundo novo |
| `--azul` #eaf5ff | deletado | 3 usos, fundo de seção clara |
| `--cinza` #f7f8fa | `--superficie` #272726 | 4 usos, fundo de seção clara |
| — | `--ouro-base` #B08D57 | novo, para fios que não devem gritar |
| `--sombra` | deletado | ver acima |

Os treze usos de `--petroleo` não têm substituto único. Cada um é classificado
em uma de três categorias, por função:

- **acento decorativo** (fio, ponto, ícone) → `--ouro`
- **ênfase de texto** (link, termo destacado) → `--texto`
- **preenchimento de ação** (o botão) → tratamento de fio dourado, acima

O mesmo vale para `--azul` e `--cinza` como fundos de seção: viram `--fundo` ou
`--superficie` conforme a seção precise ou não se destacar da vizinha.

## Verificação

O `AGENTS.md` exige screenshot do Playwright olhado de verdade. Aqui isso vale
para o site inteiro, não só para o scrub.

- `scripts/verifica-secoes.mjs` já percorre as 12 seções em três larguras. É a
  base: cada uma precisa ser olhada, uma por uma, nas três.
- `scripts/verifica-capitulos.mjs` (19 checagens) e `verifica-interludio.mjs`
  precisam continuar em 0 falhas — o hero e o interlúdio já eram escuros e não
  devem regredir.
- **Contraste:** um script novo que percorre as seções e mede o contraste real
  de cada nó de texto contra o pixel de fundo atrás dele, reportando o que não
  fecha AA. Numa inversão de ~50 valores, conferir no olho não escala; e o
  modo de falha aqui é silencioso — texto cinza sobre fundo cinza continua
  "funcionando".
- Lighthouse ≥95 e Performance atual (99) não devem cair. O risco está no
  `mix-blend-mode` do grão, que já custa composição de página inteira.

## Fora de escopo

- O vídeo do hero e seus sete planos.
- A copy. Nenhuma frase muda.
- A estrutura de seções, o layout, a tipografia.
- Os 2 erros de lint pré-existentes em `Diferenciais.tsx` e `Jornada.tsx`.
- O resíduo conhecido de `hero-narrativo`: desktop com reduced-motion ainda tem
  620vh de rolagem morta.
