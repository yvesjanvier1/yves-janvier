
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectData } from "@/components/portfolio/project-detail/useProjectData";
import ProjectDetailSkeleton from "@/components/portfolio/project-detail/ProjectDetailSkeleton";
import ProjectError from "@/components/portfolio/project-detail/ProjectError";
import ProjectNotFound from "@/components/portfolio/project-detail/ProjectNotFound";
import ProjectDetail from "@/components/portfolio/project-detail/ProjectDetail";
import { SEOInternational } from "@/components/seo/SEOInternational";
import { useLanguage } from "@/contexts/LanguageContext";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { project, isLoading, error } = useProjectData(slug);

  if (isLoading) {
    return (
      <>
        <SEOInternational />
        <ProjectDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOInternational />
        <ProjectError error={error} />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <SEOInternational />
        <ProjectNotFound />
      </>
    );
  }

  return (
    <>
      <SEOInternational />
      <div className="container py-16 mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.backTo')} {t('portfolio.title')}
          </Link>
        </Button>
        
        <ProjectDetail project={project} />
      </div>
    </>
  );
};

export default ProjectDetailPage;
