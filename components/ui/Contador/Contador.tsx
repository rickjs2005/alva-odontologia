"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  ate: number;
  className?: string;
  duracao?: number;
};

/** Conta ao entrar em cena, uma vez. Escreve direto no nó — passar por state
 *  re-renderizaria a árvore a cada frame. */
export default function Contador({ ate, className, duracao = 1.4 }: Props) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      node.textContent = String(ate);
      return;
    }

    const obs = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0].isIntersecting) return;
        obs.disconnect();

        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / (duracao * 1000));
          // expo.out: chega rápido e assenta
          const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          node.textContent = String(Math.round(ate * e));
          if (t < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      },
      { threshold: 0.6 }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [ate, duracao]);

  // o valor final já vai no HTML: sem JS, o número está lá
  return (
    <span ref={el} className={className}>
      {ate}
    </span>
  );
}
