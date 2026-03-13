/**
 * Cached data fetching utilities for projects
 *
 * This file provides high-performance cached data fetching using Next.js 16's
 * Cache Components feature. Projects are cached for extended periods since
 * they don't change frequently.
 *
 * Key features:
 * - Uses "use cache" directive for optimal performance
 * - Implements cacheLife for long-term caching (days)
 * - Uses cacheTag for targeted revalidation
 * - Server-side only (Convex server client)
 */

import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * Project type matching Convex schema
 */
export interface Project {
  _id: string;
  _creationTime: number;
  id: string;
  title: string;
  description?: string;
  src: string;
  type: "video" | "gif";
  poster?: string;
  alt?: string;
  url?: string;
  badges?: {
    text: string;
    position?: "bottom-left" | "bottom-right";
  }[];
  aspectRatio?: string;
  order: number;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Fetch all published projects with aggressive caching
 *
 * This function is cached for multiple days since projects rarely change.
 * Use revalidateTag("projects") or updateTag("projects") to invalidate.
 *
 * Performance characteristics:
 * - First request: Fetches from Convex and caches result
 * - Subsequent requests: Serves from cache (instant)
 * - Cache duration: 7 days (configurable via cacheLife)
 * - Can be manually revalidated via tag
 *
 * @returns Array of published projects, sorted by order
 */
export async function getCachedProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("days");

  try {
    const projects = await fetchQuery(api.projects.getPublishedProjects);
    return projects as Project[];
  } catch (error) {
    console.warn("Could not fetch projects:", error);
    return [];
  }
}

/**
 * Fetch a single project by ID with caching
 *
 * This function caches individual project lookups.
 * Use revalidateTag("projects") to invalidate all project caches.
 *
 * @param projectId - The unique project identifier
 * @returns The project if found, null otherwise
 */
export async function getCachedProjectById(
  projectId: string
): Promise<Project | null> {
  "use cache";
  cacheTag("projects", `project-${projectId}`);
  cacheLife("days");

  try {
    const project = await fetchQuery(api.projects.getProjectById, {
      projectId,
    });
    return project as Project | null;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    return null;
  }
}

/**
 * Get projects count (useful for analytics)
 *
 * Cached separately from the full project list for efficiency.
 */
export async function getCachedProjectsCount(): Promise<number> {
  "use cache";
  cacheTag("projects", "projects-count");
  cacheLife("days");

  try {
    const projects = await fetchQuery(api.projects.getPublishedProjects);
    return projects.length;
  } catch (error) {
    console.error("Error fetching projects count:", error);
    return 0;
  }
}
