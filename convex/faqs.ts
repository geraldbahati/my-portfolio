/**
 * Convex queries and mutations for FAQs
 *
 * This file contains all the database operations for managing FAQs.
 * Uses the new Convex function syntax with explicit validators.
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";

/**
 * Get all published FAQs, ordered by display order
 */
export const getPublishedFaqs = query({
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
    const faqs = await ctx.db
      .query("faqs")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    return faqs.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get all FAQs (including unpublished) - for admin use only
 */
export const getAllFaqs = internalQuery({
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
    const faqs = await ctx.db.query("faqs").withIndex("by_order").collect();

    return faqs;
  },
});

/**
 * Get a single FAQ by ID (internal use only)
 */
export const getFaq = internalQuery({
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
  handler: async (ctx, args) => {
    return await ctx.db.get(args.faqId);
  },
});

/**
 * Create a new FAQ (internal use only)
 */
export const createFaq = internalMutation({
  args: {
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("faqs"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const faqId = await ctx.db.insert("faqs", {
      question: args.question,
      answer: args.answer,
      order: args.order,
      isPublished: args.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return faqId;
  },
});

/**
 * Update an existing FAQ (internal use only)
 */
export const updateFaq = internalMutation({
  args: {
    faqId: v.id("faqs"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { faqId, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(faqId, {
      ...updates,
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Delete a FAQ (internal use only)
 */
export const deleteFaq = internalMutation({
  args: {
    faqId: v.id("faqs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.faqId);
    return null;
  },
});

/**
 * Reorder FAQs by updating their order values (internal use only)
 */
export const reorderFaqs = internalMutation({
  args: {
    faqOrders: v.array(
      v.object({
        faqId: v.id("faqs"),
        order: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const { faqId, order } of args.faqOrders) {
      await ctx.db.patch(faqId, {
        order,
        updatedAt: now,
      });
    }

    return null;
  },
});
