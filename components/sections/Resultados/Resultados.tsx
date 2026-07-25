"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import Reveal from "@/components/ui/Reveal/Reveal";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Resultados.module.css";

/** Comparador antes/depois.
 *  A posição vive em ref + variável CSS, nunca em state: mover a alça
 *  re-renderizando a árvore a cada pointermove engasga. */
export default function Resultados() {
  const caixa = useRef<HTMLDivElement>(null);
  const valor = useRef(50);
  const arrastando = useRef(false);
  const demoFeita = useRef(false);

  const aplicar = useCallback((v: number) => {
    const limitado = Math.max(0, Math.min(100, v));
    valor.current = limitado;
    const node = caixa.current;
    if (!node) return;
    node.style.setProperty("--corte", `${limitado}%`);
    node.setAttribute("aria-valuenow", String(Math.round(limitado)));
  }, []);

  const daPosicao = useCallback(
    (clientX: number) => {
      const node = caixa.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      aplicar(((clientX - r.left) / r.width) * 100);
    },
    [aplicar]
  );

  useEffect(() => {
    aplicar(50);
  }, [aplicar]);

  // auto-demo: ensina o gesto sem tooltip, uma vez só
  useEffect(() => {
    const node = caixa.current;
    if (!node || prefersReducedMotion()) return;

    const obs = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0].isIntersecting || demoFeita.current) return;
        demoFeita.current = true;
        obs.disconnect();

        const inicio = performance.now();
        const dur = 1100;
        const passo = (agora: number) => {
          if (arrastando.current) return;
          const t = Math.min(1, (agora - inicio) / dur);
          // vai a 68% e volta
          const onda = Math.sin(t * Math.PI);
          aplicar(50 + onda * 18);
          if (t < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      },
      { threshold: 0.45 }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [aplicar]);

  useEffect(() => {
    const node = caixa.current;
    if (!node) return;

    const desce = (e: PointerEvent) => {
      arrastando.current = true;
      demoFeita.current = true;
      node.setPointerCapture(e.pointerId);
      daPosicao(e.clientX);
    };
    const move = (e: PointerEvent) => {
      if (!arrastando.current) return;
      daPosicao(e.clientX);
    };
    const sobe = (e: PointerEvent) => {
      arrastando.current = false;
      if (node.hasPointerCapture(e.pointerId)) {
        node.releasePointerCapture(e.pointerId);
      }
    };

    node.addEventListener("pointerdown", desce);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", sobe);
    node.addEventListener("pointercancel", sobe);

    return () => {
      node.removeEventListener("pointerdown", desce);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", sobe);
      node.removeEventListener("pointercancel", sobe);
    };
  }, [daPosicao]);

  const aoTeclar = (e: React.KeyboardEvent) => {
    const mapa: Record<string, number> = {
      ArrowLeft: valor.current - 2,
      ArrowRight: valor.current + 2,
      Home: 0,
      End: 100,
    };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    demoFeita.current = true;
    aplicar(mapa[e.key]);
  };

  return (
    <section id="resultados" className={s.secao}>
      <div className="faixa">
        <div className={s.cabeca}>
          <div>
            <Reveal>
              <span className="eyebrow">Resultados</span>
            </Reveal>
            <Reveal as="h2" modo="mask" delay={0.05} className={s.titulo}>
              Facetas em seis dentes, oito semanas.
            </Reveal>
          </div>
          <Reveal as="p" delay={0.12} className={s.apoio}>
            Arraste para comparar. O desenho foi aprovado em provisório antes de
            qualquer desgaste.
          </Reveal>
        </div>

        <Reveal modo="blur" delay={0.1}>
          <div
            ref={caixa}
            className={s.comparador}
            role="slider"
            tabIndex={0}
            aria-label="Comparação antes e depois do tratamento"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={50}
            aria-valuetext="Metade antes, metade depois"
            onKeyDown={aoTeclar}
          >
            <div className={s.camada}>
              <Image
                className={s.foto}
                src="/img/depois.webp"
                alt="Sorriso depois do tratamento: dentes alinhados e uniformes"
                width={1264}
                height={848}
                sizes="(max-width: 1440px) 100vw, 1440px"
              />
            </div>

            <div className={`${s.camada} ${s.antes}`}>
              <Image
                className={s.foto}
                src="/img/antes.webp"
                alt="Sorriso antes do tratamento: dentes desalinhados, com diastema"
                width={1264}
                height={848}
                sizes="(max-width: 1440px) 100vw, 1440px"
              />
            </div>

            <span className={`${s.chip} ${s.chipAntes}`}>Antes</span>
            <span className={`${s.chip} ${s.chipDepois}`}>Depois</span>

            <span className={s.alca} aria-hidden>
              <span className={s.puxador}>⟷</span>
            </span>
          </div>
        </Reveal>

        <p className={s.legenda}>
          <span>Paciente, 34 anos · facetas em porcelana</span>
          <span className={s.aviso}>
            Caso ilustrativo. Resultados variam conforme o caso clínico.
          </span>
        </p>
      </div>
    </section>
  );
}
