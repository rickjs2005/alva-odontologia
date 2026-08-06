/** Todo o texto do site em um lugar só.
 *  Regra editorial: frases curtas, um detalhe concreto por parágrafo, no
 *  máximo uma piada por texto. Proibido: "excelência", "soluções
 *  personalizadas", "compromisso com o seu sorriso". */

export const SOBRE = {
  eyebrow: "A clínica",
  titulo: "Sem pressa, desde 2009.",
  paragrafos: [
    "A ALVA começou em 2009, numa sala emprestada na Alameda Lorena. A Dra. Marina Alencastro tinha voltado de um período em Genebra com uma ideia fixa: dava para fazer odontologia sem pressa. Nos primeiros dois anos ela atendia oito pacientes por dia. Hoje atende cinco, de propósito.",
    "O prédio mudou. A equipe virou onze pessoas. O escâner intraoral aposentou a moldagem de alginato, de que ninguém sente falta. O tempo por consulta é o único número que continua igual.",
  ],
  assinatura: "Dra. Marina Alencastro · CRO-SP 68.442",
} as const;

export const ESPECIALIDADES = [
  {
    id: "implantes",
    titulo: "Implantes",
    texto:
      "Do planejamento digital à coroa definitiva, com o osso mapeado antes de qualquer corte.",
  },
  {
    id: "clareamento",
    titulo: "Clareamento",
    texto:
      "Protocolo ajustado à sua sensibilidade, não ao relógio da agenda.",
  },
  {
    id: "facetas",
    titulo: "Facetas",
    texto:
      "Ensaio digital antes de tocar no dente. Você aprova o resultado primeiro.",
  },
  {
    id: "ortodontia",
    titulo: "Ortodontia",
    texto:
      "Alinhadores transparentes ou aparelho fixo — a escolha começa no diagnóstico.",
  },
  {
    id: "harmonizacao",
    titulo: "Harmonização Facial",
    texto:
      "Medida, discreta e reversível. O objetivo é você parecer descansado, não outro.",
  },
  {
    id: "estetica",
    titulo: "Odontologia Estética",
    texto:
      "Resinas e recontornos para quem quer ajuste fino, não reconstrução.",
  },
] as const;

export const DIFERENCIAIS = [
  {
    titulo: "Escâner 3D",
    texto:
      "A moldagem com massa saiu de cena. O escaneamento leva quatro minutos e você vê o resultado na tela na hora.",
  },
  {
    titulo: "Planejamento Digital",
    texto:
      "O tratamento é simulado antes de começar. Você aprova o desenho do sorriso antes do primeiro procedimento.",
  },
  {
    titulo: "Sedação Consciente",
    texto:
      "Para quem trava só de sentar na cadeira. Você fica acordado, relaxado, e sai dirigindo.",
  },
  {
    titulo: "Atendimento Humanizado",
    texto:
      "Cinco pacientes por dia, por decisão. Ninguém é atendido com o próximo esperando na porta.",
  },
] as const;

export const JORNADA = [
  {
    passo: "01",
    titulo: "Primeira consulta",
    texto:
      "Cinquenta minutos. Escaneamento, fotos e conversa — sem procedimento no mesmo dia.",
  },
  {
    passo: "02",
    titulo: "Diagnóstico Digital",
    texto:
      "As imagens viram um modelo 3D da sua boca. É nele que o plano é desenhado.",
  },
  {
    passo: "03",
    titulo: "Plano Personalizado",
    texto:
      "Etapas, prazos e valores por escrito. Você leva para casa antes de decidir.",
  },
  {
    passo: "04",
    titulo: "Tratamento",
    texto: "Sessões agendadas com folga entre elas. Nada de maratona.",
  },
  {
    passo: "05",
    titulo: "Acompanhamento",
    texto: "Retornos em 30, 90 e 180 dias, já marcados na saída.",
  },
] as const;

export const DEPOIMENTOS = [
  {
    id: "camila",
    texto:
      "Eu adiei isso por uns seis anos. Não por medo de dentista — por medo de ouvir o tamanho do problema. A Dra. Marina virou a tela do escaneamento pra mim e dividiu em três etapas. Aí ficou possível. Terminei em outubro.",
    nome: "Camila Rezende",
    detalhe: "34 anos, arquiteta",
    foto: "/img/depoimento-01.webp",
  },
  {
    id: "rodrigo",
    texto:
      "Cheguei achando que ia sair com orçamento de faceta em oito dentes. Saí com clareamento e uma resina. Foi a primeira vez que um dentista me disse pra fazer menos.",
    nome: "Rodrigo Sampaio",
    detalhe: "41 anos, gerente comercial",
    foto: "/img/depoimento-02.webp",
  },
  {
    id: "patricia",
    texto:
      "Minha filha tem 9 anos e chorava na porta de qualquer consultório. Aqui ela pediu pra voltar. Não sei o que fizeram, mas funcionou.",
    nome: "Patrícia Nolasco",
    detalhe: "38 anos, professora",
    foto: "/img/depoimento-03.webp",
  },
] as const;

