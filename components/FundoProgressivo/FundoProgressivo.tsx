"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** "A alvorada": o fundo do documento clareia do grafite ao branco conforme
 *  a página desce. As seções são opacas por cima — isto só aparece nas
 *  bordas e nas transições, que é justamente onde o olho não deve conseguir
 *  apontar onde uma seção terminou. */
const PARADAS = [
  "#202124",
  "#202124",
  "#f7f8fa",
  "#ffffff",
  "#eaf5ff",
  "#ffffff",
  "#f7f8fa",
  "#ffffff",
  "#ffffff",
];

export default function FundoProgressivo() {
  useEffect(() => {
    const cores = PARADAS.map((c) => gsap.utils.splitColor(c));

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress * (cores.length - 1);
        const i = Math.min(cores.length - 2, Math.floor(p));
        const f = p - i;
        const [a, b] = [cores[i], cores[i + 1]];
        const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
        document.body.style.backgroundColor = `rgb(${mix[0]},${mix[1]},${mix[2]})`;
      },
    });

    return () => {
      st.kill();
      document.body.style.backgroundColor = "";
    };
  }, []);

  return null;
}
