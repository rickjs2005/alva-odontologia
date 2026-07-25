"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import s from "./Cursor.module.css";

/** Anel que persegue o ponteiro com lerp. Sobre [data-cursor] cresce e mostra
 *  o rótulo; sobre [data-magnetico] puxa o próprio elemento até 8px.
 *  Desligado em touch e em reduced-motion. */
export default function Cursor() {
  const anel = useRef<HTMLDivElement>(null);
  const ponto = useRef<HTMLDivElement>(null);
  const [rotulo, setRotulo] = useState("");
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const alvo = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const suave = { ...alvo };
    let raf = 0;
    let magnetico: HTMLElement | null = null;

    const mover = (e: PointerEvent) => {
      alvo.x = e.clientX;
      alvo.y = e.clientY;
      setAtivo(true);

      const sob = (e.target as HTMLElement)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      setRotulo(sob?.dataset.cursor ?? "");

      const mag = (e.target as HTMLElement)?.closest?.(
        "[data-magnetico]"
      ) as HTMLElement | null;

      if (magnetico && magnetico !== mag) {
        magnetico.style.transform = "";
        magnetico.style.transition = "transform .5s var(--ease)";
      }
      magnetico = mag;

      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const limite = 8;
        mag.style.transition = "transform .18s linear";
        mag.style.transform = `translate(${Math.max(
          -limite,
          Math.min(limite, dx * 0.25)
        )}px, ${Math.max(-limite, Math.min(limite, dy * 0.25))}px)`;
      }
    };

    const sair = () => setAtivo(false);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      suave.x += (alvo.x - suave.x) * 0.15;
      suave.y += (alvo.y - suave.y) * 0.15;
      if (anel.current) {
        anel.current.style.transform = `translate3d(${suave.x}px, ${suave.y}px, 0)`;
      }
      if (ponto.current) {
        ponto.current.style.transform = `translate3d(${alvo.x}px, ${alvo.y}px, 0)`;
      }
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", sair);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", sair);
      if (magnetico) magnetico.style.transform = "";
    };
  }, []);

  const expandido = rotulo.length > 0;

  return (
    <>
      <div
        ref={anel}
        aria-hidden
        className={`${s.anel} ${ativo ? s.visivel : ""} ${
          expandido ? s.expandido : ""
        }`}
      >
        <span className={s.rotulo}>{rotulo}</span>
      </div>
      <div
        ref={ponto}
        aria-hidden
        className={`${s.ponto} ${ativo ? s.visivel : ""} ${
          expandido ? s.expandidoPonto : ""
        }`}
      />
    </>
  );
}
