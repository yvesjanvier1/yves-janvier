import { useState, useEffect } from "react";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";

interface ProjectLink {
  title: string;
  url: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  category?: string;
  tech_stack?: string[];
  images?: string[];
  links?: ProjectLink[];
  created_at: string;
}

export const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(isMobile ? 2 : isTablet ? 4 : 6);

        if (error) throw error;

        if (data) {
          // Transform the data to match our Project interface
          const transformedProjects: Project[] = data.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            slug: project.slug,
            category: project.category,
            tech_stack: project.tech_stack,
            images: project.images,
            created_at: project.created_at,
            links: Array.isArray(project.links) 
              ? (project.links as ProjectLink[])
              : []
          }));
          
          setProjects(transformedProjects);
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error);
        setError("Failed to load featured projects");
        toast.error("Failed to load featured projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isMobile, isTablet]);

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
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
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
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden border shadow-sm">
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
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <LazyImage
                    src={project.images?.[0] || "/placeholder.svg"}
                    alt={project.title}
                    aspectRatio="video"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  {project.category && (
                    <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {project.category}
                    </span>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <span 
                          key={tech} 
                          className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          +{project.tech_stack.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Link 
                      to={`/portfolio/${project.slug}`}
                      className="text-primary font-medium inline-flex items-center hover:underline"
                    >
                      {t('portfolio.viewProject')}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                    
                    {project.links && project.links.length > 0 && (
                      <div className="flex gap-2">
                        {project.links.slice(0, 2).map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label={link.title}
                          >
                            {link.title.toLowerCase().includes('github') ? (
                              <Github className="h-4 w-4" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
