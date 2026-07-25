/** Os 7 planos do master (32,53s). Os limites são os centros dos crossfades
 *  de 0,4s — por isso não são frações redondas. */
export const PLANOS = [
  { nome: "A porta", v0: 0.0, v1: 0.1475 },
  { nome: "A recepção", v0: 0.1475, v1: 0.2889 },
  { nome: "O encontro", v0: 0.2889, v1: 0.4303 },
  { nome: "O corredor", v0: 0.4303, v1: 0.5717 },
  { nome: "O consultório", v0: 0.5717, v1: 0.7131 },
  { nome: "O detalhe", v0: 0.7131, v1: 0.8545 },
  { nome: "O sorriso", v0: 0.8545, v1: 1.0 },
] as const;

export const planoEm = (t: number) => {
  const i = PLANOS.findIndex((p) => t >= p.v0 && t < p.v1);
  return i < 0 ? PLANOS.length - 1 : i;
};
