import SmoothScroll from "@/components/ui/SmoothScroll/SmoothScroll";
import Cursor from "@/components/Cursor/Cursor";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <main id="conteudo">{/* seções entram nas próximas tasks */}</main>
    </>
  );
}
