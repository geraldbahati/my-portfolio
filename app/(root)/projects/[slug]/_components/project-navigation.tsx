import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
              <Link
                href={`/projects/${previousProject.id}`}
                className="group flex flex-col items-start gap-2 text-muted-foreground hover:text-foreground transition-colors h-full animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Vorheriges Projekt
                </span>
                <span className="text-xl font-semibold text-foreground line-clamp-2">
                  {previousProject.title}
                </span>
              </Link>
            ) : (
              <Link
                href="/projects"
                className="group flex flex-col items-start gap-2 text-muted-foreground hover:text-foreground transition-colors h-full animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Alle Projekte
                </span>
                <span className="text-xl font-semibold text-foreground">
                  Zurück zur Übersicht
                </span>
              </Link>
            )}
          </div>

          {/* Next Project Link */}
          <div className="flex-1 flex justify-end">
            {nextProject ? (
              <Link
                href={`/projects/${nextProject.id}`}
                className="group flex flex-col items-end gap-2 text-muted-foreground hover:text-foreground transition-colors text-right h-full animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  Nächstes Projekt
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-xl font-semibold text-foreground line-clamp-2">
                  {nextProject.title}
                </span>
              </Link>
            ) : (
              <Link
                href="/projects"
                className="group flex flex-col items-end gap-2 text-muted-foreground hover:text-foreground transition-colors text-right h-full animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                  Alle Projekte
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-xl font-semibold text-foreground">
                  Zurück zur Übersicht
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
