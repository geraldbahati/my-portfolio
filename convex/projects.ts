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

// =============================================================================
// Full Project Details (Aggregated Query)
// =============================================================================

// Validators for related tables
const colorPaletteValidator = v.array(
  v.object({
    hex: v.string(),
    name: v.optional(v.string()),
  }),
);

const deviceTypeValidator = v.optional(
  v.union(
    v.literal("desktop"),
    v.literal("mobile"),
    v.literal("tablet"),
    v.literal("full-width"),
  ),
);

/**
 * Get a complete project with all related detail data
 * This is the main query for the project detail page
 */
export const getFullProjectDetails = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.union(
    v.object({
      // Base project data
      project: v.object({
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

      // Project details (1:1)
      details: v.union(
        v.object({
          _id: v.id("projectDetails"),
          _creationTime: v.number(),
          projectId: v.id("projects"),
          heroImage: v.optional(v.string()),
          heroAlt: v.optional(v.string()),
          tagline: v.optional(v.string()),
          fullDescription: v.optional(v.string()),
          services: v.optional(v.array(v.string())),
          client: v.optional(v.string()),
          industry: v.optional(v.string()),
          period: v.optional(v.string()),
          year: v.optional(v.number()),
          features: v.optional(v.array(v.string())),
          colorPalette: v.optional(colorPaletteValidator),
          relatedProjectIds: v.optional(v.array(v.string())),
          createdAt: v.number(),
          updatedAt: v.number(),
        }),
        v.null(),
      ),

      // Metrics (1:N)
      metrics: v.array(
        v.object({
          _id: v.id("projectMetrics"),
          _creationTime: v.number(),
          projectId: v.id("projects"),
          value: v.string(),
          label: v.string(),
          icon: v.optional(v.string()),
          order: v.number(),
          createdAt: v.number(),
          updatedAt: v.number(),
        }),
      ),

      // Testimonial (1:1)
      testimonial: v.union(
        v.object({
          _id: v.id("projectTestimonials"),
          _creationTime: v.number(),
          projectId: v.id("projects"),
          quote: v.string(),
          authorName: v.string(),
          authorRole: v.optional(v.string()),
          authorCompany: v.optional(v.string()),
          authorImage: v.optional(v.string()),
          createdAt: v.number(),
          updatedAt: v.number(),
        }),
        v.null(),
      ),

      // Gallery (1:N)
      gallery: v.array(
        v.object({
          _id: v.id("projectGallery"),
          _creationTime: v.number(),
          projectId: v.id("projects"),
          src: v.string(),
          alt: v.optional(v.string()),
          caption: v.optional(v.string()),
          deviceType: deviceTypeValidator,
          order: v.number(),
          createdAt: v.number(),
          updatedAt: v.number(),
        }),
      ),

      // Challenges (1:N)
      challenges: v.array(
        v.object({
          _id: v.id("projectChallenges"),
          _creationTime: v.number(),
          projectId: v.id("projects"),
          title: v.string(),
          content: v.string(),
          order: v.number(),
          createdAt: v.number(),
          updatedAt: v.number(),
        }),
      ),

      // Related projects (resolved)
      relatedProjects: v.array(
        v.object({
          _id: v.id("projects"),
          id: v.string(),
          title: v.string(),
          description: v.optional(v.string()),
          poster: v.optional(v.string()),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Find the project by slug
    const project = await ctx.db
      .query("projects")
      .withIndex("by_project_id", (q) => q.eq("id", args.projectSlug))
      .unique();

    if (!project) {
      return null;
    }

    // Fetch all related data in parallel for performance
    const [details, metrics, testimonial, gallery, challenges] =
      await Promise.all([
        // Project details (1:1)
        ctx.db
          .query("projectDetails")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .unique(),

        // Metrics (1:N)
        ctx.db
          .query("projectMetrics")
          .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
          .collect(),

        // Testimonial (1:1)
        ctx.db
          .query("projectTestimonials")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .unique(),

        // Gallery (1:N)
        ctx.db
          .query("projectGallery")
          .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
          .collect(),

        // Challenges (1:N)
        ctx.db
          .query("projectChallenges")
          .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
          .collect(),
      ]);

    // Resolve related projects if they exist
    let relatedProjects: {
      _id: typeof project._id;
      id: string;
      title: string;
      description?: string;
      poster?: string;
    }[] = [];

    if (details?.relatedProjectIds && details.relatedProjectIds.length > 0) {
      const allProjects = await ctx.db
        .query("projects")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .collect();

      relatedProjects = allProjects
        .filter((p) => details.relatedProjectIds!.includes(p.id))
        .map((p) => ({
          _id: p._id,
          id: p.id,
          title: p.title,
          description: p.description,
          poster: p.poster,
        }));
    }

    return {
      project,
      details,
      metrics: metrics.sort((a, b) => a.order - b.order),
      testimonial,
      gallery: gallery.sort((a, b) => a.order - b.order),
      challenges: challenges.sort((a, b) => a.order - b.order),
      relatedProjects,
    };
  },
});

/**
 * Get navigation data for a project (previous and next projects)
 * Used for project detail page navigation
 */
export const getProjectNavigation = query({
  args: {
    projectSlug: v.string(),
  },
  returns: v.union(
    v.object({
      currentProject: v.object({
        id: v.string(),
        title: v.string(),
      }),
      previousProject: v.union(
        v.object({
          id: v.string(),
          title: v.string(),
        }),
        v.null(),
      ),
      nextProject: v.union(
        v.object({
          id: v.string(),
          title: v.string(),
        }),
        v.null(),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get all published projects ordered by display order
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Sort by order
    const sortedProjects = projects.sort((a, b) => a.order - b.order);

    // Find current project index
    const currentIndex = sortedProjects.findIndex(
      (p) => p.id === args.projectSlug,
    );

    if (currentIndex === -1) {
      return null;
    }

    const current = sortedProjects[currentIndex];
    const previous = currentIndex > 0 ? sortedProjects[currentIndex - 1] : null;
    const next =
      currentIndex < sortedProjects.length - 1
        ? sortedProjects[currentIndex + 1]
        : null;

    return {
      currentProject: {
        id: current.id,
        title: current.title,
      },
      previousProject: previous
        ? {
            id: previous.id,
            title: previous.title,
          }
        : null,
      nextProject: next
        ? {
            id: next.id,
            title: next.title,
          }
        : null,
    };
  },
});

/**
 * Check if a project has detail data
 */
export const hasProjectDetails = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.object({
    hasDetails: v.boolean(),
    hasMetrics: v.boolean(),
    hasTestimonial: v.boolean(),
    hasGallery: v.boolean(),
    hasChallenges: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const [details, metrics, testimonial, gallery, challenges] =
      await Promise.all([
        ctx.db
          .query("projectDetails")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .unique(),
        ctx.db
          .query("projectMetrics")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .first(),
        ctx.db
          .query("projectTestimonials")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .unique(),
        ctx.db
          .query("projectGallery")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .first(),
        ctx.db
          .query("projectChallenges")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .first(),
      ]);

    return {
      hasDetails: details !== null,
      hasMetrics: metrics !== null,
      hasTestimonial: testimonial !== null,
      hasGallery: gallery !== null,
      hasChallenges: challenges !== null,
    };
  },
});
