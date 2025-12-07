import { Skeleton } from "@/components/ui/skeleton";

export function ContactSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Email Skeleton */}
      <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800">
        <Skeleton className="h-4 w-24 mb-1" /> {/* Label */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" /> {/* Value */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Copy Button */}
        </div>
      </div>

      {/* Phone Skeleton */}
      <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-100 dark:border-zinc-800">
        <Skeleton className="h-4 w-24 mb-1" /> {/* Label */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" /> {/* Value */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Copy Button */}
        </div>
      </div>
    </div>
  );
}
