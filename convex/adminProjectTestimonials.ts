/**
 * Admin wrapper functions for project testimonials management
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

const testimonialReturnValidator = v.object({
  _id: v.id("projectTestimonials"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  quote: v.string(),
  authorName: v.string(),
  authorRole: v.optional(v.string()),
  authorCompany: v.optional(v.string()),
  authorImage: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/**
 * Get testimonial for a project
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(testimonialReturnValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("projectTestimonials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

/**
 * Upsert testimonial (create or update)
 */
export const upsertTestimonial = action({
  args: {
    projectId: v.id("projects"),
    quote: v.string(),
    authorName: v.string(),
    authorRole: v.optional(v.string()),
    authorCompany: v.optional(v.string()),
    authorImage: v.optional(v.string()),
  },
  returns: v.id("projectTestimonials"),
  handler: async (ctx, args): Promise<Id<"projectTestimonials">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectTestimonials.upsert, args);
  },
});

/**
 * Delete testimonial
 * Also cleans up associated image from Cloudflare R2
 */
export const deleteTestimonial = action({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);

    // Get existing testimonial to clean up media
    const existing = await ctx.runQuery(
      internal.projectTestimonials.getByProjectIdInternal,
      {
        projectId: args.projectId,
      },
    );

    if (
      existing &&
      existing.authorImage &&
      existing.authorImage.includes("media.geraldbahati.dev")
    ) {
      const key = extractR2Key(existing.authorImage);
      if (key) {
        try {
          await ctx.runAction(internal.r2.deleteObjectInternal, { key });
          console.log(`[Delete] Removed authorImage from R2: ${key}`);
        } catch (error) {
          console.warn(`[Delete] Failed to delete authorImage: ${error}`);
        }
      }
    }

    return await ctx.runMutation(
      internal.projectTestimonials.removeByProjectId,
      args,
    );
  },
});

/**
 * Extract R2 key from media URL
 */
function extractR2Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1);
  } catch {
    return null;
  }
}
