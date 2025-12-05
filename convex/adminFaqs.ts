/**
 * Admin wrapper functions for FAQs management
 *
 * SECURITY: These functions are for LOCAL DEVELOPMENT ONLY
 * DO NOT commit this file to version control
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

/**
 * Get all FAQs (including unpublished) as a query - for real-time updates
 */
export const getAllFaqsQuery = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("faqs"),
      _creationTime: v.number(),
      question: v.string(),
      answer: v.string(),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const faqs = await ctx.db
      .query("faqs")
      .withIndex("by_order")
      .order("asc")
      .collect();

    return faqs;
  },
});

/**
 * Get a single FAQ by ID - DEV ONLY
 */
export const getFaq = action({
  args: { faqId: v.id("faqs") },
  returns: v.union(
    v.object({
      _id: v.id("faqs"),
      _creationTime: v.number(),
      question: v.string(),
      answer: v.string(),
      order: v.number(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args): Promise<any> => {
    await requireAdmin(ctx);
    return await ctx.runQuery(internal.faqs.getFaq, args);
  },
});

/**
 * Create a new FAQ - DEV ONLY
 */
export const createFaq = action({
  args: {
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("faqs"),
  handler: async (ctx, args): Promise<Id<"faqs">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.faqs.createFaq, args);
  },
});

/**
 * Update an existing FAQ - DEV ONLY
 */
export const updateFaq = action({
  args: {
    faqId: v.id("faqs"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.faqs.updateFaq, args);
  },
});

/**
 * Delete a FAQ - DEV ONLY
 */
export const deleteFaq = action({
  args: {
    faqId: v.id("faqs"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.faqs.deleteFaq, args);
  },
});

/**
 * Reorder FAQs - DEV ONLY
 */
export const reorderFaqs = action({
  args: {
    faqOrders: v.array(
      v.object({
        faqId: v.id("faqs"),
        order: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.faqs.reorderFaqs, args);
  },
});
