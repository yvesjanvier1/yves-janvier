import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

interface ProjectLink {
  title: string;
  url: string;
}

export interface Project {
  id: string;
  slug: string;
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
  const { t } = useLanguage();

  const categories = project.categories || (project.category ? [project.category] : []);
  const tags = project.tools || project.tags || [];
  const imageUrl = project.coverImage || project.image || "/placeholder.svg";
  const summary = project.summary || (project.description ? project.description.slice(0, 120) + "..." : "");

  return (
    <div className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
      {/* Image / Hover Overlay */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Link
            to={`/portfolio/${project.slug}`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-lg"
          >
            {t("portfolio.viewProject")}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Categories / Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat, idx) => (
            <span
              key={`${cat}-${idx}`}
              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {cat}
            </span>
          ))}
          {tags.slice(0, 3).map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
              +{tags.length - 3} {t("portfolio.more")}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-xl mb-2">{project.title}</h3>

        {/* Summary */}
        <p className="text-muted-foreground flex-grow mb-4">{summary}</p>

        {/* CTA Link */}
        <Link
          to={`/portfolio/${project.slug}`}
          className="inline-flex items-center text-primary font-medium hover:underline"
        >
          {t("portfolio.viewCaseStudy")}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
