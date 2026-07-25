"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/** Lenis dirigindo o ScrollTrigger pelo ticker do GSAP. Os dois precisam
 *  compartilhar o mesmo rAF, senão o pin do hero briga com a suavização. */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // o lightbox pausa o scroll da página por baixo
    const parar = () => lenis.stop();
    const seguir = () => lenis.start();
    window.addEventListener("alva:travar-scroll", parar);
    window.addEventListener("alva:soltar-scroll", seguir);

    return () => {
      window.removeEventListener("alva:travar-scroll", parar);
      window.removeEventListener("alva:soltar-scroll", seguir);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
