import { CLINICA } from "@/lib/clinica";

const SITE = "https://alva-odontologia.vercel.app";

/** Schema.org Dentist. Campo inventado invalida o bloco inteiro, então só
 *  entra o que existe no vocabulário. */
const dados = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": `${SITE}/#clinica`,
  name: `${CLINICA.nome} Odontologia`,
  alternateName: `${CLINICA.nome} · ${CLINICA.assinatura}`,
  description:
    "Clínica odontológica nos Jardins, São Paulo, com escaneamento intraoral, planejamento digital e sedação consciente.",
  url: SITE,
  image: `${SITE}/img/tour-06.webp`,
  telephone: CLINICA.telefoneRaw,
  priceRange: "$$$",
  foundingDate: String(CLINICA.fundacao),
  founder: { "@type": "Person", name: CLINICA.responsavel },
  address: {
    "@type": "PostalAddress",
    streetAddress: CLINICA.endereco,
    addressLocality: CLINICA.cidade,
    addressRegion: CLINICA.uf,
    postalCode: CLINICA.cep,
    addressCountry: "BR",
  },
  geo: { "@type": "GeoCoordinates", latitude: -23.5673, longitude: -46.6689 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "13:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1500",
    bestRating: "5",
  },
  medicalSpecialty: "Dentistry",
  availableService: [
    "Implantes dentários",
    "Clareamento dental",
    "Facetas de porcelana",
    "Ortodontia",
    "Harmonização facial",
    "Odontologia estética",
  ].map((n) => ({ "@type": "MedicalProcedure", name: n })),
  sameAs: [CLINICA.instagramUrl],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
