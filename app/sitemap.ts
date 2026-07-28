import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { SITE_URL, toAbsoluteSiteUrl } from "@/lib/seo";
import { projects as fallbackProjects } from "./(root)/projects/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [`${SITE_URL}/hero-image.webp`],
    },
    {
      url: `${SITE_URL}/projects`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  let projectPages: MetadataRoute.Sitemap = fallbackProjects.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
    images: project.poster ? [toAbsoluteSiteUrl(project.poster)] : undefined,
  }));

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return [...staticPages, ...projectPages];
  }

  try {
    const projects = await fetchQuery(api.projects.getPublishedProjects, {});
    projectPages = projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.id}`,
      lastModified: new Date(project.updatedAt || project.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: project.poster ? [toAbsoluteSiteUrl(project.poster)] : undefined,
    }));
  } catch (error) {
    console.error("Could not fetch projects for sitemap:", error);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }

  return [...staticPages, ...projectPages];
}