export const CASOS = [
  {
    id: "facetas",
    chip: "Facetas",
    titulo: "Facetas em seis dentes, oito semanas.",
    apoio:
      "O desenho foi aprovado em provisório antes de qualquer desgaste. Nenhum dente foi tocado sem a paciente ver o resultado primeiro.",
    paciente: "Paciente, 34 anos · facetas em porcelana",
    antes: "/img/antes.webp",
    depois: "/img/depois.webp",
    altAntes:
      "Sorriso antes das facetas: dentes desalinhados, com espaço entre os incisivos",
    altDepois:
      "Sorriso depois das facetas: dentes alinhados, uniformes e sem espaço",
  },
  {
    id: "clareamento",
    chip: "Clareamento",
    titulo: "Clareamento em consultório, três sessões.",
    apoio:
      "Café de vinte anos não sai numa sessão. Fizemos em três, com dessensibilizante entre elas, porque ele tinha histórico de sensibilidade.",
    paciente: "Paciente, 45 anos · clareamento em consultório",
    antes: "/img/antes-2.webp",
    depois: "/img/depois-2.webp",
    altAntes: "Sorriso antes do clareamento: dentes escurecidos e acinzentados",
    altDepois: "Sorriso depois do clareamento: esmalte visivelmente mais claro",
  },
  {
    id: "ortodontia",
    chip: "Ortodontia",
    titulo: "Alinhadores, catorze meses.",
    apoio:
      "Apinhamento no arco superior, um canino fora da linha. Sem extração — o espaço veio do próprio arco, com desgaste interproximal mínimo.",
    paciente: "Paciente, 25 anos · alinhadores transparentes",
    antes: "/img/antes-3.webp",
    depois: "/img/depois-3.webp",
    altAntes:
      "Sorriso antes da ortodontia: dentes apinhados, canino fora do arco",
    altDepois: "Sorriso depois da ortodontia: arco regular e alinhado",
  },
] as const;

/** Quatro cômodos, não seis. Instrumental é um close e não uma sala; Fachada
 *  colide com o plano 01 do hero, que já abre na porta.
 *
 *  Os textos falam do espaço — luz, orientação, material. O processo é
 *  assunto do hero (lib/scenes.ts). Nenhuma frase se repete entre os dois. */
export const TOUR = [
  {
    src: "/img/tour-01.webp",
    titulo: "Recepção",
    texto: "Seis poltronas. Raramente duas ocupadas ao mesmo tempo.",
  },
  {
    src: "/img/tour-02.webp",
    titulo: "Sala de espera",
    texto:
      "A luz entra pelo leste. Às nove da manhã ela chega no chão de tábua corrida.",
  },
  {
    src: "/img/tour-03.webp",
    titulo: "Consultório 1",
    texto:
      "A cadeira fica de costas para a janela. Você olha para a árvore, não para o refletor.",
  },
  {
    src: "/img/tour-04.webp",
    titulo: "Sala do escâner",
    texto:
      "A única sala sem janela. Escuro por projeto — a tela precisa ser a coisa mais clara do ambiente.",
  },
] as const;

export const FAQ = [
  {
    p: "Quanto tempo dura a primeira consulta?",
    r: "Cerca de cinquenta minutos. Fazemos o escaneamento intraoral, fotos e uma conversa sobre o que te incomoda. Não realizamos procedimento no mesmo dia — o plano vem depois, por escrito.",
  },
  {
    p: "Vocês atendem por convênio?",
    r: "Não. Trabalhamos só com atendimento particular, porque é o que nos permite manter cinco pacientes por dia e o tempo de consulta que praticamos. Parcelamos em até 12 vezes no cartão e emitimos nota para reembolso do seu plano.",
  },
  {
    p: "Clareamento deixa o dente sensível?",
    r: "Pode deixar, por alguns dias. A sensibilidade depende muito de cada pessoa, então ajustamos a concentração do gel e o intervalo entre as sessões ao seu caso. Quem tem histórico de sensibilidade começa com protocolo mais suave e dessensibilizante antes.",
  },
  {
    p: "Em quanto tempo o implante fica pronto?",
    r: "Da cirurgia à coroa definitiva, em geral de três a seis meses — o osso precisa desse tempo para integrar o pino. Você não fica sem dente nesse período: sai da cirurgia com um provisório.",
  },
  {
    p: "O que é sedação consciente? Eu vou dormir?",
    r: "Não. É óxido nitroso inalado por uma máscara nasal: você fica acordado, conversando, só que sem a tensão. O efeito passa em poucos minutos ao final e você sai dirigindo normalmente.",
  },
  {
    p: "Dá para ver como vai ficar antes de começar?",
    r: "Sim, e é assim que trabalhamos. A partir do escaneamento montamos um ensaio digital do sorriso. Em facetas e reabilitações, dá para testar o desenho na sua própria boca com um provisório antes de qualquer desgaste.",
  },
] as const;
