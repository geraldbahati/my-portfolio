/**
 * Admin wrapper functions for project details management
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

// Validators
const colorPaletteValidator = v.array(
  v.object({
    hex: v.string(),
    name: v.optional(v.string()),
  }),
);

/**
 * Get project details by project ID
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
    v.object({
      _id: v.id("projectDetails"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      heroImage: v.optional(v.string()),
      heroAlt: v.optional(v.string()),
      tagline: v.optional(v.string()),
      fullDescription: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
      client: v.optional(v.string()),
      industry: v.optional(v.string()),
      period: v.optional(v.string()),
      year: v.optional(v.number()),
      features: v.optional(v.array(v.string())),
      videoUrl: v.optional(v.string()),
      videoPoster: v.optional(v.string()),
      videoAlt: v.optional(v.string()),
      colorPalette: v.optional(colorPaletteValidator),
      relatedProjectIds: v.optional(v.array(v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

/**
 * Upsert project details (create or update)
 */
export const upsertDetails = action({
  args: {
    projectId: v.id("projects"),
    heroImage: v.optional(v.string()),
    heroAlt: v.optional(v.string()),
    tagline: v.optional(v.string()),
    fullDescription: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
    client: v.optional(v.string()),
    industry: v.optional(v.string()),
    period: v.optional(v.string()),
    year: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),
    videoPoster: v.optional(v.string()),
    videoAlt: v.optional(v.string()),
    colorPalette: v.optional(colorPaletteValidator),
    relatedProjectIds: v.optional(v.array(v.string())),
  },
  returns: v.id("projectDetails"),
  handler: async (ctx, args): Promise<Id<"projectDetails">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectDetails.upsert, args);
  },
});

/**
 * Delete project details
 * Also cleans up associated media from Cloudflare R2/Stream
 */
export const deleteDetails = action({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);

    // Get existing details to clean up media
    const existing = await ctx.runQuery(
      internal.projectDetails.getByProjectIdInternal,
      {
        projectId: args.projectId,
      },
    );

    if (existing) {
      // Clean up hero image from R2
      if (
        existing.heroImage &&
        existing.heroImage.includes("media.geraldbahati.dev")
      ) {
        const key = extractR2Key(existing.heroImage);
        if (key) {
          try {
            await ctx.runAction(internal.r2.deleteObjectInternal, { key });
            console.log(`[Delete] Removed heroImage from R2: ${key}`);
          } catch (error) {
            console.warn(`[Delete] Failed to delete heroImage: ${error}`);
          }
        }
      }

      // Clean up video from Stream or R2
      if (existing.videoUrl) {
        if (existing.videoUrl.includes("cloudflarestream.com")) {
          const streamUid = extractStreamUid(existing.videoUrl);
          if (streamUid) {
            try {
              await ctx.runAction(internal.stream.deleteVideoInternal, {
                uid: streamUid,
              });
              console.log(`[Delete] Removed video from Stream: ${streamUid}`);
            } catch (error) {
              console.warn(`[Delete] Failed to delete Stream video: ${error}`);
            }
          }
        } else if (existing.videoUrl.includes("media.geraldbahati.dev")) {
          const key = extractR2Key(existing.videoUrl);
          if (key) {
            try {
              await ctx.runAction(internal.r2.deleteObjectInternal, { key });
              console.log(`[Delete] Removed video from R2: ${key}`);
            } catch (error) {
              console.warn(`[Delete] Failed to delete R2 video: ${error}`);
            }
          }
        }
      }

      // Clean up video poster from R2 (unless it's a Stream thumbnail)
      if (
        existing.videoPoster &&
        existing.videoPoster.includes("media.geraldbahati.dev")
      ) {
        const key = extractR2Key(existing.videoPoster);
        if (key) {
          try {
            await ctx.runAction(internal.r2.deleteObjectInternal, { key });
            console.log(`[Delete] Removed videoPoster from R2: ${key}`);
          } catch (error) {
            console.warn(`[Delete] Failed to delete videoPoster: ${error}`);
          }
        }
      }
    }

    return await ctx.runMutation(
      internal.projectDetails.removeByProjectId,
      args,
    );
  },
});

/**
 * Extract Stream video UID from URL
 */
function extractStreamUid(url: string): string | null {
  const match = url.match(/cloudflarestream\.com\/([a-f0-9]+)/i);
  return match ? match[1] : null;
}

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
