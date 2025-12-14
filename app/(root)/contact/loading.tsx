import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <main className="bg-white pt-[96px] sm:pt-[104px] md:pt-[104px] lg:pt-[112px] xl:pt-[128px]">
      {/* Hello Marquee Skeleton */}
      <div
        className="w-full py-8 bg-white border-t-2 border-b-2 border-black overflow-hidden"
        aria-hidden="true"
      >
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-16 md:h-24 lg:h-32 w-32 md:w-48 lg:w-64 bg-muted" />
          <Skeleton className="h-8 w-8 rounded bg-muted" />
          <Skeleton className="h-16 md:h-24 lg:h-32 w-40 md:w-56 lg:w-72 bg-muted" />
          <Skeleton className="h-8 w-8 rounded bg-muted" />
          <Skeleton className="h-16 md:h-24 lg:h-32 w-28 md:w-40 lg:w-56 bg-muted" />
        </div>
      </div>

      {/* Content Section */}
      <section className="relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left column - Contact info */}
            <div className="space-y-12">
              {/* Header */}
              <div>
                <Skeleton className="h-4 w-20 mb-4 bg-muted" />
                <Skeleton className="h-10 lg:h-12 w-64 mb-6 bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted/80" />
                  <Skeleton className="h-4 w-5/6 bg-muted/80" />
                </div>
              </div>

              {/* Office hours & Direct contact */}
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-32">
                {/* Office hours */}
                <div>
                  <Skeleton className="h-6 w-28 mb-4 bg-muted" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36 bg-muted/80" />
                    <Skeleton className="h-5 w-40 bg-muted" />
                  </div>
                </div>

                {/* Direct contact */}
                <div>
                  <Skeleton className="h-6 w-32 mb-4 bg-muted" />
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-5 w-28 bg-muted/80" />
                    <Skeleton className="h-5 w-40 bg-muted/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Contact form */}
            <div className="lg:pl-8">
              <div className="bg-white space-y-6">
                {/* Name field skeleton */}
                <Skeleton className="h-12 w-full rounded border border-gray-200 bg-muted/60" />

                {/* Email field skeleton */}
                <Skeleton className="h-12 w-full rounded border border-gray-200 bg-muted/60" />

                {/* Message field skeleton */}
                <Skeleton className="h-32 w-full rounded border border-gray-200 bg-muted/60" />

                {/* Checkbox + label skeleton */}
                <div className="flex items-start gap-3">
                  <Skeleton className="w-5 h-5 rounded border border-gray-200 bg-muted/60 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-muted/60" />
                    <Skeleton className="h-4 w-3/4 bg-muted/60" />
                  </div>
                </div>

                {/* Submit button skeleton */}
                <Skeleton className="h-10 w-28 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
