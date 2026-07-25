/** Tokens de movimento. Regra: nada entra com mais de 24px de deslocamento,
 *  nada dura menos de 0.4s nem mais de 1.4s. */
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

/** Acima disso o hero pina e o vídeo scruba. Abaixo, vídeo comum. */
export const BP_DESKTOP = 1024;

export const isDesktop = () =>
  typeof window !== "undefined" && window.innerWidth >= BP_DESKTOP;
