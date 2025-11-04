
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioProject } from "@/hooks/usePortfolioProjects";
import ProjectDetailSkeleton from "@/components/portfolio/project-detail/ProjectDetailSkeleton";
import ProjectError from "@/components/portfolio/project-detail/ProjectError";
import ProjectNotFound from "@/components/portfolio/project-detail/ProjectNotFound";
import ProjectDetail from "@/components/portfolio/project-detail/ProjectDetail";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = usePortfolioProject(id);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error) {
    return <ProjectError error={error.message || "Failed to load project"} />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="container py-16 mx-auto">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/portfolio">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolio
        </Link>
      </Button>
      
      <ProjectDetail project={project} />
    </div>
  );
};

export default ProjectDetailPage;
