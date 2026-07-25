"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal/Reveal";
import { FAQ } from "@/lib/conteudo";
import { WHATSAPP_URL } from "@/lib/clinica";
import { PATH_ARCO, VIEWBOX_ARCO } from "@/lib/arco";
import s from "./Faq.module.css";

export default function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <section id="faq" className={s.secao} data-secao="Dúvidas">
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
              Reunimos as seis que mais aparecem na primeira consulta.
            </Reveal>

            <Reveal delay={0.2}>
              <div className={s.convite}>
                <p className={s.conviteTitulo}>A sua não está aqui?</p>
                <p className={s.conviteTexto}>
                  Manda no WhatsApp. Quem responde é alguém da equipe clínica,
                  não um robô — e sai no mesmo dia útil.
                </p>
                <a
                  className={s.conviteAcao}
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetico
                >
                  Perguntar no WhatsApp <span aria-hidden>→</span>
                </a>
              </div>

              <svg
                className={s.arcoFaq}
                viewBox={VIEWBOX_ARCO}
                aria-hidden
                focusable="false"
              >
                <path className={s.arcoFaqTraco} d={PATH_ARCO} />
              </svg>
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
