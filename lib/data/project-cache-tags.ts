export const PROJECTS_CACHE_TAG = "projects";
export const PROJECT_NAVIGATION_CACHE_TAG = "project-navigation";

export function getProjectCacheTag(projectSlug: string): string {
  return `project-${projectSlug}`;
}
