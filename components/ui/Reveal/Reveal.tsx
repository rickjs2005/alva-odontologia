"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Modo = "mask" | "fade" | "blur" | "palavras";

type Props = {
  children: ReactNode;
  as?: ElementType;
  modo?: Modo;
  delay?: number;
  className?: string;
  id?: string;
};

/** máscara por palavra usada pelo modo="palavras" (definida em globals.css) */
const CLASSE_PALAVRA = "reveal-palavra";

const ESTADOS: Record<Modo, { de: gsap.TweenVars; para: gsap.TweenVars }> = {
  palavras: {
    de: { clipPath: "inset(0 0 100% 0)", y: 24 },
    para: { clipPath: "inset(0 0 0% 0)", y: 0 },
  },
  mask: {
    de: { clipPath: "inset(0 0 100% 0)", y: 24 },
    para: { clipPath: "inset(0 0 0% 0)", y: 0 },
  },
  blur: {
    de: { filter: "blur(12px)", opacity: 0, y: 16 },
    para: { filter: "blur(0px)", opacity: 1, y: 0 },
  },
  fade: {
    de: { opacity: 0, y: 20 },
    para: { opacity: 1, y: 0 },
  },
};

/** Entrada por scroll, uma vez só. Sem JS (ou em reduced-motion) o conteúdo
 *  já nasce visível — nada de FOUC nem de página vazia. */
export default function Reveal({
  children,
  as: Tag = "div",
  modo = "fade",
  delay = 0,
  className,
  id,
}: Props) {
  const el = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || prefersReducedMotion()) return;

    // palavra a palavra: cada uma sobe de dentro da própria máscara
    if (modo === "palavras") {
      const palavras = node.querySelectorAll<HTMLElement>("[data-palavra] > i");
      if (palavras.length) {
        const anim = gsap.fromTo(
          palavras,
          { yPercent: 108 },
          {
            yPercent: 0,
            duration: DUR.texto,
            ease: EASE,
            delay,
            stagger: 0.055,
            scrollTrigger: { trigger: node, start: "top 85%", once: true },
          }
        );
        return () => {
          anim.scrollTrigger?.kill();
          anim.kill();
        };
      }
    }

    const { de, para } = ESTADOS[modo];
    const anim = gsap.fromTo(node, de, {
      ...para,
      duration: modo === "blur" ? DUR.imagem : DUR.texto,
      ease: EASE,
      delay,
      scrollTrigger: { trigger: node, start: "top 85%", once: true },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [modo, delay]);

  // no modo palavras o texto é fatiado aqui, no servidor: sem JS o título
  // aparece inteiro e sem flash
  const conteudo =
    modo === "palavras" && typeof children === "string"
      ? children.split(" ").map((p, i) => (
          <span key={`${p}-${i}`} data-palavra className={CLASSE_PALAVRA}>
            <i style={{ fontStyle: "normal", display: "inline-block" }}>{p}</i>
          </span>
        ))
      : children;

  return (
    <Tag ref={el} className={className} id={id}>
      {conteudo}
    </Tag>
  );
}
