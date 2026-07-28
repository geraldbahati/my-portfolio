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
import { connection } from "next/server";
import DeferredCombinedProjectsFaq from "./deferred-combined-projects-faq";
import { getCachedProjects } from "@/lib/data/projects";

/**
 * Projects Content - Fetches and passes data to client component
 *
 * Convex access starts only after a request arrives, while getCachedProjects
 * retains the shared data cache for fast subsequent responses.
 */
async function ProjectsFaqContent() {
  await connection();

  const projects = await getCachedProjects();
  return <DeferredCombinedProjectsFaq projects={projects} />;
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
