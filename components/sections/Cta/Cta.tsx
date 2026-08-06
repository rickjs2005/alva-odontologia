import Reveal from "@/components/ui/Reveal/Reveal";
import Botao from "@/components/ui/Botao/Botao";
import { CLINICA, WHATSAPP_URL } from "@/lib/clinica";
import s from "./Cta.module.css";

export default function Cta() {
  return (
    <section className={s.secao} data-secao="Agende">
      <div className="faixa">
        <Reveal>
          <span className="eyebrow">Agende</span>
        </Reveal>

        {/* "Pronto para transformar seu sorriso?" era a mesma família de frase
            que o AGENTS.md proíbe, em Cormorant a 9rem ocupando a tela inteira
            — o segundo momento de maior peso visual do site dizendo o que
            qualquer clínica diria. A troca é por um fato, e é o fato que
            desarma quem hesita em marcar: a primeira ida não tem procedimento
            nenhum. */}
        <Reveal as="h2" modo="palavras" delay={0.06} className={s.titulo}>
          A primeira consulta é uma conversa.
        </Reveal>

        <Reveal delay={0.18}>
          <div className={s.acao}>
            <Botao href={WHATSAPP_URL} tamanho="gigante" externo seta>
              Agendar Consulta
            </Botao>
          </div>
          <p className={s.nota}>Respondemos no mesmo dia útil.</p>
          <p className={s.telefone}>
            Ou ligue: <a href={`tel:${CLINICA.telefoneRaw}`}>{CLINICA.telefone}</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
