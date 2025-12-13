export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background animate-pulse">
      {/* Hero Skeleton */}
      <div className="pt-32 container">
        <div className="max-w-4xl mb-8 md:mb-12 space-y-4">
          <div className="h-12 w-2/3 bg-muted rounded" />
          <div className="h-4 w-1/4 bg-muted rounded" />
        </div>
        <div className="h-[40vh] bg-muted w-full rounded-2xl" />
      </div>

      {/* Info Section Skeleton */}
      <div className="container py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-7 space-y-8">
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
            <div className="pt-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-1/2 bg-muted rounded" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="w-full h-24 bg-muted rounded-sm" />
                <div className="mt-2 h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenges Skeleton */}
      <div className="py-24 container max-w-4xl mx-auto">
        <div className="h-8 w-2/3 bg-muted rounded mb-8" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>

      {/* Gallery Skeleton */}
      <div className="py-24 container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-6 h-[600px] bg-muted rounded-sm" />
          <div className="lg:col-span-6 space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className="py-20 border-t border-border/40">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full max-w-[250px] aspect-square bg-muted rounded-full" />
                <div className="mt-6 h-4 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
