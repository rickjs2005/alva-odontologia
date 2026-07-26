"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";
import { prefersReducedMotion, isDesktop } from "@/lib/motion";
import s from "./Interludio.module.css";

gsap.registerPlugin(ScrollTrigger);

/** o mesmo arco da identidade, agora como forma cheia — é ele que vira o
 *  buraco no véu */
const JANELA =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 152'%3E%3Cpath d='M10 152 C10 62 58 14 100 14 C142 14 190 62 190 152 Z' fill='%23000'/%3E%3C/svg%3E\")";

/** o trecho do filme que volta: o último plano, a dentista olhando para a
 *  câmera. Em câmera lenta extrema, visto por dentro do arco. */
const V0 = 0.855;
const V1 = 1;

export default function Interludio() {
  const raiz = useRef<HTMLElement>(null);
  const veu = useRef<HTMLDivElement>(null);
  const frase = useRef<HTMLParagraphElement>(null);
  const creditos = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = raiz.current;
    if (!node || prefersReducedMotion() || !isDesktop()) return;

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;

        // o filme reencontra o último plano e o atravessa devagar
        world.progresso = V0 + (V1 - V0) * p;

        // a janela abre até engolir a tela; depois disso só resta o filme
        const abertura = gsap.utils.interpolate(0, 240, Math.pow(p, 0.75));
        veu.current?.style.setProperty("--abertura", `${abertura}vmax`);

        // a frase vive no meio do percurso: entra com a janela, sai antes do fim
        const f = frase.current;
        if (f) {
          const dentro = gsap.utils.clamp(0, 1, (p - 0.14) / 0.16);
          const fora = gsap.utils.clamp(0, 1, (p - 0.62) / 0.18);
          f.style.opacity = String(dentro * (1 - fora));
          f.style.transform = `translate(-50%, calc(-50% + ${(1 - dentro) * 18}px))`;
        }

        const c = creditos.current;
        if (c) {
          const dentro = gsap.utils.clamp(0, 1, (p - 0.3) / 0.15);
          const fora = gsap.utils.clamp(0, 1, (p - 0.78) / 0.14);
          c.style.opacity = String(dentro * (1 - fora) * 0.85);
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section
      ref={raiz}
      className={s.secao}
      data-secao="Interlúdio"
      aria-label="Interlúdio"
    >
      <div className={s.palco}>
        <div
          ref={veu}
          className={s.veu}
          style={{ ["--janela" as string]: JANELA }}
          aria-hidden
        />
        <p ref={frase} className={s.frase}>
          É por isso que a gente faz devagar.
        </p>
        <span ref={creditos} className={s.creditos}>
          ALVA · plano 07
        </span>
      </div>
    </section>
  );
}
