"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/data/projects";

interface DeferredCombinedProjectsFaqProps {
  projects: Project[];
}

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

const CombinedProjectsFaqSection = dynamic(
  () =>
    import("./combined-projects-faq").then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <ProjectsFaqSkeleton />,
  },
);

export default function DeferredCombinedProjectsFaq({
  projects,
}: DeferredCombinedProjectsFaqProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || shouldRender) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={sentinelRef}>
      {shouldRender ? (
        <CombinedProjectsFaqSection projects={projects} />
      ) : (
        <ProjectsFaqSkeleton />
      )}
    </div>
  );
}
