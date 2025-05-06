
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import ProjectCard from "@/components/portfolio/project-card";
import ProjectFilters from "@/components/portfolio/project-filters";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Interface for data from Supabase
interface SupabaseProject {
  id: string;
  title: string;
  description: string;
  category?: string;
  tech_stack?: string[];
  featured: boolean;
  created_at: string;
  images?: string[];
  links?: Json;
  slug: string;
}

const PortfolioPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching portfolio projects...");
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Portfolio projects data:", data);

        // Process projects and extract unique categories
        if (data) {
          setProjects(data);
          
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
          {filteredProjects.map(project => {
            // Parse links from JSON
            let formattedLinks: { title: string; url: string }[] = [];
            
            if (project.links) {
              if (Array.isArray(project.links)) {
                formattedLinks = (project.links as any[]).map(link => {
                  return {
                    title: typeof link.title === 'string' ? link.title : 'Link',
                    url: typeof link.url === 'string' ? link.url : ''
                  };
                });
              } else if (typeof project.links === 'object' && project.links !== null) {
                const linksObj = project.links as Record<string, any>;
                formattedLinks = Object.entries(linksObj).map(([title, url]) => ({ 
                  title, 
                  url: typeof url === 'string' ? url : '' 
                }));
              }
            }
            
            return (
              <ProjectCard 
                key={project.id} 
                project={{
                  id: project.slug || project.id,
                  title: project.title,
                  summary: project.description.substring(0, 150) + "...",
                  description: project.description,
                  coverImage: project.images && project.images.length > 0 ? project.images[0] : "/placeholder.svg",
                  categories: project.category ? [project.category] : ["Uncategorized"],
                  tools: project.tech_stack || [],
                  featured: project.featured || false,
                  date: project.created_at,
                  links: formattedLinks
                }} 
              />
            );
          })}
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
