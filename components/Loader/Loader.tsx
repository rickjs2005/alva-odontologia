"use client";

import { useEffect, useState } from "react";
import { PATH_ARCO, VIEWBOX_ARCO } from "@/lib/arco";
import s from "./Loader.module.css";

/** A cortina de entrada. A saída é do CSS (ver módulo) — o JS só serve para
 *  antecipá-la quando o vídeo fica pronto antes da hora. */
export default function Loader() {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const sair = () => setSaindo(true);
    window.addEventListener("alva:pronto", sair, { once: true });
    return () => window.removeEventListener("alva:pronto", sair);
  }, []);

  return (
    <div className={`${s.loader} ${saindo ? s.saindo : ""}`} aria-hidden>
      <span className={s.marca}>ALVA</span>
      <svg className={s.arco} viewBox={VIEWBOX_ARCO} focusable="false">
        <path
          className={s.traco}
          d={PATH_ARCO}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
        />
      </svg>
      <span className={s.rotulo}>Odontologia de Precisão</span>
    </div>
  );
}
