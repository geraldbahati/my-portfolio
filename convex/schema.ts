import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  // Contact form submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    emailId: v.optional(v.string()), // Resend email ID for tracking
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
    submittedAt: v.number(), // timestamp
    clientIP: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),
});
