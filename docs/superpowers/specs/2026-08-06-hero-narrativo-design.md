# Hero narrativo e cursor de dente

Data: 2026-08-06

## O problema

O hero tem 620vh de curso e sete planos de filme. A copy some em 18% desse
curso (`Hero.tsx:48-57`) e nada entra no lugar. Sobram ~500vh de filme mudo.

Quem rola não vê um arco — vê vídeo, vídeo, vídeo. A câmera anda da porta até
o sorriso, mas o site não diz o que está acontecendo em nenhum ponto do
caminho, então o percurso não vira argumento.

## O que já existe e não muda

O rig narrativo está construído. Esta mudança é editorial e de camada de
texto, não de arquitetura.

- `components/VideoRig` — vídeo fixo em tela cheia, rAF perseguindo
  `world.progresso` com damping e salto direto acima de 0.12. Intacto.
- `lib/world.ts` — o canal mutável entre o ScrollTrigger do Hero e o rAF do
  rig. Intacto.
- `lib/scenes.ts` — os sete planos do master (32,53s) com seus limites nos
  centros dos crossfades. Ganha texto, mantém os números.
- `components/sections/Interludio` — continua reencontrando o plano 07
  (`V0 = 0.855`) mais adiante na página. Intacto.
- A altura de 620vh do hero. Sete capítulos em 620vh dão ~88vh cada.

## Os sete capítulos

Um capítulo por plano, na janela `v0→v1` que `lib/scenes.ts` já define.

| # | Plano | Linha | Apoio |
|---|---|---|---|
| 01 | A porta | Atendemos cinco pessoas por dia. | — |
| 02 | A recepção | Você chega e não espera. | Cinco nomes na agenda do dia. Ninguém é atendido com o próximo esperando na porta. |
| 03 | O encontro | A primeira consulta são cinquenta minutos. | Escaneamento, fotos e conversa. Nenhum procedimento no mesmo dia. |
| 04 | O corredor | Onze pessoas trabalham aqui. Cinco pacientes passam por dia. | — |
| 05 | O consultório | O escaneamento leva quatro minutos. | A moldagem com massa saiu de cena. Ninguém sente falta. |
| 06 | O detalhe | Você vê o resultado antes do primeiro desgaste. | O sorriso é desenhado em 3D e testado em provisório. Você aprova, aí começa. |
| 07 | O sorriso | Comece pelos cinquenta minutos. | Sem procedimento no mesmo dia. Sem compromisso de fechar nada. |

Todo fato acima já é afirmado em `lib/conteudo.ts` (`SOBRE`, `DIFERENCIAIS`,
`JORNADA`, `FAQ`). Nenhum número novo entra no site por esta mudança.

O 04 e o 01 não têm apoio de propósito: são os respiros do arco. Sete
parágrafos seguidos com duas linhas cada viram lista, não filme.

### Nota editorial

O roteiro que originou este spec propunha "Não é apenas uma consulta, é uma
experiência pensada desde o primeiro passo", "Tecnologia. Precisão. Conforto."
e "Pronto para transformar seu sorriso?". O arco de sete tempos veio dali e é
o que sustenta este design. As frases foram reescritas: são o registro que o
`AGENTS.md` proíbe, e a tríade de abstrações já havia sido rejeitada uma vez
neste site (`Hero.tsx:13-25`).

## Primeira dobra

O capítulo 01 fica com a eyebrow (`Jardins · São Paulo`), o H1 e a seta de
rolagem. Saem da primeira dobra: o subtítulo, os dois botões e a linha de
indicadores.

O caminho de conversão não fecha: o `Agendar` da navbar continua fixo no topo,
e o capítulo 07 traz os dois botões de volta em tela cheia.

O H1 continua sendo o elemento de LCP e continua ancorado embaixo à esquerda,
com a mesma revelação por máscara em CSS. A métrica não se mexe.

## Ancoragem dos capítulos 02–07

Alternando: 02 à esquerda, 03 à direita, 04 à esquerda, e assim por diante.

**Risco conhecido.** O assunto de cada plano não está no mesmo lugar do quadro
em todos os sete. Onde o texto cair sobre o assunto, o lado daquele capítulo é
invertido — a tabela de lados é dado de implementação, não regra fixa. Isso se
decide olhando screenshot do Playwright em cada centro de capítulo, nunca por
leitura de código.

## Componentes

### `components/Capitulos/` (novo)

Sticky dentro do hero, uma camada acima do vídeo e abaixo da nav.

