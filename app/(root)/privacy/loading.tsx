export default function PrivacyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Content Skeleton - Add top padding to account for fixed navbar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 sm:p-12 animate-pulse">
          {/* Title skeleton */}
          <div className="h-10 bg-muted rounded w-1/3 mb-8" />

          {/* Last updated skeleton */}
          <div className="h-4 bg-muted rounded w-1/4 mb-12" />

          {/* Content sections skeleton */}
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/5" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button Skeleton */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  );
}
