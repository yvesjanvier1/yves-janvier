
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectLink {
  title: string;
  url: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  category?: string;
  tech_stack?: string[];
  images?: string[];
  links?: ProjectLink[];
  created_at: string;
}

export const useFeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely convert links from Json to ProjectLink[]
  const convertLinks = (links: any): ProjectLink[] => {
    if (!links || !Array.isArray(links)) return [];
    
    return links.filter((link: any) => 
      link && 
      typeof link === 'object' && 
      typeof link.title === 'string' && 
      typeof link.url === 'string'
    ).map((link: any) => ({
      title: link.title,
      url: link.url
    }));
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data) {
          // Transform the data to match our Project interface
          const transformedProjects: Project[] = data.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            slug: project.slug,
            category: project.category,
            tech_stack: project.tech_stack,
            images: project.images,
            created_at: project.created_at,
            links: convertLinks(project.links)
          }));
          
          setProjects(transformedProjects);
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error);
        setError("Failed to load featured projects");
        toast.error("Failed to load featured projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, isLoading, error, refetch: () => window.location.reload() };
};
