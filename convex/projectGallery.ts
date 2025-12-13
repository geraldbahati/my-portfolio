/**
 * Convex queries and mutations for project gallery
 *
 * This file manages the projectGallery table which stores screenshots,
 * mockups, and visual assets for project detail pages.
 * Relationship: 1:N with projects table
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";

// =============================================================================
// Validators (reusable)
// =============================================================================

const galleryTypeValidator = v.union(v.literal("feature"), v.literal("stack"));

const deviceTypeValidator = v.optional(
  v.union(
    v.literal("desktop"),
    v.literal("mobile"),
    v.literal("tablet"),
    v.literal("full-width"),
  ),
);

const projectGalleryReturnValidator = v.object({
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

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Get all gallery items for a project, ordered by display order
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(projectGalleryReturnValidator),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("projectGallery")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return items.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get gallery items by project slug
 */
export const getByProjectSlug = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.array(projectGalleryReturnValidator),
  handler: async (ctx, args) => {
    // Find project by slug
    const project = await ctx.db
      .query("projects")
      .withIndex("by_project_id", (q) => q.eq("id", args.projectSlug))
      .unique();

    if (!project) {
      return [];
    }

    const items = await ctx.db
      .query("projectGallery")
      .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
      .collect();

    return items.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get gallery items filtered by device type
 */
export const getByDeviceType = query({
  args: {
    projectId: v.id("projects"),
    deviceType: v.union(
      v.literal("desktop"),
      v.literal("mobile"),
      v.literal("tablet"),
      v.literal("full-width"),
    ),
  },
  returns: v.array(projectGalleryReturnValidator),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("projectGallery")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return items
      .filter((item) => item.deviceType === args.deviceType)
      .sort((a, b) => a.order - b.order);
  },
});

// =============================================================================
// Internal Queries
// =============================================================================

/**
 * Internal: Get gallery item by document ID
 */
export const getByDocId = internalQuery({
  args: {
    galleryId: v.id("projectGallery"),
  },
  returns: v.union(projectGalleryReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.galleryId);
  },
});

/**
 * Internal: Get gallery items by project ID
 */
export const getByProjectIdInternal = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(projectGalleryReturnValidator),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("projectGallery")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return items.sort((a, b) => a.order - b.order);
  },
});

// =============================================================================
// Internal Mutations
// =============================================================================

/**
 * Create a gallery item
 */
export const create = internalMutation({
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
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("projectGallery", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a gallery item
 */
export const update = internalMutation({
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
  handler: async (ctx, args) => {
    const { galleryId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(galleryId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Delete a gallery item
 */
export const remove = internalMutation({
  args: {
    galleryId: v.id("projectGallery"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.galleryId);
    return null;
  },
});

/**
 * Delete all gallery items for a project
 */
export const removeByProjectId = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("projectGallery")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    return null;
  },
});

/**
 * Reorder gallery items
 */
export const reorder = internalMutation({
  args: {
    galleryOrders: v.array(
      v.object({
        galleryId: v.id("projectGallery"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const { galleryId, order } of args.galleryOrders) {
      await ctx.db.patch(galleryId, {
        order,
        updatedAt: now,
      });
    }

    return null;
  },
});

/**
 * Bulk create gallery items for a project
 */
export const bulkCreate = internalMutation({
  args: {
    projectId: v.id("projects"),
    items: v.array(
      v.object({
        src: v.string(),
        alt: v.optional(v.string()),
        caption: v.optional(v.string()),
        galleryType: galleryTypeValidator,
        width: v.number(),
        height: v.number(),
        deviceType: deviceTypeValidator,
      }),
    ),
  },
  returns: v.array(v.id("projectGallery")),
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];

    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      const id = await ctx.db.insert("projectGallery", {
        projectId: args.projectId,
        src: item.src,
        alt: item.alt,
        caption: item.caption,
        galleryType: item.galleryType,
        width: item.width,
        height: item.height,
        deviceType: item.deviceType,
        order: i,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});
