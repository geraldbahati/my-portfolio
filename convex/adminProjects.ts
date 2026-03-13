/**
 * Admin wrapper functions for projects management
 *
 * SECURITY: These functions are for LOCAL DEVELOPMENT ONLY
 * They check for development mode before allowing any operations
 * DO NOT commit this file to version control
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";

/**
 * Get all projects (including unpublished) as a query - for real-time updates
 */
export const getAllProjectsQuery = query({
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
    await requireAdmin(ctx);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_order")
      .order("asc")
      .collect();

    return projects;
  },
});

/**
 * Create a new project - DEV ONLY
 */
export const createProject = action({
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
  handler: async (ctx, args): Promise<Id<"projects">> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.createProject, args);
  },
});

/**
 * Update an existing project - DEV ONLY
 */
export const updateProject = action({
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
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.updateProject, args);
  },
});

/**
 * Delete a project - DEV ONLY
 * Also cleans up associated media from Cloudflare Stream and R2
 */
export const deleteProject = action({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);

    // Get project data first to extract media URLs
    const project = await ctx.runQuery(internal.projects.getProjectByDocId, {
      projectId: args.projectId,
    });

    if (project) {
      // Clean up video from Stream if it's a Stream URL
      if (project.src && isStreamUrl(project.src)) {
        const streamUid = extractStreamUid(project.src);
        if (streamUid) {
          try {
            await ctx.runAction(internal.stream.deleteVideoInternal, {
              uid: streamUid,
            });
            console.log(`[Delete] Removed video from Stream: ${streamUid}`);
          } catch (error) {
            console.warn(`[Delete] Failed to delete Stream video: ${error}`);
          }
        }
      }
      // Clean up video from R2 if it's an R2 URL
      else if (project.src && isR2MediaUrl(project.src)) {
        const key = extractR2Key(project.src);
        if (key) {
          try {
            await ctx.runAction(internal.r2.deleteObjectInternal, { key });
            console.log(`[Delete] Removed video from R2: ${key}`);
          } catch (error) {
            console.warn(`[Delete] Failed to delete R2 video: ${error}`);
          }
        }
      }

      // Clean up poster image from R2 if it exists
      if (project.poster && isR2MediaUrl(project.poster)) {
        const posterKey = extractR2Key(project.poster);
        if (posterKey) {
          try {
            await ctx.runAction(internal.r2.deleteObjectInternal, {
              key: posterKey,
            });
            console.log(`[Delete] Removed poster from R2: ${posterKey}`);
          } catch (error) {
            console.warn(`[Delete] Failed to delete R2 poster: ${error}`);
          }
        }
      }
    }

    // Delete the project from database
    return await ctx.runMutation(internal.projects.deleteProject, args);
  },
});

/**
 * Safely check if a URL's hostname matches or is a subdomain of a given domain.
 */
function hostnameEndsWith(url: string, domain: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === domain || hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

function isStreamUrl(url: string): boolean {
  return hostnameEndsWith(url, "cloudflarestream.com");
}

function isR2MediaUrl(url: string): boolean {
  return hostnameEndsWith(url, "media.geraldbahati.dev");
}

/**
 * Extract Stream video UID from URL
 */
function extractStreamUid(url: string): string | null {
  // Format: https://customer-xxx.cloudflarestream.com/{uid}/...
  const match = url.match(/cloudflarestream\.com\/([a-f0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Extract R2 key from media URL
 */
function extractR2Key(url: string): string | null {
  // Format: https://media.geraldbahati.dev/{key}
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // Remove leading /
  } catch {
    return null;
  }
}

/**
 * Reorder projects - DEV ONLY
 */
export const reorderProjects = action({
  args: {
    projectOrders: v.array(
      v.object({
        projectId: v.id("projects"),
        order: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(internal.projects.reorderProjects, args);
  },
});
