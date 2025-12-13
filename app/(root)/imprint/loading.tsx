import { Skeleton } from "@/components/ui/skeleton";

export default function ImprintLoading() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <header className="mb-16">
          <div className="h-12 md:h-14 lg:h-16 bg-muted rounded w-1/3 mb-6 animate-pulse" />
          <div className="w-20 h-1 bg-primary rounded-full" />
        </header>

        <section className="space-y-12">
          {/* Legal Notice Section */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="p-6 bg-gray-50 dark:bg-zinc-900/30 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-56 mb-1" />
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-52" />
            <div className="border-l-2 border-primary/50 pl-4 py-1">
              <Skeleton className="h-4 w-72" />
            </div>
            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Email Skeleton */}
              <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                <Skeleton className="h-4 w-24 mb-1" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              {/* Phone Skeleton */}
              <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                <Skeleton className="h-4 w-24 mb-1" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Responsible for Content Section */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-56" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Dispute Resolution Section */}
          <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-zinc-800">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </section>
      </div>
    </main>
  );
}
