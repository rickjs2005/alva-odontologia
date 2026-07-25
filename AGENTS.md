<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ALVA

Peça de vitrine da MilWeb: site institucional de uma clínica odontológica
fictícia. Spec em `docs/superpowers/specs/`, plano em `docs/superpowers/plans/`.

Regras que não se negociam:

- **Ouro (`#C9A86A`) só como fio de 1px ou caixa alta ≥14px peso 500.** Nunca
  preenchimento, nunca botão sólido dourado. Em corpo de texto ele não passa
  AA — para isso existe `--ouro-texto`.
- **Sem Framer Motion.** GSAP + CSS apenas. A meta de Lighthouse ≥95 não
  sobrevive aos dois.
- **Sem "excelência", "soluções personalizadas", "compromisso com o seu
  sorriso".** Frases curtas, um detalhe concreto por parágrafo.
- **`-g 1` no encode do vídeo do hero.** GOP 1 faz todo frame virar keyframe;
  sem isso o seek do scrub engasga e o efeito morre.
- **Scrub de vídeo se verifica com screenshot do Playwright**, olhado de
  verdade. Code review e `curl` não valem.
- **Nada de escrever arquivo por redirecionamento do PowerShell** (`>`,
  `Out-File`, `Set-Content`): gera BOM e quebra o parser.
- **Um componente por pasta**, com seu `.module.css` ao lado. Arquivo de seção
  que passa de ~200 linhas vira subcomponente.
