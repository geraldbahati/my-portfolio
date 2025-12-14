import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

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

  // Fetch project data
  const data = await fetchQuery(api.projects.getFullProjectDetails, {
    projectSlug: slug,
  });

  const projectTitle = data?.project?.title ?? "Project";
  const tagline = data?.details?.tagline ?? "";
  const industry = data?.details?.industry ?? "";

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
          position: "relative",
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

        {/* Industry tag */}
        {industry && (
          <span
            style={{
              color: "#d97706",
              fontSize: 18,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 20,
              padding: "8px 16px",
              border: "1px solid #d97706",
              borderRadius: "4px",
            }}
          >
            {industry}
          </span>
        )}

        {/* Project Title */}
        <h1
          style={{
            color: "white",
            fontSize: 80,
            fontWeight: 600,
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 20,
            maxWidth: "900px",
          }}
        >
          {projectTitle}
        </h1>

        {/* Tagline */}
        {tagline && (
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 28,
              margin: 0,
              marginBottom: 40,
              maxWidth: "800px",
            }}
          >
            {tagline}
          </p>
        )}

        {/* Author attribution */}
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 18,
            letterSpacing: "0.1em",
          }}
        >
          Gerald Bahati • Portfolio
        </span>
      </div>
    ),
    {
      ...size,
    },
  );
}
