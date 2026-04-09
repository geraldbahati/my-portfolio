import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { projects as fallbackProjects } from "./(root)/projects/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://geraldbahati.dev";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/imprint`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let projectPages: MetadataRoute.Sitemap = fallbackProjects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return [...staticPages, ...projectPages];
  }

  try {
    const projects = await fetchQuery(api.projects.getPublishedProjects, {});
    projectPages = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: new Date(project.updatedAt || project.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Could not fetch projects for sitemap:", error);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }

  return [...staticPages, ...projectPages];
}
