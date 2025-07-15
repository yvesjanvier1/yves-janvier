
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
    <div className="group glass-card hover-lift overflow-hidden border border-primary/10 relative bg-gradient-surface">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      
      <div className="relative">
        <LazyImage
          src={project.images?.[0] || "/placeholder.svg"}
          alt={project.title}
          aspectRatio="video"
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {project.category && (
          <span className="absolute top-3 left-3 bg-gradient-primary text-white text-xs px-3 py-1 rounded-full shadow-glow">
            {project.category}
          </span>
        )}
        {/* Overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5 relative z-10">
        <h3 className="font-semibold text-xl mb-2 text-gradient-primary group-hover:text-gradient-secondary transition-all duration-300">
          {project.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>
        
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech_stack.slice(0, 3).map((tech, index) => (
              <span 
                key={tech} 
                className={`text-xs px-2 py-1 rounded-full text-white ${
                  index === 0 ? 'bg-gradient-primary' : 
                  index === 1 ? 'bg-gradient-secondary' : 
                  'bg-gradient-accent'
                }`}
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
            className="text-gradient-primary font-medium inline-flex items-center hover:text-gradient-secondary transition-all duration-300 group/link"
          >
            {t('portfolio.viewProject')}
            <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
          </Link>
          
          {project.links && project.links.length > 0 && (
            <div className="flex gap-2">
              {project.links.slice(0, 2).map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary hover:bg-gradient-primary hover:text-white p-2 rounded-full transition-all duration-300"
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
