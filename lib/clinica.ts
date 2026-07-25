/** Dados da clínica em um lugar só. Tudo fictício — ver nota no rodapé. */
export const CLINICA = {
  nome: "ALVA",
  assinatura: "Odontologia de Precisão",
  fundacao: 2009,
  responsavel: "Dra. Marina Alencastro",
  cro: "CRO-SP 68.442",
  endereco: "Rua Doutor Melo Alves, 412",
  bairro: "Jardins",
  cidade: "São Paulo",
  uf: "SP",
  cep: "01417-010",
  telefone: "(11) 3062-8840",
  telefoneRaw: "+551130628840",
  whatsapp: "(11) 99164-2207",
  whatsappRaw: "5511991642207",
  instagram: "@alva.odontologia",
  instagramUrl: "https://instagram.com/alva.odontologia",
  horarios: [
    { dias: "Segunda a sexta", horas: "8h — 20h" },
    { dias: "Sábado", horas: "8h — 13h" },
    { dias: "Domingo", horas: "Fechado" },
  ],
} as const;

export const WHATSAPP_URL =
  `https://wa.me/${CLINICA.whatsappRaw}?text=` +
  encodeURIComponent("Olá! Gostaria de agendar uma avaliação na ALVA.");

export const ENDERECO_COMPLETO = `${CLINICA.endereco} — ${CLINICA.bairro}, ${CLINICA.cidade}/${CLINICA.uf}`;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${CLINICA.endereco}, ${CLINICA.bairro}, ${CLINICA.cidade}`
)}`;
