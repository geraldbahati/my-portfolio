/**
 * Admin wrapper functions for project challenges management
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

const challengeReturnValidator = v.object({
  _id: v.id("projectChallenges"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  title: v.string(),
  content: v.string(),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/**
 * Get all challenges for a project
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(challengeReturnValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const challenges = await ctx.db
      .query("projectChallenges")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();
    return challenges.sort((a, b) => a.order - b.order);
  },
});

/**
 * Create a challenge
 */
export const createChallenge = action({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    content: v.string(),
    order: v.number(),
  },
  returns: v.id("projectChallenges"),
  handler: async (ctx, args): Promise<Id<"projectChallenges">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectChallenges.create, args);
  },
});

/**
 * Update a challenge
 */
export const updateChallenge = action({
  args: {
    challengeId: v.id("projectChallenges"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectChallenges.update, args);
  },
});

/**
 * Delete a challenge
 */
export const deleteChallenge = action({
  args: {
    challengeId: v.id("projectChallenges"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectChallenges.remove, args);
  },
});

/**
 * Reorder challenges
 */
export const reorderChallenges = action({
  args: {
    challengeOrders: v.array(
      v.object({
        challengeId: v.id("projectChallenges"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectChallenges.reorder, args);
  },
});
