"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal/Reveal";
import { FAQ } from "@/lib/conteudo";
import s from "./Faq.module.css";

export default function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <section id="faq" className={s.secao}>
      <div className="faixa">
        <div className={s.grade}>
          <div className={s.cabeca}>
            <Reveal>
              <span className="eyebrow">Dúvidas</span>
            </Reveal>
            <Reveal as="h2" modo="mask" delay={0.05} className={s.titulo}>
              Perguntas que a gente ouve toda semana.
            </Reveal>
            <Reveal as="p" delay={0.12} className={s.apoio}>
              Se a sua não estiver aqui, manda no WhatsApp. Respondemos no mesmo
              dia útil.
            </Reveal>
          </div>

          <div className={s.lista}>
            {FAQ.map((f, i) => {
              const estaAberto = aberto === i;
              return (
                <Reveal key={f.p} delay={i * 0.04}>
                  <div className={`${s.item} ${estaAberto ? s.aberto : ""}`}>
                    <h3>
                      <button
                        type="button"
                        className={s.gatilho}
                        aria-expanded={estaAberto}
                        aria-controls={`faq-painel-${i}`}
                        id={`faq-botao-${i}`}
                        onClick={() => setAberto(estaAberto ? null : i)}
                      >
                        {f.p}
                        <span className={s.mais} aria-hidden />
                      </button>
                    </h3>

                    <div
                      className={s.painel}
                      id={`faq-painel-${i}`}
                      role="region"
                      aria-labelledby={`faq-botao-${i}`}
                    >
                      <div className={s.interno}>
                        <p className={s.resposta}>{f.r}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
