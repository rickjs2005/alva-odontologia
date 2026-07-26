import SmoothScroll from "@/components/ui/SmoothScroll/SmoothScroll";
import Cursor from "@/components/Cursor/Cursor";
import Loader from "@/components/Loader/Loader";
import Nav from "@/components/Nav/Nav";
import Arco from "@/components/Arco/Arco";
import FundoProgressivo from "@/components/FundoProgressivo/FundoProgressivo";
import VideoRig from "@/components/VideoRig/VideoRig";
import Hero from "@/components/sections/Hero/Hero";
import Sobre from "@/components/sections/Sobre/Sobre";
import Especialidades from "@/components/sections/Especialidades/Especialidades";
import Diferenciais from "@/components/sections/Diferenciais/Diferenciais";
import Jornada from "@/components/sections/Jornada/Jornada";
import Interludio from "@/components/sections/Interludio/Interludio";
import Resultados from "@/components/sections/Resultados/Resultados";
import Depoimentos from "@/components/sections/Depoimentos/Depoimentos";
import Tour from "@/components/sections/Tour/Tour";
import Faq from "@/components/sections/Faq/Faq";
import Cta from "@/components/sections/Cta/Cta";
import Footer from "@/components/sections/Footer/Footer";
import Grao from "@/components/Grao/Grao";
import JsonLd from "@/components/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <Loader />
      <SmoothScroll />
      <FundoProgressivo />
      <Cursor />
      <VideoRig />
      <Nav />
      <Arco modo="progresso" />

      <main id="conteudo">
        <Hero />
        <Sobre />
        <Especialidades />
        <Diferenciais />
        <Jornada />
        <Interludio />
        <Resultados />
        <Depoimentos />
        <Tour />
        <Faq />
        <Cta />
      </main>

      <Footer />

      {/* por último: o grão vive sobre tudo */}
      <Grao />
    </>
  );
}
