
import { Link } from "react-router-dom";
import { Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  featured: boolean;
  created_at: string;
  tech_stack: string[];
}

interface ProjectColumnProps {
  onToggleFeatured: (id: string, currentValue: boolean) => void;
  onDeleteClick: (id: string) => void;
}

export function getProjectColumns({ 
  onToggleFeatured, 
  onDeleteClick 
}: ProjectColumnProps) {
  return [
    {
      key: "title",
      header: "Title",
      cell: (project: PortfolioProject) => <span className="font-medium">{project.title}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (project: PortfolioProject) => project.slug,
    },
    {
      key: "category",
      header: "Category",
      cell: (project: PortfolioProject) => project.category || "-",
    },
    {
      key: "tech_stack",
      header: "Technologies",
      cell: (project: PortfolioProject) => (
        <div className="flex flex-wrap gap-1">
          {project.tech_stack && project.tech_stack.slice(0, 3).map((tech, i) => (
            <Badge key={i} variant="outline">{tech}</Badge>
          ))}
          {project.tech_stack && project.tech_stack.length > 3 && (
            <Badge variant="outline">+{project.tech_stack.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      cell: (project: PortfolioProject) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFeatured(project.id, project.featured)}
          title={project.featured ? "Featured" : "Not featured"}
        >
          <Star 
            className={`h-4 w-4 ${project.featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
          />
        </Button>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (project: PortfolioProject) => new Date(project.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (project: PortfolioProject) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/portfolio/edit/${project.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(project.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }
  ];
}
