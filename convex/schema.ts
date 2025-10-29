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

  // Projects
  projects: defineTable({
    id: v.string(), // Unique project identifier (e.g., "ev-rent-gmbh")
    title: v.string(),
    description: v.optional(v.string()),
    src: v.string(), // Video/gif URL (prefer mp4 for performance)
    type: v.union(v.literal("video"), v.literal("gif")),
    poster: v.optional(v.string()), // Poster/thumbnail image
    alt: v.optional(v.string()), // Alt text for accessibility
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
    aspectRatio: v.optional(v.string()), // e.g., "16/9", "4/3"
    order: v.number(), // For sorting projects in display order
    isPublished: v.boolean(), // Control visibility
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_order", ["order"])
    .index("by_published", ["isPublished", "order"])
    .index("by_project_id", ["id"]), // For looking up by project ID

  // FAQs
  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    order: v.number(), // For sorting FAQs in display order
    isPublished: v.boolean(), // Control visibility
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_order", ["order"])
    .index("by_published", ["isPublished", "order"]),
});
