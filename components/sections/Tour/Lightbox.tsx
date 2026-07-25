"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import s from "./Lightbox.module.css";

type Foto = { src: string; legenda: string };

type Props = {
  fotos: readonly Foto[];
  indice: number;
  onFechar: () => void;
  onNavegar: (i: number) => void;
};

export default function Lightbox({ fotos, indice, onFechar, onNavegar }: Props) {
  const tela = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  const anterior = () => onNavegar((indice - 1 + fotos.length) % fotos.length);
  const proxima = () => onNavegar((indice + 1) % fotos.length);

  useEffect(() => {
    // trava o scroll da página por baixo (inclui o Lenis)
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("alva:travar-scroll"));
    fechar.current?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onFechar();
      if (e.key === "ArrowLeft") return anterior();
      if (e.key === "ArrowRight") return proxima();
      if (e.key !== "Tab") return;

      // foco preso: Tab circula só dentro do modal
      const focaveis = tela.current?.querySelectorAll<HTMLElement>("button");
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = antes;
      window.dispatchEvent(new CustomEvent("alva:soltar-scroll"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, fotos.length]);

  const foto = fotos[indice];

  return (
    <div
      ref={tela}
      className={s.tela}
      role="dialog"
      aria-modal="true"
      aria-label={`Tour da clínica: ${foto.legenda}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <button
        ref={fechar}
        type="button"
        className={s.fechar}
        onClick={onFechar}
        aria-label="Fechar galeria"
      >
        ✕
      </button>

      <div className={s.quadro}>
        <Image
          className={s.foto}
          src={foto.src}
          alt={foto.legenda}
          width={1400}
          height={1400}
          sizes="92vw"
          priority
        />
        <p className={s.legenda}>{foto.legenda}</p>

        <button
          type="button"
          className={`${s.botao} ${s.anterior}`}
          onClick={anterior}
          aria-label="Foto anterior"
        >
          ←
        </button>
        <button
          type="button"
          className={`${s.botao} ${s.proxima}`}
          onClick={proxima}
          aria-label="Próxima foto"
        >
          →
        </button>
      </div>

      <span className={s.contador}>
        {String(indice + 1).padStart(2, "0")} / {String(fotos.length).padStart(2, "0")}
      </span>
    </div>
  );
}
