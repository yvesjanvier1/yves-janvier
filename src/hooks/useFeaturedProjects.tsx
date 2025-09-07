
import { useMultilingualData } from "./useMultilingualData";
import { sanitizeError } from "@/lib/security";

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

  const { data: rawProjects = [], isLoading, error: queryError, refetch: queryRefetch } = useMultilingualData<any>({
    table: 'portfolio_projects',
    orderBy: { column: 'featured', ascending: false },
    select: '*'
  });

  // Transform the data to match our Project interface and limit to 3
  const projects: Project[] = rawProjects.slice(0, 3).map(project => ({
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

  const error = queryError ? sanitizeError(queryError) : null;

  const refetch = () => {
    queryRefetch();
  };

  return { projects, isLoading, error, refetch };
};
