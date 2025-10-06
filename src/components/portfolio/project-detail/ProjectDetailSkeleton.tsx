
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ProjectDetailSkeleton = () => (
  <div className="container py-16 mx-auto">
    <Button variant="ghost" className="mb-6" asChild>
      <Link to="/portfolio">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Portfolio
      </Link>
    </Button>
    
    <Card className="p-6">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-6 w-32 mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
      
      <Skeleton className="h-8 w-48 mb-3" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/6" />
      </div>
    </Card>
  </div>
);

export default ProjectDetailSkeleton;
