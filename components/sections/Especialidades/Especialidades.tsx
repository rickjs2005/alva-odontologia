import Reveal from "@/components/ui/Reveal/Reveal";
import { ESPECIALIDADES } from "@/lib/conteudo";
import { ICONES } from "./icones";
import s from "./Especialidades.module.css";

export default function Especialidades() {
  return (
    <section id="especialidades" className={s.secao}>
      <div className="faixa">
        <div className={s.cabeca}>
          <div>
            <Reveal>
              <span className="eyebrow">O que fazemos</span>
            </Reveal>
            <Reveal as="h2" modo="mask" delay={0.05} className={s.titulo}>
              Seis frentes, um critério só.
            </Reveal>
          </div>
          <Reveal as="p" delay={0.12} className={s.apoio}>
            Nenhum tratamento começa sem diagnóstico digital. Se o caso pedir
            menos do que você imaginava, a gente vai dizer.
          </Reveal>
        </div>

        <div className={s.grade}>
          {ESPECIALIDADES.map((e, i) => {
            const Icone = ICONES[e.id];
            return (
              <Reveal key={e.id} delay={(i % 3) * 0.07}>
                <article className={s.card}>
                  {/* duas camadas: a base fica sempre visível (quem não passa
                      o mouse precisa ver o ícone), e a de ouro se desenha por
                      cima no hover */}
                  <span className={s.iconeCaixa}>
                    <Icone className={s.icone} classeTraco={s.tracoBase} />
                    <Icone className={s.iconeOuro} classeTraco={s.traco} />
                  </span>
                  <h3 className={s.nome}>{e.titulo}</h3>
                  <p className={s.texto}>{e.texto}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
