"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";
import { EASE, DUR, prefersReducedMotion, isDesktop } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/clinica";
import s from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

const TITULO = "Seu sorriso merece tecnologia, precisão e cuidado.".split(" ");

export default function Hero() {
  const raiz = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // scrub: alimenta o world, que o VideoRig persegue
  useEffect(() => {
    const node = raiz.current;
    if (!node || prefersReducedMotion() || !isDesktop()) return;

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        world.progresso = self.progress;
      },
    });

    // a copy sai de cena cedo — depois dela o filme fica sozinho
    const saida = gsap.to([palco.current, "#alva-scrim"], {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: node,
        start: "top top",
        end: "18% top",
        scrub: 0.6,
      },
    });

    const sobe = gsap.to(palco.current, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: node,
        start: "top top",
        end: "18% top",
        scrub: 0.6,
      },
    });

    return () => {
      st.kill();
      saida.scrollTrigger?.kill();
      saida.kill();
      sobe.scrollTrigger?.kill();
      sobe.kill();
    };
  }, []);

  return (
    <section
      ref={raiz}
      className={s.hero}
      aria-label="Apresentação"
      data-secao="O filme"
    >
      <div ref={palco} className={s.palco}>
        <div className={s.conteudo}>
          <span className={`eyebrow ${s.eyebrow}`}>
            Jardins · São Paulo
          </span>

          {/* entrada por máscara, palavra a palavra. Em CSS e não em GSAP:
              sem JS o título continua aparecendo, e não há flash entre o
              paint e a hidratação */}
          <h1 ref={titulo} className={s.titulo}>
            {TITULO.map((p, i) => (
              <span key={`${p}-${i}`} className={s.palavra}>
                <i style={{ animationDelay: `${0.18 + i * 0.05}s` }}>
                  {p}
                </i>
              </span>
            ))}
          </h1>

          <p className={s.sub}>
            Tratamentos modernos com foco em conforto, estética e saúde bucal.
          </p>

          <div className={s.acoes}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.botao} ${s.primario}`}
              data-magnetico
            >
              Agendar Consulta
            </a>
            <a href="#sobre" className={`${s.botao} ${s.ghost}`} data-magnetico>
              Conhecer a Clínica
            </a>
          </div>

          <div className={s.indicadores}>
            <span className={s.estrelas} aria-hidden>
              ★★★★★
            </span>
            <span className="sr-only">Avaliação 4,9 de 5</span>
            <span className={s.sep} aria-hidden />
            <span>Mais de 1.500 pacientes atendidos</span>
            <span className={s.sep} aria-hidden />
            <span>98% de satisfação</span>
          </div>
        </div>

        {/* só o fio e a seta: "ROLE" em caixa alta ficava ambíguo */}
        <div className={s.rolar} aria-hidden>
          <span className={s.fio} />
          <span className={s.seta}>↓</span>
        </div>
      </div>
    </section>
  );
}
