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
