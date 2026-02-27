/**
 * Combined Projects FAQ Wrapper - Server Component
 *
 * This is a server component wrapper that fetches projects data
 * with caching and passes it to the client component.
 *
 * Architecture:
 * - This component: Server component that fetches cached data
 * - CombinedProjectsFaqSection: Client component that handles UI interactions
 */

import { Suspense } from "react";
import CombinedProjectsFaqSection from "./combined-projects-faq";
import { getCachedProjects } from "@/lib/data/projects";

/**
 * Projects Content - Fetches and passes data to client component
 *
 * No "use cache" here — caching is handled by:
 * 1. getCachedProjects() which caches the Convex query for days
 * 2. The parent Home page which caches the full render for hours
 * Adding a third cache layer here previously caused stale empty data
 * to persist for days when the build-time fetch failed.
 */
async function ProjectsFaqContent() {
  const projects = await getCachedProjects();
  return <CombinedProjectsFaqSection projects={projects} />;
}

/**
 * Loading fallback for projects section
 */
function ProjectsFaqSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-lg text-muted-foreground">
          Loading projects...
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component with Suspense boundary
 */
export default function CombinedProjectsFaqWrapper() {
  return (
    <Suspense fallback={<ProjectsFaqSkeleton />}>
      <ProjectsFaqContent />
    </Suspense>
  );
}
