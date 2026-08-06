"use client";

import { useEffect, useRef, useState } from "react";
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
  const caixa = useRef<HTMLDivElement>(null);
  const [secao, setSecao] = useState("O filme");

  useEffect(() => {
    const path = traco.current;
    if (!path) return;

    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      return;
    }

    if (modo === "progresso") {
      // preenche conforme o documento inteiro rola, e diz onde você está
      const secoes = [...document.querySelectorAll<HTMLElement>("main > section")];
      const nomes = secoes.map(
        (n) => n.dataset.secao ?? n.id ?? "—"
      );

      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          path.style.strokeDashoffset = String(1 - self.progress);

          const meio = window.scrollY + window.innerHeight * 0.5;
          let atual = 0;
          secoes.forEach((n, i) => {
            if (n.offsetTop <= meio) atual = i;
          });
          setSecao(nomes[atual] ?? "—");
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

  const desenho = (
    <svg
      ref={raiz}
      className={`${s.svg} ${modo === "progresso" ? s.desenho : s.assinatura} ${
        modo === "assinatura" ? className ?? "" : ""
      }`}
      viewBox={VIEWBOX_ARCO}
      aria-hidden
      focusable="false"
    >
      {modo === "progresso" && (
        <>
          <path className={`${s.traco} ${s.fundo}`} d={PATH_ARCO} />
          {/* a base fecha a forma: sem ela o arco lia como traço solto */}
          <line className={s.base} x1="40" y1="240" x2="960" y2="240" />
        </>
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

  if (modo === "assinatura") return desenho;

  return (
    <div
      ref={caixa}
      className={s.progresso}
      aria-hidden
    >
      <span className={s.rotulo}>{secao}</span>
      {desenho}
    </div>
  );
}
