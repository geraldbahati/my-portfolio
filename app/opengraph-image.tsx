import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Gerald Bahati - Web Design & Digital Marketing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px 80px",
        }}
      >
        {/* Brand accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)",
          }}
        />

        {/* Name */}
        <span
          style={{
            color: "#d97706",
            fontSize: 20,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Gerald Bahati
        </span>

        {/* Title */}
        <h1
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 300,
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 16,
          }}
        >
          Web Design /
        </h1>
        <h1
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 72,
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 40,
          }}
        >
          Digital Marketing
        </h1>

        {/* Tagline */}
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 24,
            margin: 0,
          }}
        >
          Design meets Performance
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
