"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import Reveal from "@/components/ui/Reveal/Reveal";
import { JORNADA } from "@/lib/conteudo";
import { PATH_ARCO, VIEWBOX_ARCO } from "@/lib/arco";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Jornada.module.css";

gsap.registerPlugin(ScrollTrigger);

/** onde cada passo se apoia no arco, em fração do comprimento do path */
const APOIOS = [0.06, 0.28, 0.5, 0.72, 0.94];

type Ponto = { x: number; y: number };

export default function Jornada() {
  const palco = useRef<HTMLDivElement>(null);
  const traco = useRef<SVGPathElement>(null);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [acesos, setAcesos] = useState(0);

  // posiciona os nós sobre a curva de verdade, não por aproximação
  useEffect(() => {
    const path = traco.current;
    if (!path) return;

    // o SVG ocupa só a faixa de cima do palco (ver CSS), então o y do path
    // precisa ser reescalado para a caixa inteira
    const FATOR = 0.699;

    const medir = () => {
      const total = path.getTotalLength();
      setPontos(
        APOIOS.map((t) => {
          const p = path.getPointAtLength(total * t);
          return { x: (p.x / 1000) * 100, y: (p.y / 260) * 100 * FATOR };
        })
      );
    };

    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  useEffect(() => {
    const node = palco.current;
    const path = traco.current;
    if (!node || !path) return;

    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      setAcesos(JORNADA.length);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top 78%",
      end: "bottom 60%",
      scrub: 0.6,
      onUpdate: (self) => {
        path.style.strokeDashoffset = String(1 - self.progress);
        setAcesos(Math.round(self.progress * JORNADA.length));
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section className={s.secao} data-secao="A jornada">
      <div className="faixa">
        <div className={s.cabeca}>
          <Reveal>
            <span className="eyebrow">Como funciona</span>
          </Reveal>
          <Reveal as="h2" modo="palavras" delay={0.05} className={s.titulo}>
            Da primeira consulta ao retorno de 180 dias.
          </Reveal>
        </div>

        {/* desktop: sobre o arco */}
        <div ref={palco} className={s.palco}>
          <svg className={s.arco} viewBox={VIEWBOX_ARCO} aria-hidden>
            <path className={`${s.traco} ${s.trilhoArco}`} d={PATH_ARCO} />
            <path
              ref={traco}
              className={s.traco}
              d={PATH_ARCO}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          </svg>

          {pontos.map((p, i) => (
            <span
              key={`no-${i}`}
              className={`${s.no} ${i < acesos ? s.noAceso : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-hidden
            />
          ))}

          {pontos.map((p, i) => (
            <div
              key={`cartao-${i}`}
              className={s.cartao}
              // todos abaixo do próprio nó: acima, os do meio subiam para
              // cima do arco e colidiam com o título da seção
              style={{ left: `${p.x}%`, top: `calc(${p.y}% + 26px)` }}
            >
              <span className={s.passo}>{JORNADA[i].passo}</span>
              <h3 className={s.nome}>{JORNADA[i].titulo}</h3>
              <p className={s.texto}>{JORNADA[i].texto}</p>
            </div>
          ))}
        </div>

        {/* mobile: coluna com fio vertical */}
        <ol className={s.coluna}>
          <span className={s.fioVertical} aria-hidden />
          {JORNADA.map((j) => (
            <li key={j.passo} className={s.etapa}>
              <span className={s.bolinha} aria-hidden />
              <span className={s.passo}>{j.passo}</span>
              <h3 className={s.nome}>{j.titulo}</h3>
              <p className={s.texto}>{j.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
