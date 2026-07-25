"use client";

import { useEffect, useState } from "react";
import { CLINICA, WHATSAPP_URL } from "@/lib/clinica";
import s from "./Nav.module.css";

const LINKS = [
  { href: "#sobre", texto: "Sobre" },
  { href: "#especialidades", texto: "Especialidades" },
  { href: "#resultados", texto: "Resultados" },
  { href: "#tour", texto: "Tour" },
  { href: "#faq", texto: "Dúvidas" },
];

export default function Nav() {
  const [colada, setColada] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setColada(window.scrollY > 80);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // painel aberto trava o corpo e fecha no Esc
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    window.dispatchEvent(new CustomEvent("alva:travar-scroll"));
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      window.dispatchEvent(new CustomEvent("alva:soltar-scroll"));
    };
  }, [aberto]);

  return (
    <header
      className={`${s.nav} ${colada && !aberto ? s.colada : ""} ${
        aberto ? s.aberto : ""
      }`}
    >
      <a href="#conteudo" className={s.marca} aria-label={`${CLINICA.nome}, início`}>
        {CLINICA.nome}
        <span className={s.marcaSub}>Odontologia</span>
      </a>

      <nav className={s.links} aria-label="Seções do site">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className={s.link}>
            {l.texto}
          </a>
        ))}
      </nav>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={s.cta}
        data-magnetico
      >
        Agendar
      </a>

      <button
        type="button"
        className={s.hamburguer}
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        onClick={() => setAberto((v) => !v)}
      >
        <span className={s.barra} />
        <span className={s.barra} />
      </button>

      <div
        id="menu-mobile"
        className={`${s.painel} ${aberto ? s.painelAberto : ""}`}
        hidden={!aberto}
      >
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={s.painelLink}
            onClick={() => setAberto(false)}
          >
            {l.texto}
          </a>
        ))}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={s.painelCta}
          onClick={() => setAberto(false)}
        >
          Agendar Consulta
        </a>
      </div>
    </header>
  );
}
