import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// SCHEMA DEFINITION
// =============================================================================
// This schema defines all tables for the portfolio application.
// Tables are organized by feature area with clear relationships.

export default defineSchema({
  // ---------------------------------------------------------------------------
  // Core Tables
  // ---------------------------------------------------------------------------

  numbers: defineTable({
    value: v.number(),
  }),

  // ---------------------------------------------------------------------------
  // Contact Form
  // ---------------------------------------------------------------------------

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    emailId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
    ),
    submittedAt: v.number(),
    clientIP: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),

  // ---------------------------------------------------------------------------
  // Projects (Main Table)
  // ---------------------------------------------------------------------------

  projects: defineTable({
    id: v.string(), // Unique slug (e.g., "rapid-gmbh")
    title: v.string(),
    description: v.optional(v.string()),
    src: v.string(), // Video/gif URL
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
  })
    .index("by_order", ["order"])
    .index("by_published", ["isPublished", "order"])
    .index("by_project_id", ["id"]),

  // ---------------------------------------------------------------------------
  // Project Details (1:1 with projects)
  // Core metadata, hero section, and color palette
  // ---------------------------------------------------------------------------

  projectDetails: defineTable({
    projectId: v.id("projects"),

    // Hero Section
    heroImage: v.optional(v.string()),
    heroAlt: v.optional(v.string()),

    // Metadata
    tagline: v.optional(v.string()), // e.g., "Advertising for a people-centered business world"
    fullDescription: v.optional(v.string()), // Markdown content
    services: v.optional(v.array(v.string())), // e.g., ["Web Design", "Recruiting"]
    client: v.optional(v.string()), // e.g., "Marketing & Sales"
    industry: v.optional(v.string()), // e.g., "Technology", "Healthcare"
    period: v.optional(v.string()), // e.g., "6 months"
    year: v.optional(v.number()), // e.g., 2024
    features: v.optional(v.array(v.string())), // e.g., ["Multi-Channel Campaign"]

    // Video Section (autoplay on viewport entry)
    videoUrl: v.optional(v.string()), // e.g., "/path/to/video.webm"
    videoPoster: v.optional(v.string()), // Poster image URL
    videoAlt: v.optional(v.string()), // Accessibility description

    // Color Palette
    colorPalette: v.optional(
      v.array(
        v.object({
          hex: v.string(),
          name: v.optional(v.string()),
        }),
      ),
    ),

    // Related Projects
    relatedProjectIds: v.optional(v.array(v.string())),

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ---------------------------------------------------------------------------
  // Project Metrics (1:N with projects)
  // KPI/results statistics
  // ---------------------------------------------------------------------------

  projectMetrics: defineTable({
    projectId: v.id("projects"),
    value: v.string(), // e.g., "53 €", "87 %", "Ø40"
    label: v.string(), // e.g., "Cost per application"
    icon: v.optional(v.string()), // Icon identifier
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_order", ["projectId", "order"]),

  // ---------------------------------------------------------------------------
  // Project Testimonials (1:1 with projects)
  // Client quotes and endorsements
  // ---------------------------------------------------------------------------

  projectTestimonials: defineTable({
    projectId: v.id("projects"),
    quote: v.string(),
    authorName: v.string(), // e.g., "Klaus Hering"
    authorRole: v.optional(v.string()), // e.g., "Sales Management"
    authorCompany: v.optional(v.string()), // e.g., "Rapid GmbH"
    authorImage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ---------------------------------------------------------------------------
  // Project Gallery (1:N with projects)
  // Screenshots, mockups, and visual assets
  // ---------------------------------------------------------------------------

  projectGallery: defineTable({
    projectId: v.id("projects"),
    src: v.string(),
    alt: v.optional(v.string()),
    caption: v.optional(v.string()),
    // Gallery type: "feature" for left column hero image, "stack" for right column images
    galleryType: v.union(v.literal("feature"), v.literal("stack")),
    // Image dimensions for Next.js Image component
    width: v.number(),
    height: v.number(),
    deviceType: v.optional(
      v.union(
        v.literal("desktop"),
        v.literal("mobile"),
        v.literal("tablet"),
        v.literal("full-width"),
      ),
    ),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_order", ["projectId", "order"])
    .index("by_project_type", ["projectId", "galleryType"]),

  // ---------------------------------------------------------------------------
  // Project Challenges (1:N with projects)
  // Problem/solution narrative sections
  // ---------------------------------------------------------------------------

  projectChallenges: defineTable({
    projectId: v.id("projects"),
    title: v.string(), // e.g., "Customer challenges and wishes"
    content: v.string(), // Markdown content
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_order", ["projectId", "order"]),

  // ---------------------------------------------------------------------------
  // FAQs
  // ---------------------------------------------------------------------------

  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_published", ["isPublished", "order"]),
});
