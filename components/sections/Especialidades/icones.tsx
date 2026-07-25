/** Ícones autorais, desenhados para esta clínica. Traço de 1px, sem
 *  preenchimento, nenhum de biblioteca. Cada path recebe pathLength={1} para
 *  o card poder desenhá-los no hover via stroke-dashoffset. */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { classeTraco?: string };

const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

const traco = (classe?: string) => ({
  className: classe,
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
});

/** Coroa sobre pino de titânio, visto em corte. */
export function IconeImplantes({ classeTraco, ...p }: Props) {
  return (
    <svg {...base} {...p}>
      <path
        {...traco(classeTraco)}
        d="M15 21c0-5.5 3.8-9 9-9s9 3.5 9 9c0 3.7-.9 6.6-2 8.5H17c-1.1-1.9-2-4.8-2-8.5Z"
      />
      <path {...traco(classeTraco)} d="M21 33h6l-1 9h-4l-1-9Z" />
      <path {...traco(classeTraco)} d="M20.6 36.2h6.8M20.9 39h6.2" />
    </svg>
  );
}

/** Dente com a escala de tom subindo em três degraus. */
export function IconeClareamento({ classeTraco, ...p }: Props) {
  return (
    <svg {...base} {...p}>
      <path
        {...traco(classeTraco)}
        d="M24 11c-5.5 0-9 3.6-9 9 0 6.3 1.8 11.7 3.6 15.3.9 1.8 3 1.7 3.7-.2l1.4-4c.3-.8 1.3-.8 1.6 0l1.4 4c.7 1.9 2.8 2 3.7.2C31.2 31.7 33 26.3 33 20c0-5.4-3.5-9-9-9Z"
      />
      <path {...traco(classeTraco)} d="M19.5 20.5h4M19.5 25h6M19.5 29.5h3" />
      <path {...traco(classeTraco)} d="M33.5 13.5v5M31 16h5" />
    </svg>
  );
}

/** A lâmina de porcelana descolando da face do dente. */
export function IconeFacetas({ classeTraco, ...p }: Props) {
  return (
    <svg {...base} {...p}>
      <path
        {...traco(classeTraco)}
        d="M26 11c-5 0-8.2 3.6-8.2 9 0 6.3 1.7 11.7 3.3 15.3.8 1.8 2.7 1.7 3.4-.2l1.2-4c.3-.8 1.2-.8 1.5 0l1.2 4c.7 1.9 2.6 2 3.4.2C33.3 31.7 35 26.3 35 20c0-5.4-3.2-9-9-9Z"
      />
      <path
        {...traco(classeTraco)}
        d="M20.5 13.8c-2.6 1.4-4 4.2-4 8.2 0 5.3 1.2 10 2.5 13.4"
      />
    </svg>
  );
}

/** Três dentes, o fio e um bráquete no do meio. */
export function IconeOrtodontia({ classeTraco, ...p }: Props) {
  return (
    <svg {...base} {...p}>
      <path
        {...traco(classeTraco)}
        d="M11 17.5c0-2 1.4-3.5 3.4-3.5s3.4 1.5 3.4 3.5v9c0 2.2-1.3 3.5-3.4 3.5s-3.4-1.3-3.4-3.5v-9Z"
      />
      <path
        {...traco(classeTraco)}
        d="M20.4 16.5c0-2.2 1.5-3.9 3.6-3.9s3.6 1.7 3.6 3.9v11c0 2.4-1.4 3.9-3.6 3.9s-3.6-1.5-3.6-3.9v-11Z"
      />
      <path
        {...traco(classeTraco)}
        d="M30.2 17.5c0-2 1.4-3.5 3.4-3.5S37 15.5 37 17.5v9c0 2.2-1.3 3.5-3.4 3.5s-3.4-1.3-3.4-3.5v-9Z"
      />
      <path {...traco(classeTraco)} d="M9 22.5h30" />
      <path {...traco(classeTraco)} d="M21.6 20.2h4.8v4.6h-4.8z" />
    </svg>
  );
}

/** Perfil facial reduzido a três linhas e o eixo de proporção. */
export function IconeHarmonizacao({ classeTraco, ...p }: Props) {
  return (
    <svg {...base} {...p}>
      <path
        {...traco(classeTraco)}
        d="M30 9c-6.2 1.4-10.4 6.2-10.4 12.2 0 2.4.7 4 .7 5.2 0 1.1-1.4 1.6-1.4 2.7 0 1 .9 1.4 2.1 1.6 0 3.2.3 5.6 1.6 7.1 1.6 1.9 4.5 2.2 7.4 2.2"
      />
      <path {...traco(classeTraco)} d="M23.4 31.6c1.7 1 3.6 1 5.3 0" />
      <path {...traco(classeTraco)} d="M36 12v24" />
      <circle {...traco(classeTraco)} cx="36" cy="24" r="2" />
    </svg>
  );
}

/** Lupa sobre a borda incisal — o ajuste fino. */
export function IconeEstetica({ classeTraco, ...p }: Props) {
  return (
    <svg {...base} {...p}>
      <path
        {...traco(classeTraco)}
        d="M18 14c-3.6 0-6 2.5-6 6.5 0 4.6 1.3 8.6 2.5 11.3.6 1.4 2 1.3 2.5-.1l.9-3c.2-.6.9-.6 1.1 0l.9 3c.5 1.4 1.9 1.5 2.5.1.5-1.2 1-2.6 1.4-4.2"
      />
      <circle {...traco(classeTraco)} cx="31" cy="21" r="8" />
      <path {...traco(classeTraco)} d="m36.9 26.6 4.6 4.6" />
      <path {...traco(classeTraco)} d="M28 21h6" />
    </svg>
  );
}

export const ICONES = {
  implantes: IconeImplantes,
  clareamento: IconeClareamento,
  facetas: IconeFacetas,
  ortodontia: IconeOrtodontia,
  harmonizacao: IconeHarmonizacao,
  estetica: IconeEstetica,
} as const;
