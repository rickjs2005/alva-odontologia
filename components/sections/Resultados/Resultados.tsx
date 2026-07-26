"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal/Reveal";
import { CASOS } from "@/lib/conteudo";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Resultados.module.css";

/** Comparador antes/depois, três casos.
 *  A posição da alça vive em ref + variável CSS, nunca em state: mover a alça
 *  re-renderizando a árvore a cada pointermove engasga. */
export default function Resultados() {
  const caixa = useRef<HTMLDivElement>(null);
  const lente = useRef<HTMLSpanElement>(null);
  const valor = useRef(50);
  const arrastando = useRef(false);
  const demoFeita = useRef(false);
  const [caso, setCaso] = useState(0);

  const atual = CASOS[caso];

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

  // trocar de caso devolve a alça ao meio
  useEffect(() => {
    aplicar(50);
  }, [aplicar, caso]);

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

  // a lente: segue o ponteiro e amplia 1,9x a composição atual
  useEffect(() => {
    const node = caixa.current;
    if (!node) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (prefersReducedMotion()) return;

    const medir = () => {
      const r = node.getBoundingClientRect();
      node.style.setProperty("--lw", `${r.width * 1.9}px`);
      node.style.setProperty("--lh", `${r.height * 1.9}px`);
    };

    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      node.style.setProperty("--lx", `${e.clientX - r.left}px`);
      node.style.setProperty("--ly", `${e.clientY - r.top}px`);
    };

    const entra = () => {
      medir();
      lente.current?.classList.add(s.lenteAtiva);
    };
    const sai = () => lente.current?.classList.remove(s.lenteAtiva);

    medir();
    window.addEventListener("resize", medir);
    node.addEventListener("pointerenter", entra);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", sai);

    return () => {
      window.removeEventListener("resize", medir);
      node.removeEventListener("pointerenter", entra);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", sai);
    };
  }, [caso]);

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
    <section id="resultados" className={s.secao} data-secao="Resultados">
      <div className="faixa">
        <div className={s.cabeca}>
          <div>
            <Reveal>
              <span className="eyebrow">Resultados</span>
            </Reveal>
            <Reveal as="h2" modo="palavras" delay={0.05} className={s.titulo}>
              Veja de perto.
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className={s.chips} role="tablist" aria-label="Casos clínicos">
              {CASOS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  id={`caso-${c.id}`}
                  aria-selected={i === caso}
                  aria-controls="painel-caso"
                  className={`${s.chip} ${i === caso ? s.chipAtivo : ""}`}
                  onClick={() => setCaso(i)}
                >
                  {c.chip}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div id="painel-caso" role="tabpanel" aria-labelledby={`caso-${atual.id}`}>
          <p className={s.casoTitulo}>{atual.titulo}</p>
          <p className={s.casoApoio}>{atual.apoio}</p>

          <Reveal modo="blur" delay={0.06}>
            <div
              ref={caixa}
              className={s.comparador}
              role="slider"
              tabIndex={0}
              aria-label={`Comparação antes e depois: ${atual.chip}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
              aria-valuetext="Metade antes, metade depois"
              onKeyDown={aoTeclar}
            >
              <div className={s.camada}>
                <Image
                  key={`${atual.id}-depois`}
                  className={s.foto}
                  src={atual.depois}
                  alt={atual.altDepois}
                  width={1264}
                  height={848}
                  sizes="(max-width: 1440px) 100vw, 1440px"
                />
              </div>

              <div className={`${s.camada} ${s.antes}`}>
                <Image
                  key={`${atual.id}-antes`}
                  className={s.foto}
                  src={atual.antes}
                  alt={atual.altAntes}
                  width={1264}
                  height={848}
                  sizes="(max-width: 1440px) 100vw, 1440px"
                />
              </div>

              <span className={`${s.rotulo} ${s.rotuloAntes}`}>Antes</span>
              <span className={`${s.rotulo} ${s.rotuloDepois}`}>Depois</span>

              <span className={s.alca} aria-hidden>
                <span className={s.puxador}>⟷</span>
              </span>

              <span ref={lente} className={s.lente} aria-hidden>
                <span className={s.lenteInterna}>
                  <Image
                    className={s.lenteFoto}
                    src={atual.depois}
                    alt=""
                    width={1264}
                    height={848}
                    sizes="(max-width: 1440px) 100vw, 1440px"
                  />
                  <span className={s.lenteAntes}>
                    <Image
                      className={s.lenteFoto}
                      src={atual.antes}
                      alt=""
                      width={1264}
                      height={848}
                      sizes="(max-width: 1440px) 100vw, 1440px"
                    />
                  </span>
                  <span className={s.lenteAlca} />
                </span>
              </span>
            </div>
          </Reveal>

          <p className={s.legenda}>
            <span>{atual.paciente}</span>
            <span className={s.aviso}>
              Caso ilustrativo. Resultados variam conforme o caso clínico.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
