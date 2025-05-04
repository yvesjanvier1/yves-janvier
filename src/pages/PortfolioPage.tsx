
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import ProjectCard from "@/components/portfolio/project-card";
import ProjectFilters from "@/components/portfolio/project-filters";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  summary?: string;
  description: string;
  coverImage?: string;
  category: string;
  tech_stack: string[];
  featured: boolean;
  created_at: string;
  images: string[];
  links: {
    title: string;
    url: string;
  }[];
}

const PortfolioPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Process projects and extract unique categories
        if (data) {
          // Format projects for compatibility with the ProjectCard component
          const formattedProjects = data.map(project => {
            // Parse links from JSON if necessary
            const links = Array.isArray(project.links) 
              ? project.links
              : typeof project.links === 'object' && project.links !== null
                ? Object.entries(project.links).map(([title, url]) => ({ title, url }))
                : [];
                
            return {
              id: project.id,
              title: project.title,
              summary: project.description.substring(0, 150) + "...", // Create a summary from the description
              description: project.description,
              coverImage: project.images && project.images.length > 0 ? project.images[0] : undefined,
              category: project.category || "Uncategorized",
              tech_stack: project.tech_stack || [],
              featured: project.featured || false,
              created_at: project.created_at,
              images: project.images || [],
              links
            };
          });
          
          setProjects(formattedProjects);
          
          // Extract unique categories
          const allCategories = ["All"];
          data.forEach(project => {
            if (project.category && !allCategories.includes(project.category)) {
              allCategories.push(project.category);
            }
          });
          
          setCategories(allCategories);
        }
      } catch (error) {
        console.error("Error fetching portfolio projects:", error);
        toast.error("Failed to load portfolio projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);
  
  // Filter projects by category
  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <SectionHeader
        title="My Portfolio"
        subtitle="Explore my recent projects and case studies"
        centered
      />
      
      <ProjectFilters 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
