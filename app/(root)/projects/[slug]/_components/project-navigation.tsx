import { ArrowLeft, ArrowRight } from "lucide-react";
import { AdaptiveLink } from "@/components/AdaptiveLink";

interface ProjectNavigationProps {
  previousProject: {
    id: string;
    title: string;
  } | null;
  nextProject: {
    id: string;
    title: string;
  } | null;
}

export function ProjectNavigation({
  previousProject,
  nextProject,
}: ProjectNavigationProps) {
  // Don't render if no navigation is available
  if (!previousProject && !nextProject) {
    return null;
  }

  return (
    <section className="border-t border-border/40 bg-background w-full">
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-stretch py-12 gap-8">
          {/* Previous Project Link */}
          <div className="flex-1">
            {previousProject ? (
              <AdaptiveLink
                href={`/projects/${previousProject.id}`}
                className="group flex flex-col items-start gap-2 text-muted-foreground hover:text-foreground transition-colors h-full animate-in fade-in slide-in-from-left-4 duration-500"
                prefetchOnViewport
                prefetchRootMargin="150px"
                prefetchDelayMs={1200}
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Previous Project
                </span>
                <span className="text-xl font-semibold text-foreground line-clamp-2">
                  {previousProject.title}
                </span>
              </AdaptiveLink>
            ) : (
              <AdaptiveLink
                href="/projects"
                className="group flex flex-col items-start gap-2 text-muted-foreground hover:text-foreground transition-colors h-full animate-in fade-in slide-in-from-left-4 duration-500"
                prefetchOnViewport
                prefetchRootMargin="150px"
                prefetchDelayMs={1200}
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  All Projects
                </span>
                <span className="text-xl font-semibold text-foreground">
                  Back to Overview
                </span>
              </AdaptiveLink>
            )}
          </div>

          {/* Next Project Link */}
          <div className="flex-1 flex justify-end">
            {nextProject ? (
              <AdaptiveLink
                href={`/projects/${nextProject.id}`}
                className="group flex flex-col items-end gap-2 text-muted-foreground hover:text-foreground transition-colors text-right h-full animate-in fade-in slide-in-from-right-4 duration-500"
                prefetchOnViewport
                prefetchRootMargin="150px"
                prefetchDelayMs={1200}
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  Next Project
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-xl font-semibold text-foreground line-clamp-2">
                  {nextProject.title}
                </span>
              </AdaptiveLink>
            ) : (
              <AdaptiveLink
                href="/projects"
                className="group flex flex-col items-end gap-2 text-muted-foreground hover:text-foreground transition-colors text-right h-full animate-in fade-in slide-in-from-right-4 duration-500"
                prefetchOnViewport
                prefetchRootMargin="150px"
                prefetchDelayMs={1200}
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  All Projects
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-xl font-semibold text-foreground">
                  Back to Overview
                </span>
              </AdaptiveLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
