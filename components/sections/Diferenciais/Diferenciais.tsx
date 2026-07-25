"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/ui/Reveal/Reveal";
import { DIFERENCIAIS } from "@/lib/conteudo";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Diferenciais.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Diferenciais() {
  const linha = useRef<HTMLDivElement>(null);
  const preenche = useRef<HTMLSpanElement>(null);
  const [acesos, setAcesos] = useState(0);

  useEffect(() => {
    const node = linha.current;
    const barra = preenche.current;
    if (!node || !barra) return;

    if (prefersReducedMotion()) {
      setAcesos(DIFERENCIAIS.length);
      barra.style.transform = "scaleX(1)";
      return;
    }

    const vertical = window.innerWidth < 900;

    const st = ScrollTrigger.create({
      trigger: node,
      start: vertical ? "top 75%" : "top 72%",
      end: vertical ? "bottom 70%" : "bottom 55%",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        barra.style.transform = vertical ? `scaleY(${p})` : `scaleX(${p})`;
        setAcesos(Math.round(p * DIFERENCIAIS.length));
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section className={s.secao} data-secao="Tecnologia">
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">Como trabalhamos</span>
        </Reveal>
        <Reveal as="h2" modo="mask" delay={0.05} className={s.titulo}>
          Nada disso é vitrine.
        </Reveal>

        <div ref={linha} className={s.linha}>
          <span className={s.trilho} aria-hidden />
          <span ref={preenche} className={s.preenche} aria-hidden />

          {DIFERENCIAIS.map((d, i) => (
            <div
              key={d.titulo}
              className={`${s.item} ${i < acesos ? s.aceso : ""}`}
            >
              <span className={s.ponto} aria-hidden />
              <span className={s.ordem}>0{i + 1}</span>
              <h3 className={s.nome}>{d.titulo}</h3>
              <p className={s.texto}>{d.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
