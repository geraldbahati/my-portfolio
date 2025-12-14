import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

// Reuse metadata from OG image
export const alt = "Gerald Bahati - Full Stack Developer & Digital Creative";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Read the profile image from public folder and convert to base64
  const imageBuffer = await readFile(
    join(process.cwd(), "public/original.jpeg"),
  );
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

  // Font loading
  const interMedium = fetch(
    new URL(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-500-normal.woff",
    ),
  ).then((res) => res.arrayBuffer());

  const interSemiBold = fetch(
    new URL(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-600-normal.woff",
    ),
  ).then((res) => res.arrayBuffer());

  const interBold = fetch(
    new URL(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff",
    ),
  ).then((res) => res.arrayBuffer());

  const [interMediumData, interSemiBoldData, interBoldData] = await Promise.all(
    [interMedium, interSemiBold, interBold],
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to right, #a1a1aa, #ffffff, #ffffff)",
          padding: "40px",
          fontFamily: '"Inter"',
        }}
      >
        {/* Main card container - centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "100px",
          }}
        >
          {/* Tilted image with white border - larger */}
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              transform: "rotate(-6deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "14px",
                background: "white",
                borderRadius: "32px",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={base64Image}
                alt="Gerald Bahati"
                style={{
                  width: "320px",
                  height: "420px",
                  objectFit: "cover",
                  objectPosition: "center top",
                  borderRadius: "24px",
                  filter: "grayscale(20%)",
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "20px",
              maxWidth: "480px",
            }}
          >
            {/* Domain tag */}
            <span
              style={{
                display: "flex",
                background: "#f3f4f6",
                color: "#1f2937",
                fontSize: "16px",
                fontWeight: 600,
                padding: "8px 20px",
                borderRadius: "50px",
                border: "1px solid #e5e7eb",
              }}
            >
              geraldbahati.dev
            </span>

            {/* Headline */}
            <h1
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: '"Inter"',
                fontSize: "40px",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#000000",
                margin: 0,
              }}
            >
              <span>Gerald Bahati - Full Stack</span>
              <span>Developer & Digital</span>
              <span>Creative</span>
            </h1>

            {/* CTA Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000000",
                color: "white",
                fontSize: "18px",
                fontWeight: 500,
                margin: "20px 0",
                padding: "16px 80px",
                borderRadius: "50px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              }}
            >
              Read more
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interMediumData,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter",
          data: interSemiBoldData,
          style: "normal",
          weight: 600,
        },
        {
          name: "Inter",
          data: interBoldData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
