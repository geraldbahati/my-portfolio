/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Image metadata
export const alt = "Project by Gerald Bahati";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Dynamic image generation based on project slug
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch project data with error handling
  let data = null;
  try {
    data = await fetchQuery(api.projects.getFullProjectDetails, {
      projectSlug: slug,
    });
  } catch (error) {
    console.error("Failed to fetch project data for OG image:", error);
  }

  const projectTitle = data?.project?.title ?? "Project Showcase";
  const industry = data?.details?.industry ?? "Design & Development";
  const projectPoster = data?.project?.poster;

  // Fallback image handling
  let base64Image = "";
  if (projectPoster) {
    // Ideally we would fetch the remote image and convert buffer,
    // but ImageResponse supports remote URLs if configured.
    // However, to match the "tilted card with shadow" look perfectly without CORS issues,
    // passing the URL directly usually works in Vercel OG.
    // If it fails, we fall back to the profile image which we can read locally.
    base64Image = projectPoster;
  } else {
    try {
      const imageBuffer = await readFile(
        join(process.cwd(), "public/man-sitting.jpg"),
      );
      base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    } catch (e) {
      // Emergency fallback if file read fails (unlikely)
      base64Image = "https://geraldbahati.dev/man-sitting.jpg";
    }
  }

  // Font loading - use local fonts for reliability and performance
  const [interMediumData, interSemiBoldData, interBoldData] = await Promise.all(
    [
      readFile(join(process.cwd(), "app/fonts/Inter-Medium.woff")),
      readFile(join(process.cwd(), "app/fonts/Inter-SemiBold.woff")),
      readFile(join(process.cwd(), "app/fonts/Inter-Bold.woff")),
    ],
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
                alt={projectTitle}
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
            {/* Domain/Industry tag */}
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
              {industry}
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
                // Limit lines to avoid overflow if title is long
                maxHeight: "220px",
                overflow: "hidden",
              }}
            >
              {projectTitle}
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
              View Project
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
