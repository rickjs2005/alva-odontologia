"use client";

import { useEffect, useRef } from "react";
import { world } from "@/lib/world";
import { PLANOS, planoEm } from "@/lib/scenes";
import { prefersReducedMotion, isDesktop } from "@/lib/motion";
import s from "./VideoRig.module.css";

/** O ativo do site: vídeo fullscreen fixo atrás de toda a página.
 *  Um rAF lê world.progresso e persegue o tempo-alvo com damping — o scroll
 *  vira a moviola. Exige vídeo com GOP 1 (ver README). */
export default function VideoRig() {
  const video = useRef<HTMLVideoElement>(null);
  const hud = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;

    const desktop = isDesktop();
    const pronto = () => window.dispatchEvent(new CustomEvent("alva:pronto"));

    // mobile: o vídeo não scruba, então não precisa competir com o LCP.
    // Solta o loader no poster e só busca os bytes quando a thread sossega.
    if (!desktop || prefersReducedMotion()) {
      pronto();
      if (prefersReducedMotion()) return;

      const carregar = () => {
        v.src = "/video/hero.mp4";
        v.loop = true;
        v.load();
        v.play().catch(() => {});
      };
      const ocioso =
        window.requestIdleCallback?.(carregar, { timeout: 2500 }) ??
        window.setTimeout(carregar, 1200);

      return () => {
        if (window.cancelIdleCallback) window.cancelIdleCallback(ocioso);
        else window.clearTimeout(ocioso);
      };
    }

    // desktop: o vídeo É o conteúdo, carrega de imediato
    // src fora do JSX: no JSX o browser baixaria as duas fontes
    v.src = "/video/hero-hd.mp4";
    v.load();

    if (v.readyState >= 3) pronto();
    else {
      v.addEventListener("canplay", pronto, { once: true });
      // se o vídeo não vier, a página não pode ficar presa no loader
      v.addEventListener("error", pronto, { once: true });
    }

    v.pause();
    let atual = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dur = v.duration;
      if (!dur || v.readyState < 2) return;

      const alvo = world.progresso;
      // damping: amarrar currentTime direto no progresso treme
      const proximo = atual + (alvo - atual) * 0.1;
      if (Math.abs(proximo - atual) > 0.0004) {
        atual = proximo;
        // -0.05s: seek exatamente em duration congela no último frame
        v.currentTime = atual * (dur - 0.05);

        if (hud.current) {
          const i = planoEm(atual);
          const txt = `${String(i + 1).padStart(2, "0")} · ${PLANOS[i].nome}`;
          if (hud.current.textContent !== txt) hud.current.textContent = txt;
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("canplay", pronto);
      v.removeEventListener("error", pronto);
    };
  }, []);

  return (
    <div className={s.rig} aria-hidden>
      <video
        ref={video}
        className={s.video}
        muted
        playsInline
        // metadata, não auto: o browser busca trechos sob demanda conforme o
        // scrub pede, em vez de baixar o arquivo inteiro de cara
        preload="metadata"
        poster="/video/poster.webp"
      />
      <div id="alva-scrim" className={s.scrim} />
      <div className={s.vinheta} />
      <span className={s.hud}>
        plano<span ref={hud} className={s.plano}>01 · A porta</span>
      </span>
    </div>
  );
}
