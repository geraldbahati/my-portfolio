/**
 * Convex queries and mutations for project details
 *
 * This file manages the projectDetails table which stores core metadata,
 * hero section, and color palette information for project detail pages.
 * Relationship: 1:1 with projects table
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";

// =============================================================================
// Validators (reusable)
// =============================================================================

const colorPaletteValidator = v.array(
  v.object({
    hex: v.string(),
    name: v.optional(v.string()),
  }),
);

const projectDetailsReturnValidator = v.object({
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
  colorPalette: v.optional(colorPaletteValidator),
  relatedProjectIds: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Get project details by project document ID
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(projectDetailsReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const details = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    return details;
  },
});

/**
 * Get project details by project slug ID
 */
export const getByProjectSlug = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.union(projectDetailsReturnValidator, v.null()),
  handler: async (ctx, args) => {
    // First find the project by slug
    const project = await ctx.db
      .query("projects")
      .withIndex("by_project_id", (q) => q.eq("id", args.projectSlug))
      .unique();

    if (!project) {
      return null;
    }

    // Then get the details
    const details = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .unique();

    return details;
  },
});

// =============================================================================
// Internal Queries (for use by other Convex functions)
// =============================================================================

/**
 * Internal: Get project details by document ID
 */
export const getByDocId = internalQuery({
  args: {
    detailsId: v.id("projectDetails"),
  },
  returns: v.union(projectDetailsReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.detailsId);
  },
});

/**
 * Internal: Get project details by project ID
 */
export const getByProjectIdInternal = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(projectDetailsReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// =============================================================================
// Internal Mutations
// =============================================================================

/**
 * Create project details (1:1 with project)
 */
export const create = internalMutation({
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
    colorPalette: v.optional(colorPaletteValidator),
    relatedProjectIds: v.optional(v.array(v.string())),
  },
  returns: v.id("projectDetails"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if details already exist for this project
    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      throw new Error(
        `Project details already exist for project ${args.projectId}`,
      );
    }

    return await ctx.db.insert("projectDetails", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update project details
 */
export const update = internalMutation({
  args: {
    detailsId: v.id("projectDetails"),
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
    colorPalette: v.optional(colorPaletteValidator),
    relatedProjectIds: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { detailsId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(detailsId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Upsert project details (create or update)
 */
export const upsert = internalMutation({
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
    colorPalette: v.optional(colorPaletteValidator),
    relatedProjectIds: v.optional(v.array(v.string())),
  },
  returns: v.id("projectDetails"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const { projectId, ...data } = args;

    // Check if details already exist
    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        ...data,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("projectDetails", {
        projectId,
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Delete project details
 */
export const remove = internalMutation({
  args: {
    detailsId: v.id("projectDetails"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.detailsId);
    return null;
  },
});

/**
 * Delete project details by project ID
 */
export const removeByProjectId = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const details = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (details) {
      await ctx.db.delete(details._id);
    }

    return null;
  },
});
