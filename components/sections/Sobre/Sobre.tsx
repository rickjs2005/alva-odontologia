"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/ui/Reveal/Reveal";
import { SOBRE } from "@/lib/conteudo";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Sobre.module.css";

gsap.registerPlugin(ScrollTrigger);

const MARCAS = [
  { numero: "2009", rotulo: "Ano de fundação" },
  { numero: "11", rotulo: "Pessoas na equipe" },
  { numero: "5", rotulo: "Pacientes por dia, por decisão" },
];

export default function Sobre() {
  const foto = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const node = foto.current;
    if (!node || prefersReducedMotion()) return;

    const anim = gsap.fromTo(
      node,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: node.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <section id="sobre" className={s.sobre}>
      <div className="faixa">
        <div className={s.grade}>
          <div className={s.midia}>
            <Image
              ref={foto}
              className={s.foto}
              src="/img/sobre.webp"
              alt="A Dra. Marina Alencastro no corredor da clínica, ao lado da parede de vidro"
              width={1400}
              height={1750}
              sizes="(max-width: 1023px) 100vw, 40vw"
            />
          </div>

          <div className={s.texto}>
            <Reveal modo="fade">
              <span className="eyebrow">{SOBRE.eyebrow}</span>
            </Reveal>

            <Reveal as="h2" modo="mask" className={s.titulo} delay={0.05}>
              {SOBRE.titulo}
            </Reveal>

            {SOBRE.paragrafos.map((p, i) => (
              <Reveal
                key={i}
                as="p"
                modo="fade"
                delay={0.12 + i * 0.08}
                className={s.paragrafo}
              >
                {p}
              </Reveal>
            ))}

            <Reveal modo="fade" delay={0.3}>
              <div className={s.assinatura}>
                <span className={s.fio} aria-hidden />
                {SOBRE.assinatura}
              </div>
            </Reveal>
          </div>

          <div className={s.marcas}>
            {MARCAS.map((m, i) => (
              <Reveal key={m.rotulo} modo="fade" delay={i * 0.08}>
                <div className={s.marca}>
                  <span className={s.numero}>{m.numero}</span>
                  <span className={s.rotulo}>{m.rotulo}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
