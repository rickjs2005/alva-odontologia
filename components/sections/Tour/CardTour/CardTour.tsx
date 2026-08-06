import Image from "next/image";
import type { CSSProperties } from "react";
import s from "./CardTour.module.css";

type Props = {
  src: string;
  titulo: string;
  texto: string;
  /** posição na pilha: alimenta o --i que escalona o top do sticky */
  indice: number;
  /** só o primeiro cartão; os outros entram lazy */
  prioridade?: boolean;
};

export default function CardTour({
  src,
  titulo,
  texto,
  indice,
  prioridade = false,
}: Props) {
  return (
    <figure
      className={s.card}
      data-card={indice}
      style={{ "--i": indice } as CSSProperties}
    >
      <Image
        className={s.foto}
        src={src}
        alt={`${titulo} da clínica ALVA`}
        width={1400}
        height={1400}
        sizes="(max-width: 899px) 92vw, 68vw"
        priority={prioridade}
      />
      <figcaption className={s.legenda}>
        <span className={s.rotulo}>{titulo}</span>
        <p className={s.texto}>{texto}</p>
      </figcaption>
    </figure>
  );
}
