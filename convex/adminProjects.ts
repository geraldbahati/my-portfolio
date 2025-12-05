/**
 * Admin wrapper functions for projects management
 *
 * SECURITY: These functions are for LOCAL DEVELOPMENT ONLY
 * They check for development mode before allowing any operations
 * DO NOT commit this file to version control
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

/**
 * Get all projects (including unpublished) as a query - for real-time updates
 */
export const getAllProjectsQuery = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      src: v.string(),
      type: v.union(v.literal("video"), v.literal("gif")),
      poster: v.optional(v.string()),
      alt: v.optional(v.string()),
      url: v.optional(v.string()),
      badges: v.optional(
        v.array(
          v.object({
            text: v.string(),
            position: v.optional(
              v.union(v.literal("bottom-left"), v.literal("bottom-right"))
            ),
          })
        )
      ),
      aspectRatio: v.optional(v.string()),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_order")
      .order("asc")
      .collect();

    return projects;
  },
});

/**
 * Create a new project - DEV ONLY
 */
export const createProject = action({
  args: {
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    src: v.string(),
    type: v.union(v.literal("video"), v.literal("gif")),
    poster: v.optional(v.string()),
    alt: v.optional(v.string()),
    url: v.optional(v.string()),
    badges: v.optional(
      v.array(
        v.object({
          text: v.string(),
          position: v.optional(
            v.union(v.literal("bottom-left"), v.literal("bottom-right"))
          ),
        })
      )
    ),
    aspectRatio: v.optional(v.string()),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args): Promise<Id<"projects">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.createProject, args);
  },
});

/**
 * Update an existing project - DEV ONLY
 */
export const updateProject = action({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    src: v.optional(v.string()),
    type: v.optional(v.union(v.literal("video"), v.literal("gif"))),
    poster: v.optional(v.string()),
    alt: v.optional(v.string()),
    url: v.optional(v.string()),
    badges: v.optional(
      v.array(
        v.object({
          text: v.string(),
          position: v.optional(
            v.union(v.literal("bottom-left"), v.literal("bottom-right"))
          ),
        })
      )
    ),
    aspectRatio: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.updateProject, args);
  },
});

/**
 * Delete a project - DEV ONLY
 */
export const deleteProject = action({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.deleteProject, args);
  },
});

/**
 * Reorder projects - DEV ONLY
 */
export const reorderProjects = action({
  args: {
    projectOrders: v.array(
      v.object({
        projectId: v.id("projects"),
        order: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.reorderProjects, args);
  },
});
