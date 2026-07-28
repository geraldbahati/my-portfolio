/**
 * Convex queries and mutations for project challenges
 *
 * This file manages the projectChallenges table which stores problem/solution
 * narrative sections for project detail pages.
 * Relationship: 1:N with projects table
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";
import {
  getPublishedProjectById,
  getPublishedProjectBySlug,
} from "./projectAccess";

// =============================================================================
// Validators (reusable)
// =============================================================================

const projectChallengeReturnValidator = v.object({
  _id: v.id("projectChallenges"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  title: v.string(),
  content: v.string(),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Get all challenges for a project, ordered by display order
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(projectChallengeReturnValidator),
  handler: async (ctx, args) => {
    const project = await getPublishedProjectById(ctx, args.projectId);
    if (!project) {
      return [];
    }

    const challenges = await ctx.db
      .query("projectChallenges")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return challenges.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get challenges by project slug
 */
export const getByProjectSlug = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.array(projectChallengeReturnValidator),
  handler: async (ctx, args) => {
    const project = await getPublishedProjectBySlug(ctx, args.projectSlug);

    if (!project) {
      return [];
    }

    const challenges = await ctx.db
      .query("projectChallenges")
      .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
      .collect();

    return challenges.sort((a, b) => a.order - b.order);
  },
});

// =============================================================================
// Internal Queries
// =============================================================================

/**
 * Internal: Get challenge by document ID
 */
export const getByDocId = internalQuery({
  args: {
    challengeId: v.id("projectChallenges"),
  },
  returns: v.union(projectChallengeReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.challengeId);
  },
});

/**
 * Internal: Get challenges by project ID
 */
export const getByProjectIdInternal = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(projectChallengeReturnValidator),
  handler: async (ctx, args) => {
    const challenges = await ctx.db
      .query("projectChallenges")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return challenges.sort((a, b) => a.order - b.order);
  },
});

// =============================================================================
// Internal Mutations
// =============================================================================

/**
 * Create a challenge section
 */
export const create = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    content: v.string(),
    order: v.number(),
  },
  returns: v.id("projectChallenges"),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("projectChallenges", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a challenge section
 */
export const update = internalMutation({
  args: {
    challengeId: v.id("projectChallenges"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { challengeId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(challengeId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Delete a challenge section
 */
export const remove = internalMutation({
  args: {
    challengeId: v.id("projectChallenges"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.challengeId);
    return null;
  },
});

/**
 * Delete all challenges for a project
 */
export const removeByProjectId = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const challenges = await ctx.db
      .query("projectChallenges")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    await Promise.all(
      challenges.map((challenge) => ctx.db.delete(challenge._id)),
    );

    return null;
  },
});

/**
 * Reorder challenges
 */
export const reorder = internalMutation({
  args: {
    challengeOrders: v.array(
      v.object({
        challengeId: v.id("projectChallenges"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    await Promise.all(
      args.challengeOrders.map(({ challengeId, order }) =>
        ctx.db.patch(challengeId, {
          order,
          updatedAt: now,
        }),
      ),
    );

    return null;
  },
});

/**
 * Bulk create challenges for a project
 */
export const bulkCreate = internalMutation({
  args: {
    projectId: v.id("projects"),
    challenges: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
      }),
    ),
  },
  returns: v.array(v.id("projectChallenges")),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await Promise.all(
      args.challenges.map((challenge, order) =>
        ctx.db.insert("projectChallenges", {
          projectId: args.projectId,
          title: challenge.title,
          content: challenge.content,
          order,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );
  },
});
