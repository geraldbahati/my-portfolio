import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen bg-hero-bg overflow-hidden">
        {/* Profile Image Placeholder */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <Skeleton className="w-full h-full bg-muted/10" />
        </div>

        {/* Hero Content Skeleton */}
        <div className="relative z-10 min-h-screen flex items-end justify-center lg:justify-end px-4 sm:px-6 lg:px-8 sm:pb-12 pb-16">
          <div className="w-full max-w-7xl mx-auto text-center lg:text-left">
            {/* Name Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-4 w-32 mx-auto lg:mx-0 bg-primary/20" />
            </div>

            {/* Title Skeleton */}
            <div className="mb-8 sm:mb-10 lg:mb-12 space-y-2">
              <Skeleton className="h-12 sm:h-16 md:h-20 lg:h-24 w-full max-w-3xl mx-auto lg:mx-0 bg-muted/20" />
            </div>

            {/* Description and CTA Skeleton */}
            <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-between gap-6 sm:gap-8">
              <div className="max-w-xl lg:max-w-2xl space-y-2">
                <Skeleton className="h-4 w-full bg-muted/15" />
                <Skeleton className="h-4 w-3/4 bg-muted/15" />
              </div>
              <Skeleton className="h-6 w-40 bg-muted/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section Skeleton (simulating the overlay) */}
      <section className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <Skeleton className="h-6 w-24 bg-muted" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-muted" />
                <Skeleton className="h-10 w-3/4 bg-muted" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-muted/80" />
                <Skeleton className="h-4 w-full bg-muted/80" />
                <Skeleton className="h-4 w-5/6 bg-muted/80" />
              </div>
            </div>
            {/* Right Column - Image */}
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full">
              <Skeleton className="w-full h-full min-h-[400px] rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider Skeleton - Services */}
      <section className="relative bg-white py-16 sm:py-20 lg:py-24">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-36 bg-muted" />
              <Skeleton className="h-4 w-8 bg-muted" />
            </div>
            <Skeleton className="h-[1px] w-full bg-muted" />
          </div>
        </div>
      </section>

      {/* Info Section Skeleton - Sticky Scroll Content */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Service Cards Skeleton */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-24"
            >
              <div className="space-y-6">
                <Skeleton className="h-4 w-20 bg-muted" />
                <Skeleton className="h-10 w-48 bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted/80" />
                  <Skeleton className="h-4 w-5/6 bg-muted/80" />
                </div>
                <div className="space-y-2 pt-4">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-3/4 bg-muted/60" />
                  ))}
                </div>
              </div>
              <Skeleton className="aspect-video lg:aspect-square rounded-lg bg-muted" />
            </div>
          ))}

          {/* Closing Paragraph Skeleton */}
          <div className="min-h-[30vh] flex items-center justify-center">
            <div className="max-w-4xl mx-auto space-y-4">
              <Skeleton className="h-8 md:h-10 lg:h-12 w-full bg-muted" />
              <Skeleton className="h-8 md:h-10 lg:h-12 w-5/6 bg-muted" />
              <Skeleton className="h-8 md:h-10 lg:h-12 w-4/5 bg-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider Skeleton - Projects */}
      <section className="relative bg-white py-16">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-40 bg-muted" />
              <Skeleton className="h-4 w-8 bg-muted" />
            </div>
            <Skeleton className="h-[1px] w-full bg-muted" />
          </div>
        </div>
      </section>

      {/* Projects Section Skeleton */}
      <section className="bg-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-lg bg-muted/20" />
                <Skeleton className="h-6 w-3/4 bg-muted/20" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full bg-muted/15" />
                  <Skeleton className="h-6 w-20 rounded-full bg-muted/15" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section Skeleton */}
      <section className="bg-black py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-8 bg-muted/20" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-muted/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-3/4 bg-muted/20" />
                  <Skeleton className="h-5 w-5 rounded bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section Skeleton */}
      <section className="h-[60vh] bg-black relative flex items-center justify-center p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-12 sm:h-16 md:h-20 w-48 sm:w-64 md:w-80 bg-muted/20" />
            <Skeleton className="h-12 sm:h-16 md:h-20 w-48 sm:w-64 md:w-80 bg-muted/20" />
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded bg-muted/20" />
          </div>
        </div>
      </section>
    </>
  );
}
