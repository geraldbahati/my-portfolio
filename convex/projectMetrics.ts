/**
 * Convex queries and mutations for project metrics
 *
 * This file manages the projectMetrics table which stores KPI/results
 * statistics for project detail pages.
 * Relationship: 1:N with projects table
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";

// =============================================================================
// Validators (reusable)
// =============================================================================

const projectMetricReturnValidator = v.object({
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

// =============================================================================
// Public Queries
// =============================================================================

/**
 * Get all metrics for a project, ordered by display order
 */
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(projectMetricReturnValidator),
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query("projectMetrics")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return metrics.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get metrics by project slug
 */
export const getByProjectSlug = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.array(projectMetricReturnValidator),
  handler: async (ctx, args) => {
    // Find project by slug
    const project = await ctx.db
      .query("projects")
      .withIndex("by_project_id", (q) => q.eq("id", args.projectSlug))
      .unique();

    if (!project) {
      return [];
    }

    const metrics = await ctx.db
      .query("projectMetrics")
      .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
      .collect();

    return metrics.sort((a, b) => a.order - b.order);
  },
});

// =============================================================================
// Internal Queries
// =============================================================================

/**
 * Internal: Get a single metric by ID
 */
export const getByDocId = internalQuery({
  args: {
    metricId: v.id("projectMetrics"),
  },
  returns: v.union(projectMetricReturnValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.metricId);
  },
});

/**
 * Internal: Get metrics by project ID
 */
export const getByProjectIdInternal = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(projectMetricReturnValidator),
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query("projectMetrics")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
      .collect();

    return metrics.sort((a, b) => a.order - b.order);
  },
});

// =============================================================================
// Internal Mutations
// =============================================================================

/**
 * Create a new metric
 */
export const create = internalMutation({
  args: {
    projectId: v.id("projects"),
    value: v.string(),
    label: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
  },
  returns: v.id("projectMetrics"),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("projectMetrics", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing metric
 */
export const update = internalMutation({
  args: {
    metricId: v.id("projectMetrics"),
    value: v.optional(v.string()),
    label: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { metricId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(metricId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Delete a metric
 */
export const remove = internalMutation({
  args: {
    metricId: v.id("projectMetrics"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.metricId);
    return null;
  },
});

/**
 * Delete all metrics for a project
 */
export const removeByProjectId = internalMutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query("projectMetrics")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const metric of metrics) {
      await ctx.db.delete(metric._id);
    }

    return null;
  },
});

/**
 * Reorder metrics for a project
 */
export const reorder = internalMutation({
  args: {
    metricOrders: v.array(
      v.object({
        metricId: v.id("projectMetrics"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const { metricId, order } of args.metricOrders) {
      await ctx.db.patch(metricId, {
        order,
        updatedAt: now,
      });
    }

    return null;
  },
});

/**
 * Bulk create metrics for a project
 */
export const bulkCreate = internalMutation({
  args: {
    projectId: v.id("projects"),
    metrics: v.array(
      v.object({
        value: v.string(),
        label: v.string(),
        icon: v.optional(v.string()),
      }),
    ),
  },
  returns: v.array(v.id("projectMetrics")),
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];

    for (let i = 0; i < args.metrics.length; i++) {
      const metric = args.metrics[i];
      const id = await ctx.db.insert("projectMetrics", {
        projectId: args.projectId,
        value: metric.value,
        label: metric.label,
        icon: metric.icon,
        order: i,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});
