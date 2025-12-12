/**
 * Convex queries and mutations for projects
 *
 * This file contains all the database operations for managing projects.
 * Uses the new Convex function syntax with explicit validators.
 */

import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";

/**
 * Get all published projects, ordered by display order
 *
 * This query is designed to be cached at the application layer
 * for optimal performance since projects don't change frequently.
 */
export const getPublishedProjects = query({
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
              v.union(v.literal("bottom-left"), v.literal("bottom-right")),
            ),
          }),
        ),
      ),
      aspectRatio: v.optional(v.string()),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    // Use index for efficient querying - don't use .filter()
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Sort by order (already included in index, but explicit for clarity)
    return projects.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get all projects (including unpublished) - for admin use
 */
export const getAllProjects = internalQuery({
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
              v.union(v.literal("bottom-left"), v.literal("bottom-right")),
            ),
          }),
        ),
      ),
      aspectRatio: v.optional(v.string()),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_order")
      .collect();

    return projects;
  },
});

/**
 * Get a single project by its ID string
 */
export const getProjectById = query({
  args: {
    projectId: v.string(),
  },
  returns: v.union(
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
              v.union(v.literal("bottom-left"), v.literal("bottom-right")),
            ),
          }),
        ),
      ),
      aspectRatio: v.optional(v.string()),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Use index for efficient lookup by project ID
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_project_id")
      .collect();

    const project = projects.find((p) => p.id === args.projectId);

    return project ?? null;
  },
});

/**
 * Create a new project (internal use only)
 */
export const createProject = internalMutation({
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
            v.union(v.literal("bottom-left"), v.literal("bottom-right")),
          ),
        }),
      ),
    ),
    aspectRatio: v.optional(v.string()),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      id: args.id,
      title: args.title,
      description: args.description,
      src: args.src,
      type: args.type,
      poster: args.poster,
      alt: args.alt,
      url: args.url,
      badges: args.badges,
      aspectRatio: args.aspectRatio,
      order: args.order,
      isPublished: args.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

/**
 * Update an existing project (internal use only)
 */
export const updateProject = internalMutation({
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
            v.union(v.literal("bottom-left"), v.literal("bottom-right")),
          ),
        }),
      ),
    ),
    aspectRatio: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Get a project by document ID (internal use for deletion)
 */
export const getProjectByDocId = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
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
              v.union(v.literal("bottom-left"), v.literal("bottom-right")),
            ),
          }),
        ),
      ),
      aspectRatio: v.optional(v.string()),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

/**
 * Delete a project
 */
export const deleteProject = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.projectId);
    return null;
  },
});

/**
 * Reorder projects by updating their order values
 */
export const reorderProjects = internalMutation({
  args: {
    projectOrders: v.array(
      v.object({
        projectId: v.id("projects"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const { projectId, order } of args.projectOrders) {
      await ctx.db.patch(projectId, {
        order,
        updatedAt: now,
      });
    }

    return null;
  },
});

/**
 * Seed projects from the existing data (internal use only)
 * This is useful for initial data migration
 */
export const seedProjects = internalMutation({
  args: {
    projects: v.array(
      v.object({
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
                v.union(v.literal("bottom-left"), v.literal("bottom-right")),
              ),
            }),
          ),
        ),
        aspectRatio: v.optional(v.string()),
      }),
    ),
  },
  returns: v.array(v.id("projects")),
  handler: async (ctx, args) => {
    const now = Date.now();
    const insertedIds = [];

    for (let i = 0; i < args.projects.length; i++) {
      const project = args.projects[i];
      const id = await ctx.db.insert("projects", {
        ...project,
        order: i,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }

    return insertedIds;
  },
});
