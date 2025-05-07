
import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import ProjectCard from "@/components/portfolio/project-card";
import ProjectFilters from "@/components/portfolio/project-filters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for project data from Supabase
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category?: string;
  tech_stack?: string[];
  links?: {
    title?: string;
    url?: string;
  }[];
  featured: boolean;
  created_at: string;
}

const PortfolioPage = () => {
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("PortfolioPage: Fetching projects...");
        
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("PortfolioPage: Supabase error:", error);
          throw error;
        }
        
        console.log("PortfolioPage: Projects data:", data);
        
        if (data) {
          // Process the data to ensure it's in the correct format
          const processedProjects = data.map(project => ({
            ...project,
            // Parse links if needed
            links: Array.isArray(project.links) 
              ? project.links 
              : (typeof project.links === 'string' 
                  ? JSON.parse(project.links) 
                  : (project.links || []))
          }));
          
          setProjects(processedProjects);
          
          // Extract unique categories
          const allCategories = ["All"];
          processedProjects.forEach(project => {
            if (project.category && !allCategories.includes(project.category)) {
              allCategories.push(project.category);
            }
          });
          
          console.log("PortfolioPage: Categories:", allCategories);
          setCategories(allCategories);
        }
      } catch (err) {
        console.error("PortfolioPage: Error fetching projects:", err);
        setError("Failed to load projects");
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter projects by category and search value
  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeCategory === "All" || project.category === activeCategory;
    const matchesSearch = searchValue === "" || 
      project.title.toLowerCase().includes(searchValue.toLowerCase()) || 
      project.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      (project.tech_stack && project.tech_stack.some(tech => 
        tech.toLowerCase().includes(searchValue.toLowerCase())
      ));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <SectionHeader
        title="Portfolio"
        subtitle="Showcasing my latest work and projects"
        centered
      />
      
      <ProjectFilters 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex flex-col h-full">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">Error loading projects</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id}
              project={{
                id: project.slug || project.id,
                title: project.title,
                description: project.description,
                image: project.images && project.images.length > 0 
                  ? project.images[0] 
                  : "/placeholder.svg",
                tags: project.tech_stack || [],
                category: project.category || "Project"
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
