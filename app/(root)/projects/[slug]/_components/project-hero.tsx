import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { AdaptiveLink } from "@/components/AdaptiveLink";

interface ProjectHeroProps {
  project: Doc<"projects">;
  details: Doc<"projectDetails"> | null;
}

export function ProjectHero({ project, details }: ProjectHeroProps) {
  const heroImageSrc = details?.heroImage;
  const title = project.title;

  return (
    <section className="relative w-full pt-32 bg-background max-w-6xl mx-auto px-4 md:px-6">
      <div className="container relative z-10">
        {/* Header Content */}
        <div className="max-w-4xl mb-8 md:mb-12">
          {/* Title - Uses CSS animation for fade-in slide-up */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4 text-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
            {title}
          </h1>

          {/* Breadcrumbs - Delayed animation */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-700 delay-200 ease-out">
            <AdaptiveLink
              href="/projects"
              className="hover:text-foreground transition-colors"
              prefetchOnViewport={false}
            >
              Projects
            </AdaptiveLink>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">{title}</span>
          </div>
        </div>

        {/* Boxed Hero Image - Uses CSS animation for scale-up fade-in */}
        {heroImageSrc && (
          <div className="w-full relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[2.35/1] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-300 ease-out">
            <Image
              src={heroImageSrc}
              alt={title}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
          </div>
        )}
      </div>
    </section>
  );
}
