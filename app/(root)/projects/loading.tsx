import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Page Header Skeleton */}
      <header className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 md:pt-24 lg:pt-32 pb-12">
        {/* Title Skeleton */}
        <Skeleton className="h-10 lg:h-14 w-48 mb-6" />

        {/* Description Skeleton */}
        <div className="max-w-3xl space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </header>

      {/* Separator Line */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <hr className="border-border mb-12" />
      </div>

      {/* Projects Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              {/* Project Card Image */}
              <Skeleton className="aspect-video w-full rounded-lg" />

              {/* Project Card Title */}
              <Skeleton className="h-5 w-3/4" />

              {/* Project Card Badges */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
