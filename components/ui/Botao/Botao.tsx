import type { ReactNode } from "react";
import s from "./Botao.module.css";

type Props = {
  href: string;
  children: ReactNode;
  variante?: "primario" | "ghost";
  tamanho?: "medio" | "gigante";
  tom?: "claro" | "escuro";
  externo?: boolean;
  magnetico?: boolean;
  seta?: boolean;
};

/** O magnetismo é aplicado pelo Cursor: ele procura [data-magnetico] e
 *  translada o elemento até 8px. Em touch e reduced-motion nada acontece. */
export default function Botao({
  href,
  children,
  variante = "primario",
  tamanho = "medio",
  tom = "claro",
  externo = false,
  magnetico = true,
  seta = false,
}: Props) {
  return (
    <a
      href={href}
      className={`${s.botao} ${s[tamanho]} ${s[variante]} ${
        tom === "escuro" ? s.escuro : ""
      }`}
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
