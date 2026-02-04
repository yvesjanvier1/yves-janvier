import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioProject } from "@/hooks/usePortfolioProjects";
import ProjectDetailSkeleton from "@/components/portfolio/project-detail/ProjectDetailSkeleton";
import ProjectError from "@/components/portfolio/project-detail/ProjectError";
import ProjectNotFound from "@/components/portfolio/project-detail/ProjectNotFound";
import ProjectDetail from "@/components/portfolio/project-detail/ProjectDetail";
import SEOHead from "@/components/seo/SEOHead";

const BASE_URL = 'https://yves-janvier.lovable.app';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = usePortfolioProject(id);

  // Construct the full canonical URL for sharing
  const getShareUrl = () => project ? `${BASE_URL}/portfolio/${project.slug}` : '';

  // Get the first image as cover for social preview
  const getCoverImageUrl = () => {
    if (!project?.images || project.images.length === 0) return undefined;
    const firstImage = project.images[0];
    if (firstImage.startsWith('http')) return firstImage;
    return `${BASE_URL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
  };

  // Build tags from category and tech stack
  const getTags = () => {
    const tags: string[] = [];
    if (project?.category) tags.push(project.category);
    if (project?.tech_stack) tags.push(...project.tech_stack.slice(0, 5));
    return tags;
  };

  if (isLoading) {
    return (
      <>
        <SEOHead 
          title="Loading Project - Yves Janvier"
          description="Loading project details..."
        />
        <ProjectDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead 
          title="Project Error - Yves Janvier"
          description="There was an error loading this project."
        />
        <ProjectError error={error.message || "Failed to load project"} />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <SEOHead 
          title="Project Not Found - Yves Janvier"
          description="The project you're looking for could not be found."
        />
        <ProjectNotFound />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${project.title} - Portfolio | Yves Janvier`}
        description={project.description}
        image={getCoverImageUrl()}
        type="article"
        publishedTime={project.created_at}
        modifiedTime={project.updated_at}
        tags={getTags()}
        url={getShareUrl()}
      />
      <div className="container py-16 mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
        
        <ProjectDetail project={project} />
      </div>
    </>
  );
};

export default ProjectDetailPage;
