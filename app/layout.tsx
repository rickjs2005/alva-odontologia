import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: [
    {
      path: "../public/fonts/CormorantGaramond-Light.woff2",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--display",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

const texto = localFont({
  src: [
    { path: "../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--texto",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alva-odontologia.vercel.app"),
  title: {
    default: "ALVA · Odontologia de Precisão — Jardins, São Paulo",
    template: "%s · ALVA",
  },
  description:
    "Clínica odontológica nos Jardins com escaneamento intraoral, planejamento digital e sedação consciente. Implantes, facetas, clareamento, ortodontia e harmonização facial.",
  keywords: [
    "dentista Jardins",
    "implante dentário São Paulo",
    "facetas de porcelana",
    "clareamento dental",
    "ortodontia invisível",
    "harmonização facial",
  ],
  authors: [{ name: "MilWeb", url: "https://milweb.com.br" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "ALVA Odontologia",
    title: "ALVA · Odontologia de Precisão",
    description:
      "Tratamentos modernos com foco em conforto, estética e saúde bucal. Jardins, São Paulo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALVA · Odontologia de Precisão",
    description:
      "Tratamentos modernos com foco em conforto, estética e saúde bucal.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#202124",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable}`}>
      <body>
        <a href="#conteudo" className="skip">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
