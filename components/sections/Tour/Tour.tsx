import Reveal from "@/components/ui/Reveal/Reveal";
import { TOUR } from "@/lib/conteudo";
import CardTour from "./CardTour/CardTour";
import s from "./Tour.module.css";

export default function Tour() {
  return (
    <section id="tour" className={s.secao} data-secao="Tour">
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">A clínica por dentro</span>
        </Reveal>
        <Reveal as="h2" modo="palavras" delay={0.05} className={s.titulo}>
          Madeira, vidro e luz da manhã.
        </Reveal>

        <div className={s.pilha}>
          {TOUR.map((c, i) => (
            <CardTour
              key={c.src}
              src={c.src}
              titulo={c.titulo}
              texto={c.texto}
              indice={i}
              prioridade={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
