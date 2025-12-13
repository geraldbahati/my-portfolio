import { Skeleton } from "@/components/ui/skeleton";

export function ProjectDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="relative w-full pt-32 bg-background max-w-6xl mx-auto px-4 md:px-6">
        <div className="container relative z-10">
          {/* Header Content */}
          <div className="max-w-4xl mb-8 md:mb-12">
            {/* Title */}
            <Skeleton className="h-12 md:h-14 lg:h-16 w-2/3 mb-4" />
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Hero Image */}
          <Skeleton className="w-full rounded-2xl aspect-[21/9] md:aspect-[2.35/1]" />
        </div>
      </section>

      {/* Info Section Skeleton */}
      <section className="py-20 md:py-24 bg-background max-w-6xl mx-auto px-4 md:px-6">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Main Content (Left) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Headline */}
              <Skeleton className="h-8 md:h-10 lg:h-12 w-3/4" />

              {/* Description paragraphs */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Metadata */}
              <div className="pt-8 space-y-4">
                {/* Customer */}
                <div className="flex gap-2 items-baseline">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                {/* Period */}
                <div className="flex gap-2 items-baseline">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
                {/* Performance tags */}
                <div className="space-y-3 pt-2">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-7 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
                {/* Features tags */}
                <div className="space-y-3 pt-2">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-7 w-24 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Palette (Right) */}
            <div className="lg:col-span-4 lg:col-start-9 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="w-full h-24 rounded-sm" />
                  <Skeleton className="mt-2 h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section Skeleton */}
      <section className="py-24 bg-background">
        <div className="container max-w-4xl mx-auto px-4 md:px-6">
          {/* SVG Line Separator placeholder */}
          <div className="mb-12">
            <Skeleton className="h-px w-full opacity-40" />
          </div>

          {/* Challenge content */}
          <div className="space-y-8">
            <Skeleton className="h-8 md:h-10 w-2/3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section Skeleton */}
      <section className="bg-muted py-24">
        <div className="container overflow-hidden max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Feature image */}
            <div className="lg:col-span-6">
              <Skeleton className="w-full aspect-[3/4] rounded-sm" />
            </div>

            {/* Right Column: Stack of mockups */}
            <div className="lg:col-span-6 space-y-8 lg:space-y-12">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full aspect-video rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Section Skeleton */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-2">
          <div className="relative">
            <Skeleton className="w-full aspect-video rounded-lg" />
          </div>
        </div>
      </section>

      {/* Metrics Section Skeleton */}
      <section className="py-20 bg-muted border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto px-4 md:px-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {/* Radial chart placeholder */}
                <Skeleton className="w-full max-w-[200px] aspect-square rounded-full" />
                {/* Label */}
                <Skeleton className="mt-4 h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section Skeleton */}
      <section className="bg-background">
        <div className="container py-24 md:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Quote icon placeholder */}
              <Skeleton className="w-[60px] h-[60px] rounded shrink-0" />

              <div className="space-y-8 flex-1">
                {/* Quote text */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>

                {/* Author details */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>

            {/* Separator line */}
            <Skeleton className="mt-20 h-px w-full opacity-30" />
          </div>
        </div>
      </section>
    </main>
  );
}
