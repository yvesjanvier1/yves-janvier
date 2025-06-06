
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/ui/lazy-image";
import { useLanguage } from "@/contexts/LanguageContext";

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

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300">
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
  );
};
