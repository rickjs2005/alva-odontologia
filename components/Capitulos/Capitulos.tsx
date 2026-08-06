"use client";

import { useEffect, useRef } from "react";
import { PLANOS, saidaDoH1 } from "@/lib/scenes";
import { world } from "@/lib/world";
import { prefersReducedMotion, isDesktop } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/clinica";
import Botao from "@/components/ui/Botao/Botao";
import s from "./Capitulos.module.css";

/** O texto que corre em cima do filme. Um capítulo por plano, na janela
 *  v0→v1 que o lib/scenes.ts define.
 *
 *  O capítulo 01 não está aqui: ele é o H1, vive no Hero por ser o elemento
 *  de LCP e sai pelo mesmo relógio (ver Hero.tsx).
 *
 *  Lê world.heroProgresso num rAF em vez de criar um segundo ScrollTrigger
 *  sobre o hero. Dois triggers no mesmo elemento com o Lenis no meio saem de
 *  fase; e heroProgresso, diferente de progresso, não é reescrito pelo
 *  Interlúdio mais adiante na página. */

/** fração da janela de cada capítulo gasta entrando e saindo */
const RAMPA = 0.18;
/** o texto entra 20px abaixo e sai 20px acima. Em px, não em %: o teto de
 *  24px do lib/motion vale aqui, e 20% da altura de um bloco de três linhas
 *  passaria de 60px. */
const DESLOC = 20;
/** desfoque máximo nas pontas da rampa */
const BORRAO = 6;
/** escuridão mínima do scrim narrativo, mesmo nos respiros */
const SCRIM_BASE = 0.34;

const trava = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** capítulos 02–07. O 01 é o H1 e mora no Hero. */
const CAPITULOS = PLANOS.slice(1);

export default function Capitulos() {
  const camada = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = camada.current;
    if (!node || prefersReducedMotion() || !isDesktop()) return;

    const blocos = [
      ...node.querySelectorAll<HTMLElement>("[data-capitulo]"),
    ];
    const raiz = document.documentElement;
    let raf = 0;
    // null e não `true`: o primeiro quadro precisa escrever `inert`/
    // `pointerEvents` de qualquer jeito, mesmo que o valor calculado seja o
    // mesmo `true` com que o elemento já nasceu no JSX — é esse primeiro
    // write que sincroniza o array de estado com o DOM.
    const inertes: (boolean | null)[] = blocos.map(() => null);
    // mesmo padrão do HUD em VideoRig.tsx: custom property na raiz invalida
    // estilo da página inteira, e depois do hero (p travado em 1) o rAF
    // reescreveria os dois valores 60×/s para sempre sem isto.
    let scrimNarrAnterior = "";
    let scrimDirAnterior = "";

    // rampa de saída do último plano (07): mesma faixa usada abaixo para
    // levar o scrim narrativo a 0.
    const ultimo = PLANOS[PLANOS.length - 1];
    const rampaFinal = (ultimo.v1 - ultimo.v0) * RAMPA;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = world.heroProgresso;

      // o scrim segue o capítulo mais forte em cena; o 01 entra na conta
      // porque o H1 também precisa de contraste
      let forca = SCRIM_BASE;

      PLANOS.forEach((plano, i) => {
        const largura = plano.v1 - plano.v0;
        const rampa = largura * RAMPA;
        const dentro = trava((p - plano.v0) / rampa);
        const fora = trava((p - (plano.v1 - rampa)) / rampa);
        const op = dentro * (1 - fora);

        if (op * plano.peso > forca) forca = op * plano.peso;

        // o plano 0 é o H1: só contribui para o scrim, quem o anima é o Hero
        if (i === 0) return;

        const el = blocos[i - 1];
        if (!el) return;

        // toFixed(4) e não String(op): op passa por zero via subtração de
        // ponto flutuante, e String(2.1e-15) emite notação científica, que
        // opacity não entende.
        el.style.opacity = op.toFixed(4);
        // dois translateY: o primeiro em % centra o bloco na sua própria
        // altura (o CSS o ancora em top: 50%), o segundo em px é o movimento.
        // Somar os dois num valor só misturaria as unidades.
        el.style.transform = `translateY(-50%) translateY(${
          (1 - dentro) * DESLOC - fora * DESLOC
        }px)`;
        el.style.filter =
          op > 0.995 ? "none" : `blur(${((1 - dentro) + fora) * BORRAO}px)`;

        // fora de cena o capítulo não pode receber clique nem foco de
        // teclado — senão o CTA do 07 vira alvo invisível sobre o filme
        const inerte = op < 0.5;
        if (inertes[i - 1] !== inerte) {
          inertes[i - 1] = inerte;
          el.toggleAttribute("inert", inerte);
          el.style.pointerEvents = inerte ? "none" : "auto";
        }
      });

      // o scrim existe para dar contraste ao texto por cima do filme; sem
      // capítulo em cena ele só escurece o filme à toa. p trava em 1 assim
      // que o hero termina (ScrollTrigger não deixa passar), e o Interlúdio
      // logo depois é o filme sozinho — precisa dele limpo. Decai para 0 na
      // mesma rampa de saída do capítulo 07 para não haver salto: o scrim
      // some junto com o último texto, que é quando ele deixa de ter função.
      const saidaFinal = trava((p - (ultimo.v1 - rampaFinal)) / rampaFinal);
      forca *= 1 - saidaFinal;

      const forcaTxt = forca.toFixed(3);
      if (forcaTxt !== scrimNarrAnterior) {
        scrimNarrAnterior = forcaTxt;
        raiz.style.setProperty("--scrim-narr", forcaTxt);
      }

      // o scrim direcional original serve só ao H1, embaixo à esquerda;
      // depois do plano 01 ele sai e o simétrico assume. saidaDoH1 mora em
      // lib/scenes.ts porque Hero.tsx usa o mesmo número para animar o H1
      // para fora — os dois têm que andar juntos.
      const dirTxt = (1 - saidaDoH1(p)).toFixed(3);
      if (dirTxt !== scrimDirAnterior) {
        scrimDirAnterior = dirTxt;
        raiz.style.setProperty("--scrim-dir", dirTxt);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      raiz.style.removeProperty("--scrim-narr");
      raiz.style.removeProperty("--scrim-dir");
    };
  }, []);

  return (
    <div ref={camada} className={s.camada}>
      {CAPITULOS.map((c, i) => {
        // i é o índice dentro de CAPITULOS; o plano real é i + 1
        const plano = i + 1;
        const ultimo = plano === PLANOS.length - 1;

        return (
          <div
            key={c.nome}
            data-capitulo={plano}
            className={`${s.capitulo} ${c.lado === "dir" ? s.dir : s.esq}${
              c.apoio ? "" : ` ${s.soLinha}`
            }`}
            // nasce inerte: se o rAF abaixo nunca rodar (mobile,
            // reduced-motion, ou a viewport cruzando 1024px depois do mount,
            // quando `isDesktop()` já foi lido uma vez só), os dois links do
            // capítulo 07 continuam inalcançáveis por Tab para sempre. O rAF
            // só desliga o `inert` quando o capítulo entra em cena — nunca é
            // ele quem liga.
            inert
            style={{ transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <p className={s.linha}>{c.linha}</p>
            {c.apoio ? <p className={s.apoio}>{c.apoio}</p> : null}

            {ultimo ? (
              <div className={s.acoes}>
                <Botao href={WHATSAPP_URL} externo>
                  Agendar Consulta
                </Botao>
                <Botao href="#sobre" variante="ghost" tom="escuro">
                  Conhecer a Clínica
                </Botao>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