Escuta o mesmo `ScrollTrigger` que alimenta `world.progresso` — não cria um
segundo trigger sobre o mesmo elemento. Recebe o progresso e, para cada
capítulo, calcula opacidade e deslocamento dentro da própria janela
`v0→v1`: entra nos primeiros ~18% da janela, fica, sai nos últimos ~18%.

Sem React state por frame. `gsap.quickSetter` escrevendo direto no DOM, mesmo
motivo documentado em `lib/world.ts`. Os sete capítulos são renderizados de
uma vez no HTML (bom para SEO e para reduced-motion) e só a opacidade muda.

A transição é opacidade + `y` + `blur`. Sem `scale`: em texto de display o
scale borra a serifa do Cormorant durante a interpolação.

O capítulo 07 contém os dois `<a>` de CTA, com `data-magnetico`, apontando
para `WHATSAPP_URL` e `#sobre` — os mesmos destinos de hoje. Eles precisam
receber `pointer-events` só enquanto o capítulo 07 está visível, senão viram
alvos invisíveis sobre o filme inteiro.

Se passar de ~200 linhas, o capítulo vira subcomponente `Capitulo/`.

### `components/sections/Hero/` (encolhe)

Mantém: a seção de 620vh, o `palco` sticky, o `ScrollTrigger` que escreve em
`world.progresso`, o H1 com máscara por palavra, a eyebrow e a seta.

Sai do desktop: subtítulo, bloco de ações e indicadores — continuam no JSX,
escondidos por CSS acima de 1023px (ver **Mobile e reduced-motion**).

Sai de vez: o `gsap.to` que apagava `#alva-scrim`. O `gsap.to` de saída passa
a mirar só o bloco do capítulo 01.

### `components/VideoRig/VideoRig.module.css` (scrim)

Hoje `#alva-scrim` vai a zero em 18% do hero. Com texto branco sobre o filme
até 100%, ele passa a ficar. A opacidade do scrim acompanha o progresso:
mais forte nos capítulos com apoio (02, 03, 05, 06, 07), mais leve nos
respiros (01 depois da saída do H1, e 04).

Critério: texto branco sobre o frame precisa passar AA. Isso se mede no
screenshot, não no CSS.

### `components/Cursor/` (troca de forma)

Silhueta de incisivo central preenchida, em SVG inline: coroa reta em cima,
duas raízes afinando embaixo. ~26px de altura.

Mantém: `mix-blend-mode: difference`, lerp de 0.15, o comportamento
`[data-magnetico]` (puxão de até 8px), a expansão em `[data-cursor]` com
rótulo, e o desligamento em `pointer: coarse` e reduced-motion.

Sai: o ponto central de 4px. Com forma cheia ele vira sujeira.

No estado expandido o dente cresce e o rótulo aparece dentro dele, em caixa
alta — o rótulo já é ≥14px peso 500 hoje, então segue elegível ao ouro se for
o caso; o padrão continua branco sobre grafite.

## Mobile e reduced-motion

Sem scrub, sem capítulos. `Capitulos` não monta em `!isDesktop()` nem em
`prefersReducedMotion()`.

O mobile continua com a dobra única de hoje: H1, subtítulo, os dois botões e
os indicadores. Cortar a conversão numa tela onde o filme não anda seria
trocar receita por nada.

Consequência: o subtítulo, as ações e os indicadores continuam existindo no
Hero, renderizados sempre e escondidos por CSS acima de 1023px. Não são
removidos do JSX — o HTML precisa deles para SEO e para o mobile.

## Verificação

`AGENTS.md`: scrub se verifica com screenshot do Playwright, olhado de
verdade. Code review e `curl` não valem.

- `scripts/verifica-scrub.mjs` passa de 6 para 7 passos, posicionados no
  centro de cada janela de capítulo em vez de linearmente. Cada screenshot
  precisa mostrar o frame certo **e** o texto certo, legível.
- Um passo extra por capítulo na fronteira (`v1` de cada plano) para confirmar
  que nunca há dois capítulos visíveis ao mesmo tempo.
- Contraste do texto sobre o frame: medido no screenshot de cada centro.
- O cursor não aparece em screenshot do Playwright. Verificação separada:
  mover o ponteiro com `page.mouse.move` e capturar, ou conferir no browser.
- Lighthouse ≥95 depois da mudança. Sete blocos de texto sempre no DOM com
  opacidade animada não deve custar nada, mas o número se confere.

## Fora de escopo

- Reencodar ou recortar o vídeo. Os sete planos e o `-g 1` continuam como
  estão.
- A seção `Cta` do rodapé. O capítulo 07 é fecho de ato, não substituto dela.
- O `Interludio`, o `FundoProgressivo` e o `Arco`.
- Qualquer mudança nas seções de `Sobre` em diante.
