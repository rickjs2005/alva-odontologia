import Arco from "@/components/Arco/Arco";
import {
  CLINICA,
  ENDERECO_COMPLETO,
  MAPS_URL,
  WHATSAPP_URL,
} from "@/lib/clinica";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.rodape}>
      <div className="faixa">
        <div className={s.grade}>
          <div className={s.identidade}>
            <div className={s.marca}>{CLINICA.nome}</div>
            <div className={s.assinatura}>{CLINICA.assinatura}</div>
            <p className={s.lugar}>
              {CLINICA.bairro}, {CLINICA.cidade} · desde {CLINICA.fundacao}
            </p>
            <Arco modo="assinatura" className={s.arco} />
          </div>

          <div className={s.coluna}>
            <p className={s.rotulo}>Contato</p>
            <div className={s.linhas}>
              <a className={s.link} href={`tel:${CLINICA.telefoneRaw}`}>
                {CLINICA.telefone}
              </a>
              <a
                className={s.link}
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {CLINICA.whatsapp}
              </a>
              <a
                className={s.link}
                href={CLINICA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CLINICA.instagram}
              </a>
            </div>
          </div>

          <div className={s.colunaLarga}>
            <p className={s.rotulo}>Horários</p>
            <div className={s.linhas}>
              {CLINICA.horarios.map((h) => (
                <span key={h.dias} className={s.horario}>
                  <span>{h.dias}</span>
                  <span>{h.horas}</span>
                </span>
              ))}
            </div>
          </div>

          <div className={s.mapa}>
            {/* planta esquemática desenhada, não imagem de terceiros: pesa
                nada e não precisa de chave de API */}
            <svg
              className={s.mapaFundo}
              viewBox="0 0 400 300"
              aria-hidden
              preserveAspectRatio="xMidYMid slice"
            >
              <rect className={s.mapaQuadra} x="24" y="20" width="150" height="96" />
              <rect className={s.mapaQuadra} x="220" y="20" width="156" height="96" />
              <rect className={s.mapaQuadra} x="24" y="160" width="150" height="120" />
              <rect className={s.mapaQuadra} x="220" y="160" width="156" height="120" />
              <path className={s.mapaTraco} d="M0 138h400M196 0v300" />
              <path className={s.mapaTraco} d="M0 60h24M376 60h24M0 220h24" />
            </svg>
            <span className={s.mapaVeu} aria-hidden />
            <span className={s.pino} aria-hidden />
            <div className={s.mapaConteudo}>
              <address className={s.mapaEndereco}>
                {CLINICA.endereco}
                <br />
                {CLINICA.bairro} · {CLINICA.cidade}/{CLINICA.uf}
                <br />
                CEP {CLINICA.cep}
              </address>
              <a
                className={s.mapaBotao}
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                // o nome acessível precisa conter o texto visível do botão
                aria-label={`Abrir no mapa: ${ENDERECO_COMPLETO}`}
              >
                Abrir no mapa <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className={s.rodapinho}>
          <span>
            {CLINICA.responsavel} · {CLINICA.cro}
          </span>
          <span>
            Projeto fictício de demonstração, desenvolvido por{" "}
            <a
              href="https://milweb.com.br"
              target="_blank"
              rel="noopener noreferrer"
            >
              MilWeb
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
