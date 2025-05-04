
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import ProjectCard from "@/components/portfolio/project-card";
import ProjectFilters from "@/components/portfolio/project-filters";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Update Project interface to align with both Supabase data and ProjectCard component
interface Project {
  id: string;
  title: string;
  summary: string; // Required for ProjectCard
  description: string;
  coverImage: string; // Required for ProjectCard
  categories: string[]; // Required for ProjectCard
  category?: string; // From Supabase
  tech_stack?: string[];
  tools: string[]; // Required for ProjectCard
  featured: boolean;
  created_at: string;
  date: string; // Required for ProjectCard
  images?: string[];
  links?: {
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
            let formattedLinks: { title: string; url: string }[] = [];
            
            if (project.links) {
              if (Array.isArray(project.links)) {
                formattedLinks = project.links.map(link => {
                  if (typeof link === 'object' && link !== null) {
                    // Check if the object has title and url properties
                    const linkObj = link as { [key: string]: Json };
                    return {
                      title: String(linkObj.title || ''),
                      url: String(linkObj.url || '')
                    };
                  }
                  return { title: 'Link', url: String(link) };
                });
              } else if (typeof project.links === 'object' && project.links !== null) {
                formattedLinks = Object.entries(project.links).map(([title, url]) => ({ 
                  title, 
                  url: String(url) 
                }));
              }
            }
                
            return {
              id: project.id,
              title: project.title,
              summary: project.description.substring(0, 150) + "...", // Create a summary from the description
              description: project.description,
              coverImage: project.images && project.images.length > 0 ? project.images[0] : "/placeholder.svg",
              category: project.category || "Uncategorized",
              // Create categories array to satisfy ProjectCard component
              categories: project.category ? [project.category] : ["Uncategorized"],
              tech_stack: project.tech_stack || [],
              // Create tools array to satisfy ProjectCard component
              tools: project.tech_stack || [],
              featured: project.featured || false,
              created_at: project.created_at,
              date: project.created_at, // For compatibility with ProjectCard
              images: project.images || [],
              links: formattedLinks
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
