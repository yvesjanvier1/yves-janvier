
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePortfolioProjects } from "@/hooks/usePortfolioProjects";
import { ProjectCard } from "./project-card";
import { ProjectSkeleton } from "./project-skeleton";

export const FeaturedProjects = () => {
  const { t } = useLanguage();
  
  // First try to get featured projects
  const { data: featuredProjects, isLoading: isFeaturedLoading } = usePortfolioProjects({ 
    limit: 3, 
    featured: true 
  });
  
  // Fallback to latest projects if no featured ones exist
  const { data: latestProjects, isLoading: isLatestLoading, error, refetch } = usePortfolioProjects({ 
    limit: 3,
    enabled: !isFeaturedLoading && (!featuredProjects || featuredProjects.length === 0)
  });
  
  const isLoading = isFeaturedLoading || isLatestLoading;
  const projects = (featuredProjects && featuredProjects.length > 0) ? featuredProjects : latestProjects;

  if (error) {
    return (
      <section className="section bg-muted/30">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title={t('portfolio.featuredProjects')}
            subtitle={t('portfolio.featuredProjectsSubtitle')}
            centered
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error.message || "Failed to load featured projects"}</p>
            <Button onClick={() => refetch()} variant="outline">
              {t('common.retry')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-muted/30">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title={t('portfolio.featuredProjects')}
          subtitle={t('portfolio.featuredProjectsSubtitle')}
          centered
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{t('portfolio.noProjectsFound')}</p>
            <p className="text-sm text-muted-foreground">Check back later for new projects.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">{t('portfolio.viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
