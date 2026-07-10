import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

export async function getPublishedProjectById(
  ctx: QueryCtx,
  projectId: Id<"projects">,
): Promise<Doc<"projects"> | null> {
  const project = await ctx.db.get(projectId);
  return project?.isPublished ? project : null;
}

export async function getPublishedProjectBySlug(
  ctx: QueryCtx,
  projectSlug: string,
): Promise<Doc<"projects"> | null> {
  const project = await ctx.db
    .query("projects")
    .withIndex("by_project_id", (q) => q.eq("id", projectSlug))
    .unique();

  return project?.isPublished ? project : null;
}
