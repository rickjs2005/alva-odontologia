"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** "A luz subindo": o fundo do documento vai do quase-preto frio ao grafite
 *  quente conforme a página desce. As seções são opacas por cima — isto só
 *  aparece nas bordas e nas transições, que é justamente onde o olho não
 *  deve conseguir apontar onde uma seção terminou.
 *
 *  Era "a alvorada", do grafite ao branco: o sol nascendo. Com a paleta
 *  escura o percurso continua, mas dentro do escuro — é a luz da sala
 *  subindo, não o dia.
 *
 *  Cinco paradas, não nove: a distância entre #1A1A1A e #272726 é curta, e
 *  paradas demais numa rampa curta viram degraus de banda visível em vez de
 *  transição. */
const PARADAS = [
  "#1a1a1a",
  "#1a1a1a",
  "#1f1f1e",
  "#232322",
  "#272726",
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
