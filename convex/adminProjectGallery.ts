/**
 * Admin wrapper functions for project gallery management
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

const galleryTypeValidator = v.union(v.literal("feature"), v.literal("stack"));
const deviceTypeValidator = v.optional(
  v.union(
    v.literal("desktop"),
    v.literal("mobile"),
    v.literal("tablet"),
    v.literal("full-width"),
  ),
);

const galleryReturnValidator = v.object({
  _id: v.id("projectGallery"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  src: v.string(),
  alt: v.optional(v.string()),
  caption: v.optional(v.string()),
  galleryType: galleryTypeValidator,
  width: v.number(),
  height: v.number(),
  deviceType: deviceTypeValidator,
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/**
 * Get all gallery items for a project
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(galleryReturnValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const items = await ctx.db
      .query("projectGallery")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

/**
 * Create a gallery item
 */
export const createGalleryItem = action({
  args: {
    projectId: v.id("projects"),
    src: v.string(),
    alt: v.optional(v.string()),
    caption: v.optional(v.string()),
    galleryType: galleryTypeValidator,
    width: v.number(),
    height: v.number(),
    deviceType: deviceTypeValidator,
    order: v.number(),
  },
  returns: v.id("projectGallery"),
  handler: async (ctx, args): Promise<Id<"projectGallery">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectGallery.create, args);
  },
});

/**
 * Update a gallery item
 */
export const updateGalleryItem = action({
  args: {
    galleryId: v.id("projectGallery"),
    src: v.optional(v.string()),
    alt: v.optional(v.string()),
    caption: v.optional(v.string()),
    galleryType: v.optional(galleryTypeValidator),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    deviceType: deviceTypeValidator,
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectGallery.update, args);
  },
});

/**
 * Delete a gallery item
 * Also cleans up associated image from Cloudflare R2
 */
export const deleteGalleryItem = action({
  args: {
    galleryId: v.id("projectGallery"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);

    // Get existing item to clean up media
    const existing = await ctx.runQuery(internal.projectGallery.getByDocId, {
      galleryId: args.galleryId,
    });

    if (
      existing &&
      existing.src &&
      existing.src.includes("media.geraldbahati.dev")
    ) {
      const key = extractR2Key(existing.src);
      if (key) {
        try {
          await ctx.runAction(internal.r2.deleteObjectInternal, { key });
          console.log(`[Delete] Removed gallery image from R2: ${key}`);
        } catch (error) {
          console.warn(`[Delete] Failed to delete gallery image: ${error}`);
        }
      }
    }

    return await ctx.runMutation(internal.projectGallery.remove, args);
  },
});

/**
 * Reorder gallery items
 */
export const reorderGallery = action({
  args: {
    galleryOrders: v.array(
      v.object({
        galleryId: v.id("projectGallery"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectGallery.reorder, args);
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
