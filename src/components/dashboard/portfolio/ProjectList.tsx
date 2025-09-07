
import { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Edit, Trash2, Plus, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  featured: boolean;
  created_at: string;
  tech_stack: string[];
}

export function ProjectList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_portfolio_projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PortfolioProject[];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", projectToDelete);
        
      if (error) throw error;
      
      await refetch();
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setProjectToDelete(null);
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .update({ featured: !currentValue })
        .eq("id", id);
        
      if (error) throw error;
      
      await refetch();
      toast.success(`Project ${!currentValue ? "featured" : "unfeatured"} successfully`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.tech_stack && project.tech_stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const columns = [
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
          onClick={() => toggleFeatured(project.id, project.featured)}
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
            onClick={() => setProjectToDelete(project.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Projects</h1>
        <Button asChild>
          <Link to="/dashboard/portfolio/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title, category or technology..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredProjects} 
        isLoading={isLoading} 
        emptyMessage={searchQuery ? "No projects match your search" : "No portfolio projects found. Create your first project!"}
      />
      
      <ConfirmDialog
        open={!!projectToDelete}
        onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteProject}
        destructive
      />
    </div>
  );
}
