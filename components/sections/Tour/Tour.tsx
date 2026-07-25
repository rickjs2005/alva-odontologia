"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal/Reveal";
import { TOUR } from "@/lib/conteudo";
import Lightbox from "./Lightbox";
import s from "./Tour.module.css";

export default function Tour() {
  const [aberto, setAberto] = useState<number | null>(null);
  const origem = useRef<HTMLButtonElement | null>(null);

  const fechar = () => {
    setAberto(null);
    // devolve o foco ao thumbnail de onde saiu
    origem.current?.focus();
  };

  return (
    <section id="tour" className={s.secao}>
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">A clínica por dentro</span>
        </Reveal>
        <Reveal as="h2" modo="mask" delay={0.05} className={s.titulo}>
          Madeira, vidro e luz da manhã.
        </Reveal>

        <div className={s.grade}>
          {TOUR.map((f, i) => (
            <button
              key={f.src}
              type="button"
              className={`${s.item} ${s[f.area]}`}
              data-cursor="ver"
              onClick={(e) => {
                origem.current = e.currentTarget;
                setAberto(i);
              }}
              aria-label={`Ampliar foto: ${f.legenda}`}
            >
              <Image
                className={s.foto}
                src={f.src}
                alt={f.legenda}
                width={1400}
                height={1400}
                sizes="(max-width: 899px) 50vw, 33vw"
              />
              <span className={s.veu} aria-hidden />
              <span className={s.legenda} aria-hidden>
                <span>{f.legenda}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {aberto !== null && (
        <Lightbox
          fotos={TOUR}
          indice={aberto}
          onFechar={fechar}
          onNavegar={setAberto}
        />
      )}
    </section>
  );
}
