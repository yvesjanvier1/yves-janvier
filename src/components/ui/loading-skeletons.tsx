
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const BlogPostSkeleton = () => (
  <div className="flex flex-col h-full">
    <Skeleton className="h-48 w-full mb-4" />
    <div className="flex gap-2 mb-2">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-6 w-20" />
      ))}
    </div>
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);

export const ProjectSkeleton = () => (
  <div className="flex flex-col h-full">
    <Skeleton className="h-48 w-full mb-4" />
    <Skeleton className="h-4 w-12 mb-2" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const JournalEntrySkeleton = () => (
  <Card className="h-64">
    <CardContent className="p-6">
      <div className="animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
  </Card>
);

export const NowPageSkeleton = () => (
  <div className="space-y-8">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="glass-card border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <div key={itemIndex} className="flex items-start gap-3 p-4 rounded-lg">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
