
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectLink {
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  summary?: string;
  description: string;
  coverImage?: string;
  image?: string;
  categories?: string[];
  tools?: string[];
  tags?: string[];
  category?: string;
  featured?: boolean;
  date?: string;
  links?: ProjectLink[];
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { t, language } = useLanguage();
  
  // Extract categories from either project.categories array or single project.category
  const categories = project.categories || (project.category ? [project.category] : []);
  
  // Use either coverImage, image, or a placeholder
  const imageUrl = project.coverImage || project.image || "/placeholder.svg";
  
  // Use either tools or tags
  const tags = project.tools || project.tags || [];
  
  // Use either summary or truncated description
  const summary = project.summary || (project.description ? project.description.substring(0, 120) + '...' : '');

  return (
    <div className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link 
            to={`/${language}/portfolio/${project.id}`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
          >
            {t('portfolio.viewProject')}
          </Link>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map((category, index) => (
            <span 
              key={`${category}-${index}`} 
              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
        <p className="text-muted-foreground flex-grow mb-4">{summary}</p>
        <Link 
          to={`/${language}/portfolio/${project.id}`}
          className="text-primary font-medium hover:underline"
        >
          {t('portfolio.viewCaseStudy')}
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
