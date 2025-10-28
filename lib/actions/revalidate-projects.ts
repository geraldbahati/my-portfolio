/**
 * Server Actions for revalidating project cache
 *
 * These actions allow you to invalidate the project cache when
 * projects are added, updated, or deleted in Convex.
 *
 * Usage:
 * - Call revalidateProjects() after any project mutation
 * - Call updateProjects() for immediate cache refresh (e.g., in admin UI)
 */

"use server";

import { revalidateTag, updateTag } from "next/cache";

/**
 * Revalidate project cache with stale-while-revalidate behavior
 *
 * This marks the cache as stale but continues serving cached content
 * while revalidating in the background. Ideal for user-facing updates.
 *
 * Use case: After publishing/unpublishing a project
 */
export async function revalidateProjects() {
  try {
    // Revalidate all project-related caches
    revalidateTag("projects", "max");
    return { success: true, message: "Project cache revalidated" };
  } catch (error) {
    console.error("Error revalidating projects:", error);
    return { success: false, message: "Failed to revalidate project cache" };
  }
}

/**
 * Immediately update project cache
 *
 * This expires the cache immediately and forces a fresh fetch on the next request.
 * Use when you need instant updates (e.g., admin dashboard, critical updates).
 *
 * Use case: After creating/updating/deleting a project in admin panel
 */
export async function updateProjects() {
  try {
    // Immediately expire project caches
    updateTag("projects");
    return { success: true, message: "Project cache updated" };
  } catch (error) {
    console.error("Error updating projects:", error);
    return { success: false, message: "Failed to update project cache" };
  }
}

/**
 * Revalidate a specific project by ID
 *
 * Use this for more granular cache invalidation when only one project changes.
 */
export async function revalidateProject(projectId: string) {
  try {
    revalidateTag(`project-${projectId}`, "max");
    // Also revalidate the main list since order/count may have changed
    revalidateTag("projects", "max");
    return { success: true, message: `Project ${projectId} cache revalidated` };
  } catch (error) {
    console.error(`Error revalidating project ${projectId}:`, error);
    return {
      success: false,
      message: `Failed to revalidate project ${projectId}`,
    };
  }
}

/**
 * Immediately update a specific project by ID
 */
export async function updateProject(projectId: string) {
  try {
    updateTag(`project-${projectId}`);
    // Also update the main list
    updateTag("projects");
    return { success: true, message: `Project ${projectId} cache updated` };
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
    return { success: false, message: `Failed to update project ${projectId}` };
  }
}
