/**
 * Fallback project data for the projects page.
 *
 * Projects are fetched from the Convex database at runtime.
 * This file provides the type definition and an empty fallback
 * in case the database is unreachable.
 */

export interface Project {
  id: string;
  title: string;
  description?: string;
  src: string; // video/gif url (prefer mp4 for performance)
  type: "video" | "gif";
  poster?: string;
  alt?: string;
  url?: string; // Live project URL
  badges?: {
    text: string;
    position?: "bottom-left" | "bottom-right";
  }[];
  aspectRatio?: string | number;
}

export const projects: Project[] = [];
