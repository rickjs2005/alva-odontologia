"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PATH_ARCO, VIEWBOX_ARCO } from "@/lib/arco";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import s from "./Arco.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  modo: "progresso" | "assinatura";
  className?: string;
};

export default function Arco({ modo, className }: Props) {
  const traco = useRef<SVGPathElement>(null);
  const raiz = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const path = traco.current;
    if (!path) return;

    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      return;
    }

    if (modo === "progresso") {
      // preenche conforme o documento inteiro rola
      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          path.style.strokeDashoffset = String(1 - self.progress);
        },
      });
      return () => st.kill();
    }

    // assinatura: desenha-se ao entrar em cena
    const anim = gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: EASE,
      scrollTrigger: { trigger: raiz.current, start: "top 88%", once: true },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [modo]);

  return (
    <svg
      ref={raiz}
      className={`${s.svg} ${modo === "progresso" ? s.progresso : s.assinatura} ${
        className ?? ""
      }`}
      viewBox={VIEWBOX_ARCO}
      aria-hidden
      focusable="false"
    >
      {modo === "progresso" && (
        <path className={`${s.traco} ${s.fundo}`} d={PATH_ARCO} />
      )}
      <path
        ref={traco}
        className={s.traco}
        d={PATH_ARCO}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
      />
    </svg>
  );
}
