/**
 * Convex queries and mutations for project testimonials
 *
 * This file manages the projectTestimonials table which stores client
 * quotes and endorsements for project detail pages.
 * Relationship: 1:1 with projects table
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";

// =============================================================================
// Validators (reusable)
// =============================================================================

const projectTestimonialReturnValidator = v.object({
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

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Get testimonial for a project by project document ID
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(projectTestimonialReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectTestimonials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

/**
 * Get testimonial by project slug
 */
export const getByProjectSlug = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.union(projectTestimonialReturnValidator, v.null()),
  handler: async (ctx, args) => {
    // Find project by slug
    const project = await ctx.db
      .query("projects")
      .withIndex("by_project_id", (q) => q.eq("id", args.projectSlug))
      .unique();

    if (!project) {
      return null;
    }

    return await ctx.db
      .query("projectTestimonials")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .unique();
  },
});

// =============================================================================
// Internal Queries
// =============================================================================

/**
 * Internal: Get testimonial by document ID
 */
export const getByDocId = internalQuery({
  args: {
    testimonialId: v.id("projectTestimonials"),
  },
  returns: v.union(projectTestimonialReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testimonialId);
  },
});

/**
 * Internal: Get testimonial by project ID
 */
export const getByProjectIdInternal = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(projectTestimonialReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectTestimonials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// =============================================================================
// Internal Mutations
// =============================================================================

/**
 * Create a testimonial (1:1 with project)
 */
export const create = internalMutation({
  args: {
    projectId: v.id("projects"),
    quote: v.string(),
    authorName: v.string(),
    authorRole: v.optional(v.string()),
    authorCompany: v.optional(v.string()),
    authorImage: v.optional(v.string()),
  },
  returns: v.id("projectTestimonials"),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if testimonial already exists for this project
    const existing = await ctx.db
      .query("projectTestimonials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      throw new Error(
        `Testimonial already exists for project ${args.projectId}`,
      );
    }

    return await ctx.db.insert("projectTestimonials", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a testimonial
 */
export const update = internalMutation({
  args: {
    testimonialId: v.id("projectTestimonials"),
    quote: v.optional(v.string()),
    authorName: v.optional(v.string()),
    authorRole: v.optional(v.string()),
    authorCompany: v.optional(v.string()),
    authorImage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { testimonialId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(testimonialId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Upsert testimonial (create or update)
 */
export const upsert = internalMutation({
  args: {
    projectId: v.id("projects"),
    quote: v.string(),
    authorName: v.string(),
    authorRole: v.optional(v.string()),
    authorCompany: v.optional(v.string()),
    authorImage: v.optional(v.string()),
  },
  returns: v.id("projectTestimonials"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const { projectId, ...data } = args;

    // Check if testimonial already exists
    const existing = await ctx.db
      .query("projectTestimonials")
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
      return await ctx.db.insert("projectTestimonials", {
        projectId,
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Delete a testimonial
 */
export const remove = internalMutation({
  args: {
    testimonialId: v.id("projectTestimonials"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.testimonialId);
    return null;
  },
});

/**
 * Delete testimonial by project ID
 */
export const removeByProjectId = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const testimonial = await ctx.db
      .query("projectTestimonials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (testimonial) {
      await ctx.db.delete(testimonial._id);
    }

    return null;
  },
});
