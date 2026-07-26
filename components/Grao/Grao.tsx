import s from "./Grao.module.css";

/** Ruído gerado por feTurbulence e embutido como data URI: nenhuma requisição,
 *  nenhum arquivo, e escala sem pixelar. */
const RUIDO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23r)' opacity='0.5'/%3E%3C/svg%3E\")";

export default function Grao() {
  return (
    <>
      <div
        className={s.grao}
        style={{ ["--ruido" as string]: RUIDO }}
        aria-hidden
      />
      <div className={s.vinheta} aria-hidden />
    </>
  );
}
