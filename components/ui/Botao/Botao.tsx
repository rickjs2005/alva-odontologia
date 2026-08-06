import type { ReactNode } from "react";
import s from "./Botao.module.css";

type Props = {
  href: string;
  children: ReactNode;
  variante?: "primario" | "ghost";
  tamanho?: "medio" | "gigante";
  externo?: boolean;
  magnetico?: boolean;
  seta?: boolean;
};

/** O magnetismo é aplicado pelo Cursor: ele procura [data-magnetico] e
 *  translada o elemento até 8px. Em touch e reduced-motion nada acontece.
 *
 *  Havia uma prop `tom` que trocava o ghost entre traço escuro (seções
 *  claras) e traço claro (sobre o filme). Com a paleta escura não há mais
 *  seções claras: sobrou um ghost só, e a prop foi removida em vez de
 *  virar um no-op. */
export default function Botao({
  href,
  children,
  variante = "primario",
  tamanho = "medio",
  externo = false,
  magnetico = true,
  seta = false,
}: Props) {
  return (
    <a
      href={href}
      className={`${s.botao} ${s[tamanho]} ${s[variante]}`}
      {...(externo
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...(magnetico ? { "data-magnetico": true } : {})}
    >
      {children}
      {seta && (
        <span className={s.seta} aria-hidden>
          →
        </span>
      )}
    </a>
  );
}
