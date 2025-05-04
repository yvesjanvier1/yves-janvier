
import { Link } from "react-router-dom";

interface ProjectLink {
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  categories: string[];
  tools: string[];
  featured: boolean;
  date: string;
  links: ProjectLink[];
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <div className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link 
            to={`/portfolio/${project.id}`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
          >
            View Project
          </Link>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          {project.categories.map((category) => (
            <span 
              key={category} 
              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
        <p className="text-muted-foreground flex-grow mb-4">{project.summary}</p>
        <Link 
          to={`/portfolio/${project.id}`}
          className="text-primary font-medium hover:underline"
        >
          View Case Study
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
