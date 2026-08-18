import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { renderLlmsTxt } from "@/lib/seo";
import { projects as fallbackProjects } from "@/app/(root)/projects/data";

export const dynamic = "force-static";
export const revalidate = 86400;

async function getLlmsTxtProjects() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return fallbackProjects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
    }));
  }

  try {
    const projects = await fetchQuery(api.projects.getPublishedProjects, {});
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
    }));
  } catch (error) {
    console.error("Could not fetch projects for llms.txt:", error);
    return fallbackProjects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
    }));
  }
}

export async function GET() {
  const projects = await getLlmsTxtProjects();
  const body = renderLlmsTxt(projects);

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
