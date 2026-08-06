# Tour em pilha — design

Data: 2026-08-06
Status: aprovado (design), pendente plano de implementação

## 1. O problema

A seção Tour é hoje um grid de seis fotos com lightbox. Ela mostra o ambiente,
mas não faz ninguém sentir que caminhou pela clínica. É uma galeria.

## 2. A restrição que decide tudo

O hero **já é** um tour. `lib/scenes.ts` define sete planos com pin e scrub de
vídeo — A porta, A recepção, O encontro, O corredor, O consultório, O detalhe,
O sorriso — cada um com uma linha de texto que entra e sai.

Qualquer redesenho do Tour com pin, tela cheia e capítulos de cômodo repete o
hero em stills. Os mesmos cômodos, a mesma gramática de scroll, a mesma
estrutura de capítulo. A seção ficaria mais bonita e o site, mais pobre: dois
momentos gastando a mesma munição.

**A divisão de trabalho:** o hero conta o **processo** (cinquenta minutos,
quatro minutos de escaneamento, aprovação em 3D antes do desgaste). O Tour
conta o **espaço** (luz, orientação, material, o que cada sala faz). Nenhuma
frase se repete entre os dois porque falam de coisas diferentes.

## 3. Forma escolhida — pilha de cartões

Quatro cartões que grudam no topo em alturas progressivas, formando uma
escadinha de bordas. Conforme o scroll avança, o cartão do topo cresce de leve
e o anterior recua em opacidade.

Descartadas, e por quê:

| Alternativa | Motivo da recusa |
|---|---|
| Painéis full-screen com pin | Repete o hero, que é a coisa que o Tour não pode fazer |
| Scroll horizontal | Sequestra o scroll; quebra em mobile e em leitor de tela |
| Parallax em zigue-zague | Boa, mas o cliente escolheu a pilha |

Ressalva registrada em conversa: stacking cards virou padrão de template por
volta de 2023. A escolha foi do cliente, com essa informação na mesa.

## 4. Curadoria — quatro cômodos, não seis

| # | Arquivo | Cômodo |
|---|---|---|
| 01 | `tour-01.webp` | Recepção |
| 02 | `tour-02.webp` | Sala de espera |
| 03 | `tour-03.webp` | Consultório 1 |
| 04 | `tour-04.webp` | Sala do escâner |

Ficam de fora:

- `tour-05.webp` (Instrumental) — é um close, não um cômodo. Não cabe na
  lógica de "sala" que a pilha estabelece.
- `tour-06.webp` (Fachada) — o hero abre na porta, no plano 01. Colide.

Os dois arquivos permanecem em `public/img/`. Não há custo em mantê-los e
podem servir outra seção depois.

Custo de scroll: ~320vh. Com seis seriam ~480vh, numa página que já tem
18.252px.

## 5. Texto

Regra editorial do projeto, sem exceção aqui: frases curtas, um detalhe
concreto por parágrafo. Proibido "excelência", "soluções personalizadas",
"compromisso com o seu sorriso".

| # | Cômodo | Linha |
|---|---|---|
| 01 | Recepção | Seis poltronas. Raramente duas ocupadas ao mesmo tempo. |
| 02 | Sala de espera | A luz entra pelo leste. Às nove da manhã ela chega no chão de tábua corrida. |
| 03 | Consultório 1 | A cadeira fica de costas para a janela. Você olha para a árvore, não para o refletor. |
| 04 | Sala do escâner | A única sala sem janela. Escuro por projeto — a tela precisa ser a coisa mais clara do ambiente. |

Duas escolhas que merecem registro:

- O cartão 01 **mostra** os cinco pacientes por dia em vez de repetir o
  número. Seis poltronas quase sempre vazias dizem a mesma coisa sem soar como
  argumento de venda, e sem colidir com o plano 02 do hero, que já afirma o
  fato em palavras.
- O cartão 04 explica a paleta escura dentro da ficção. A sala sem janela
  existe porque a tela do escâner precisa dominar o ambiente — a mesma lógica
  que rege o site inteiro desde a virada para preto e ouro.

O eyebrow ("A clínica por dentro") e o título ("Madeira, vidro e luz da
manhã.") continuam, com o mesmo `Reveal` e o mesmo `modo="palavras"` de hoje.
Descrevem espaço, não processo — já estavam do lado certo da divisão. O
cabeçalho não entra na pilha: ele rola normalmente e os cartões começam a
grudar depois dele.

## 6. Mecânica

**Sticky, não pin.** Cada cartão usa `position: sticky` com `top` progressivo
(`calc(12vh + var(--i) * 14px)`). O empilhamento é CSS puro e sobrevive sem
JavaScript.

O GSAP entra só para o scrub, um ScrollTrigger por cartão:

- cartão atual: `scale` 1 → 1.05
- cartão anterior: `opacity` 1 → 0.45

Sticky é mais barato que pin, não cria spacer no DOM e não disputa o scroll
com o Lenis. `ease: "none"` e `scrub: true`, como no resto do site.

## 7. Paleta

A seção hoje pinta o fundo de `--superficie`. Isso inverte: a **seção volta
para `--fundo`** e os **cartões ficam em `--superficie`**. Sem esse degrau o
cartão não lê como objeto sobre uma superfície — lê como um retângulo do mesmo
tom.

- fio de 1px em `--ouro` na borda superior do cartão
- rótulo do cômodo em caixa alta, 14px, peso 500, dourado
- nenhum preenchimento dourado, nenhum botão sólido

Dentro da regra do `AGENTS.md`.

## 8. Arquivos

```
components/sections/Tour/
  Tour.tsx            orquestra a pilha e registra os ScrollTriggers
  Tour.module.css
  CardTour/
    CardTour.tsx      um cartão: foto, rótulo, linha
    CardTour.module.css
```

- `Lightbox.tsx` e `Lightbox.module.css` são **removidos**. Só o Tour os
  usava, e cartão em tela cheia não pede ampliação.
- `lib/conteudo.ts`: `TOUR` cai para quatro entradas e ganha `titulo` e
  `texto`. O campo `area` (as áreas `a`–`f` do grid) morre com o grid.

Um componente por pasta, com seu `.module.css` ao lado, conforme o
`AGENTS.md`.

## 9. Acessibilidade

- `prefers-reduced-motion: reduce` desliga o scrub **e** o sticky. A pilha
  vira uma lista empilhada comum, uma foto embaixo da outra. Sem movimento
  residual.
- `alt` real em cada foto, descrevendo o cômodo.
- Os cartões deixam de ser `<button>`. Sem lightbox, não há ação — viram
  `<figure>` com `<figcaption>`. Isso tira quatro paradas falsas do tab.
- Contraste do texto sobre `--superficie` verificado por
  `scripts/verifica-contraste.mjs`, que já existe e mede o fundo composto.

## 10. Verificação

- `scripts/verifica-contraste.mjs` sem nós reprovados.
- Screenshot do Playwright em três alturas da pilha, **olhado de verdade** —
  a regra do `AGENTS.md` sobre scrub vale aqui: code review e `curl` não
  valem.
- `npm run build` limpo.
- Teste com `prefers-reduced-motion` ligado, confirmando que a pilha desmonta.
