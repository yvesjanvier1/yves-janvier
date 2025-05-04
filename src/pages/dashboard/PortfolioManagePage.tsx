
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Star } from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  featured: boolean;
  created_at: string;
  tech_stack: string[];
}

const PortfolioManagePage = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      console.error("Error fetching portfolio projects:", error);
      toast.error("Failed to fetch portfolio projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
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
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.tech_stack && project.tech_stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())))
  );

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
      
      {isLoading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {searchQuery ? "No projects match your search" : "No portfolio projects found. Create your first project!"}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Technologies</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.slug}</TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack && project.tech_stack.slice(0, 3).map((tech, i) => (
                        <Badge key={i} variant="outline">{tech}</Badge>
                      ))}
                      {project.tech_stack && project.tech_stack.length > 3 && (
                        <Badge variant="outline">+{project.tech_stack.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/dashboard/portfolio/edit/${project.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagePage;
