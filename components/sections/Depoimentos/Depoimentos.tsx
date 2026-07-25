import Image from "next/image";
import Reveal from "@/components/ui/Reveal/Reveal";
import { DEPOIMENTOS } from "@/lib/conteudo";
import s from "./Depoimentos.module.css";

export default function Depoimentos() {
  return (
    <section className={s.secao}>
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">Quem passou por aqui</span>
        </Reveal>
        <Reveal as="h2" modo="mask" delay={0.05} className={s.titulo}>
          Três histórias, sem edição.
        </Reveal>

        <div className={s.grade}>
          {DEPOIMENTOS.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.09}>
              <figure className={s.card}>
                <span className={s.aspas} aria-hidden>
                  “
                </span>
                <blockquote className={s.texto}>{d.texto}</blockquote>
                <figcaption className={s.pessoa}>
                  <Image
                    className={s.retrato}
                    src={d.foto}
                    alt={`Retrato de ${d.nome}`}
                    width={104}
                    height={104}
                    sizes="52px"
                  />
                  <span>
                    <span className={s.nome}>{d.nome}</span>
                    <br />
                    <span className={s.detalhe}>{d.detalhe}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
