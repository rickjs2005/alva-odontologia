"use client";

import { useEffect, useState } from "react";
import { PATH_ARCO, VIEWBOX_ARCO } from "@/lib/arco";
import s from "./Loader.module.css";

/** Sai quando o VideoRig avisa que o vídeo pode tocar — ou depois de 2,5s,
 *  para a página nunca ficar refém de um vídeo que não veio. */
export default function Loader() {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    let feito = false;
    const sair = () => {
      if (feito) return;
      feito = true;
      setSaindo(true);
    };

    window.addEventListener("alva:pronto", sair, { once: true });
    const t = window.setTimeout(sair, 2500);

    return () => {
      window.removeEventListener("alva:pronto", sair);
      window.clearTimeout(t);
    };
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
