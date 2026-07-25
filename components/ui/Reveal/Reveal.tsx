"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Modo = "mask" | "fade" | "blur";

type Props = {
  children: ReactNode;
  as?: ElementType;
  modo?: Modo;
  delay?: number;
  className?: string;
  id?: string;
};

const ESTADOS: Record<Modo, { de: gsap.TweenVars; para: gsap.TweenVars }> = {
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

  return (
    <Tag ref={el} className={className} id={id}>
      {children}
    </Tag>
  );
}
