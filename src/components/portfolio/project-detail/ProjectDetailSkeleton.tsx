import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ProjectDetailSkeleton = () => (
  <div className="container py-16 mx-auto">
    {/* Back button */}
    <Button variant="ghost" className="mb-8" asChild>
      <Link to="/portfolio" className="inline-flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Portfolio
      </Link>
    </Button>

    <Card className="p-6 flex flex-col gap-8">
      {/* Title skeleton */}
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-32" />

      {/* Image gallery skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Links / buttons skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Tech stack skeleton */}
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>

      {/* Description skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/6" />
      </div>
    </Card>
  </div>
);

export default ProjectDetailSkeleton;
