import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

/**
 * Helper to trigger on-demand cache revalidation on the Next.js site.
 *
 * Admin write actions call this after mutating projects/FAQs so the cached,
 * statically-served pages update promptly instead of waiting for the
 * time-based `cacheLife`. Fire-and-forget: failures are logged, never thrown,
 * so admin UX is never blocked by revalidation.
 *
 * Requires these Convex deployment env vars:
 * - SITE_REVALIDATE_URL: the canonical site origin, e.g. https://www.geraldbahati.dev
 * - REVALIDATE_SECRET:    shared secret matching the Next route handler
 */
const PROJECTS_CACHE_TAG = "projects";
const PROJECT_NAVIGATION_CACHE_TAG = "project-navigation";

export function getProjectRevalidationTags(projectSlug?: string): string[] {
  return [
    PROJECTS_CACHE_TAG,
    PROJECT_NAVIGATION_CACHE_TAG,
    ...(projectSlug ? [`project-${projectSlug}`] : []),
  ];
}

export async function triggerRevalidate(
  tags: string[] = [PROJECTS_CACHE_TAG],
): Promise<void> {
  const baseUrl = process.env.SITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!baseUrl || !secret) {
    console.warn(
      "[revalidate] SITE_REVALIDATE_URL / REVALIDATE_SECRET not set; skipping",
    );
    return;
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags }),
    });

    if (!res.ok) {
      console.warn(`[revalidate] request failed: ${res.status}`);
    }
  } catch (error) {
    console.warn("[revalidate] request error:", error);
  }
}

export async function triggerProjectRevalidate(
  ctx: ActionCtx,
  projectId: Id<"projects">,
): Promise<void> {
  const project: { id: string } | null = await ctx.runQuery(
    internal.projects.getProjectByDocId,
    { projectId },
  );

  await triggerRevalidate(getProjectRevalidationTags(project?.id));
}
