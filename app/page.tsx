import SmoothScroll from "@/components/ui/SmoothScroll/SmoothScroll";
import Cursor from "@/components/Cursor/Cursor";
import VideoRig from "@/components/VideoRig/VideoRig";
import Hero from "@/components/sections/Hero/Hero";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <VideoRig />
      <main id="conteudo">
        <Hero />
        {/* demais seções entram nas próximas tasks */}
      </main>
    </>
  );
}
