import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PortfolioProject, ProjectLink } from "@/types/portfolio";

interface UsePortfolioProjectsOptions {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
  enabled?: boolean;
}

export const usePortfolioProjects = ({
  limit = 12,
  offset = 0,
  category,
  featured,
  enabled = true
}: UsePortfolioProjectsOptions = {}) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['portfolio_projects', language, limit, offset, category, featured],
    queryFn: async () => {
      // Set locale first
      await (supabase.rpc as any)('set_current_locale', { _locale: language });

      // Build query
      let query = supabase
        .from("portfolio_projects")
        .select("*")
        .order('created_at', { ascending: false });

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      
      if (featured !== undefined && featured !== null) {
        query = query.eq('featured', featured);
      }

      // Apply pagination
      if (limit) {
        query = query.limit(limit);
      }
      
      if (offset) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching portfolio projects:", error);
        throw error;
      }

      // Convert links safely
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

      return data?.map(project => ({
        ...project,
        links: convertLinks(project.links)
      })) as PortfolioProject[] || [];
    },
    enabled,
  });
};

export const usePortfolioProject = (idOrSlug: string | undefined, enabled = true) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['portfolio_project', idOrSlug, language],
    queryFn: async () => {
      if (!idOrSlug) throw new Error("No ID or slug provided");

      // Set locale first
      await (supabase.rpc as any)('set_current_locale', { _locale: language });

      // Try to find by slug first
      let { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("slug", idOrSlug)
        .maybeSingle();

      // If not found by slug and idOrSlug looks like a UUID, try by ID
      if (!data && !error && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)) {
        const result = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("id", idOrSlug)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      if (!data) throw new Error("Project not found");

      // Convert links safely
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

      return {
        ...data,
        links: convertLinks(data.links)
      } as PortfolioProject;
    },
    enabled: enabled && !!idOrSlug,
  });
};
