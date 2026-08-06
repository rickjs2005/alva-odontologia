"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/ui/Reveal/Reveal";
import { TOUR } from "@/lib/conteudo";
import { prefersReducedMotion } from "@/lib/motion";
import CardTour from "./CardTour/CardTour";
import s from "./Tour.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Tour() {
  const pilha = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = pilha.current;
    if (!node || prefersReducedMotion()) return;

    const cards = [...node.querySelectorAll<HTMLElement>("[data-card]")];
    // o último não recua: não há cartão depois dele para cobri-lo
    const gatilhos = cards.slice(0, -1).map((card, i) =>
      gsap.fromTo(
        card,
        { scale: 1, opacity: 1 },
        {
          // encolhe, não cresce. A spec pedia 1,05, mas quem recua crescendo
          // fica maior que o cartão da frente e transborda dos lados dele —
          // a profundidade inverte. Visto no screenshot da primeira volta.
          scale: 0.96,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: {
            // o gatilho é o cartão SEGUINTE, nunca o próprio: um elemento
            // sticky mente sobre a própria posição e o ScrollTrigger mede a
            // mentira
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top 12%",
            scrub: true,
          },
        },
      ),
    );

    return () => {
      gatilhos.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <section id="tour" className={s.secao} data-secao="Tour">
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">A clínica por dentro</span>
        </Reveal>
        <Reveal as="h2" modo="palavras" delay={0.05} className={s.titulo}>
          Madeira, vidro e luz da manhã.
        </Reveal>

        <div ref={pilha} className={s.pilha}>
          {TOUR.map((c, i) => (
            <CardTour
              key={c.src}
              src={c.src}
              titulo={c.titulo}
              texto={c.texto}
              indice={i}
              prioridade={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
