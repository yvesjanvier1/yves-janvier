
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProjectListHeader } from "./project-list-header";
import { getProjectColumns, PortfolioProject } from "./project-columns";

export function ProjectList() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast.error("Failed to fetch portfolio projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", projectToDelete);
        
      if (error) throw error;
      
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectToDelete));
      toast.success("Project deleted successfully");
    } catch (error) {
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
      
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === id ? { ...project, featured: !currentValue } : project
        )
      );
      
      toast.success(`Project ${!currentValue ? "featured" : "unfeatured"} successfully`);
    } catch (error) {
      toast.error("Failed to update project");
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.tech_stack && project.tech_stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const columns = getProjectColumns({
    onToggleFeatured: toggleFeatured,
    onDeleteClick: (id) => setProjectToDelete(id)
  });

  return (
    <div className="space-y-6">
      <ProjectListHeader 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

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
