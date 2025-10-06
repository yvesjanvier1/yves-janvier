
export const ProjectSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
