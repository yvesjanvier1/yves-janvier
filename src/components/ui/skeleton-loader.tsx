
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonLoader = ({ className }: SkeletonLoaderProps) => {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-gray-100 via-primary/10 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-primary/20 dark:to-gray-800 rounded-lg",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading..."
    />
  );
};

export const BlogCardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden border shadow-sm" role="status" aria-busy="true">
      <SkeletonLoader className="aspect-video w-full" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <SkeletonLoader className="h-6 w-16 rounded-full" />
          <SkeletonLoader className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-2/3" />
        <SkeletonLoader className="h-4 w-24" />
      </div>
    </div>
  );
};

export const ProjectCardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden border shadow-sm" role="status" aria-busy="true">
      <SkeletonLoader className="aspect-video w-full" />
      <div className="p-5 space-y-3">
        <SkeletonLoader className="h-6 w-3/4" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-5/6" />
        <div className="flex gap-2 mt-4">
          <SkeletonLoader className="h-6 w-16 rounded-full" />
          <SkeletonLoader className="h-6 w-20 rounded-full" />
          <SkeletonLoader className="h-6 w-18 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const JournalEntrySkeleton = () => {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-3" role="status" aria-busy="true">
      <div className="flex items-center gap-3">
        <SkeletonLoader className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-5 w-2/3" />
          <SkeletonLoader className="h-4 w-1/3" />
        </div>
      </div>
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-4/5" />
      <SkeletonLoader className="h-4 w-3/5" />
    </div>
  );
};
