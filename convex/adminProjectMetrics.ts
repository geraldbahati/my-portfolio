/**
 * Admin wrapper functions for project metrics management
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

const metricReturnValidator = v.object({
  _id: v.id("projectMetrics"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  value: v.string(),
  label: v.string(),
  icon: v.optional(v.string()),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/**
 * Get all metrics for a project
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(metricReturnValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const metrics = await ctx.db
      .query("projectMetrics")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();
    return metrics.sort((a, b) => a.order - b.order);
  },
});

/**
 * Create a new metric
 */
export const createMetric = action({
  args: {
    projectId: v.id("projects"),
    value: v.string(),
    label: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
  },
  returns: v.id("projectMetrics"),
  handler: async (ctx, args): Promise<Id<"projectMetrics">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectMetrics.create, args);
  },
});

/**
 * Update a metric
 */
export const updateMetric = action({
  args: {
    metricId: v.id("projectMetrics"),
    value: v.optional(v.string()),
    label: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectMetrics.update, args);
  },
});

/**
 * Delete a metric
 */
export const deleteMetric = action({
  args: {
    metricId: v.id("projectMetrics"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectMetrics.remove, args);
  },
});

/**
 * Reorder metrics
 */
export const reorderMetrics = action({
  args: {
    metricOrders: v.array(
      v.object({
        metricId: v.id("projectMetrics"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projectMetrics.reorder, args);
  },
});
