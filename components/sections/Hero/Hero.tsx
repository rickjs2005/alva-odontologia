"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "@/lib/world";
import { saidaDoH1 } from "@/lib/scenes";
import { prefersReducedMotion, isDesktop } from "@/lib/motion";
import { WHATSAPP_URL } from "@/lib/clinica";
import Botao from "@/components/ui/Botao/Botao";
import Capitulos from "@/components/Capitulos/Capitulos";
import s from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

/* O H1 diz o que as outras dez seções passam o site inteiro provando.
 *
 * A versão anterior ("Seu sorriso merece tecnologia, precisão e cuidado")
 * veio literal do briefing e anunciava a coisa errada: o argumento da ALVA
 * não é tecnologia — é tempo. "Sem pressa, desde 2009", "é por isso que a
 * gente faz devagar", "cinco pacientes por dia, por decisão", "o tempo por
 * consulta é o único número que continua igual", e a resposta sobre convênio
 * no FAQ, que defende o particular justamente para sustentar os cinco por
 * dia. Escâner e planejamento digital aparecem no site como meio, nunca como
 * promessa.
 *
 * Cinco por dia é o número mais improvável de uma clínica anunciar, e é
 * exatamente por isso que ele segura o scroll. */
const TITULO = "Atendemos cinco pessoas por dia.".split(" ");

export default function Hero() {
  const raiz = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // scrub: alimenta o world, que o VideoRig persegue
  useEffect(() => {
    const node = raiz.current;
    if (!node || prefersReducedMotion() || !isDesktop()) return;

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        world.progresso = p;
        world.heroProgresso = p;

        // O capítulo 01 sai no relógio dos planos, não numa porcentagem do
        // curso. Com "18% top" a copy ainda estaria legível quando o
        // capítulo 02 entrasse (v0 = 0.1475) e os dois se sobreporiam.
        // Aqui a saída começa em 55% da janela do plano 01 e termina
        // exatamente no corte para o plano 02.
        // saidaDoH1 mora em lib/scenes.ts porque Capitulos.tsx usa o mesmo
        // cálculo para apagar o scrim direcional — os dois precisam andar
        // juntos.
        const saida = saidaDoH1(p);

        const el = palco.current;
        if (el) {
          el.style.opacity = String(1 - saida);
          el.style.transform = `translateY(${-saida * 40}px)`;
        }
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section
      ref={raiz}
      className={s.hero}
      aria-label="Apresentação"
      data-secao="O filme"
    >
      {/* o palco É o capítulo 01: janela PLANOS[0], opacidade no mesmo
          relógio dos outros seis, só mora aqui por ser o elemento de LCP.
          data-capitulo="0" deixa o verifica-capitulos.mjs enxergá-lo — sem
          isso a fronteira 01→02 passava por vacuidade, sem checar nada */}
      <div ref={palco} className={s.palco} data-capitulo="0">
        <div className={s.conteudo}>
          <span className={`eyebrow ${s.eyebrow}`}>
            Jardins · São Paulo
          </span>

          {/* entrada por máscara, palavra a palavra. Em CSS e não em GSAP:
              sem JS o título continua aparecendo, e não há flash entre o
              paint e a hidratação */}
          {/* o espaço entre palavras é um nó de texto real, fora da máscara —
              mesmo motivo documentado em Reveal.tsx e em globals.css */}
          <h1 ref={titulo} className={s.titulo}>
            {TITULO.map((p, i) => (
              <Fragment key={`${p}-${i}`}>
                <span className={s.palavra}>
                  <i style={{ animationDelay: `${0.18 + i * 0.05}s` }}>
                    {p}
                  </i>
                </span>
                {i < TITULO.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>

          {/* Três fatos, um por oração. O sub anterior ("Tratamentos modernos
              com foco em conforto, estética e saúde bucal") era uma tríade de
              abstrações que serviria para qualquer clínica do país. */}
          <p className={s.sub}>
            Cinquenta minutos na primeira consulta. Nenhum procedimento no
            mesmo dia. O plano sai por escrito antes de você decidir.
          </p>

          <div className={s.acoes}>
            <Botao href={WHATSAPP_URL} externo>
              Agendar Consulta
            </Botao>
            <Botao href="#sobre" variante="ghost" tom="escuro">
              Conhecer a Clínica
            </Botao>
          </div>

          {/* Indicadores que sustentam a tese em vez de brigar com ela.
              Os anteriores (★★★★★ · "Mais de 1.500 pacientes atendidos" ·
              "98% de satisfação") eram o selo de confiança mais padrão que
              existe, e o do meio contradizia o H1 na mesma tela: volume de
              atendimento como orgulho, num site cujo argumento é atender
              cinco pessoas por dia. Estes três são fatos verificáveis no
              resto da página e nenhum repete o H1 ou o sub. */}
          <div className={s.indicadores}>
            <span>Desde 2009 nos Jardins</span>
            <span className={s.sep} aria-hidden />
            <span>Atendimento particular</span>
            <span className={s.sep} aria-hidden />
            <span>Retornos em 30, 90 e 180 dias</span>
          </div>
        </div>

        {/* só o fio e a seta: "ROLE" em caixa alta ficava ambíguo */}
        <div className={s.rolar} aria-hidden>
          <span className={s.fio} />
          <span className={s.seta}>↓</span>
        </div>
      </div>

      <Capitulos />
    </section>
  );
}
