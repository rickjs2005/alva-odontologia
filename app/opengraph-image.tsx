import { ImageResponse } from "next/og";
import { PATH_ARCO, VIEWBOX_ARCO } from "@/lib/arco";

export const alt = "ALVA · Odontologia de Precisão — Jardins, São Paulo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          color: "#f8f8f8",
        }}
      >
        <div
          style={{
            fontSize: 104,
            letterSpacing: 34,
            // o tracking empurra tudo para a esquerda; compensa o último vão
            marginLeft: 34,
            fontWeight: 300,
          }}
        >
          ALVA
        </div>

        <svg width="360" height="94" viewBox={VIEWBOX_ARCO} style={{ marginTop: 26 }}>
          <path d={PATH_ARCO} fill="none" stroke="#c9a961" strokeWidth={3} />
        </svg>

        <div
          style={{
            marginTop: 34,
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Odontologia de Precisão
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 20,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Jardins · São Paulo
        </div>
      </div>
    ),
    size
  );
}
