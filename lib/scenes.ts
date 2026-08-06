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
 *  Os respiros (01 depois da saída do H1, e 04) pedem menos. `SCRIM_BASE`
 *  (0.34, em Capitulos.tsx) é um piso: `peso` abaixo disso não muda mais
 *  nada, e o 0.4 de "O corredor" já está quase nele. */
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
    peso: 0.75,
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
    peso: 0.4,
  },
  {
    nome: "O consultório",
    v0: 0.5717,
    v1: 0.7131,
    linha: "O escaneamento leva quatro minutos.",
    apoio: "A moldagem com massa saiu de cena. Ninguém sente falta.",
    lado: "dir",
    peso: 0.75,
  },
  {
    nome: "O detalhe",
    v0: 0.7131,
    v1: 0.8545,
    linha: "Você vê o resultado antes do primeiro desgaste.",
    apoio:
      "O sorriso é desenhado em 3D e testado em provisório. Você aprova, aí começa.",
    lado: "esq",
    peso: 0.75,
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

/** Fração de saída do capítulo 01 (o H1), 0→1. Hero.tsx usa isto para animar
 *  o H1 para fora; Capitulos.tsx usa o mesmo número para apagar o scrim
 *  direcional que existe só para servir de contraste ao H1. Os dois têm que
 *  andar no mesmo relógio — um anima o texto, o outro apaga o fundo atrás
 *  dele, e calculados em separado eles dessincronizam em silêncio na
 *  primeira vez que alguém mexe num dos dois sem lembrar do outro. */
export const saidaDoH1 = (p: number) => {
  const { v1 } = PLANOS[0];
  const n = (p - v1 * 0.55) / (v1 * 0.45);
  return n < 0 ? 0 : n > 1 ? 1 : n;
};
