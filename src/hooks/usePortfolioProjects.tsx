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
      const { data, error } = await (supabase.rpc as any)('set_locale_and_get_portfolio_projects', {
        _locale: language,
        _limit: limit,
        _offset: offset,
        _category: category || null,
        _featured: featured ?? null
      });

      if (error) {
        console.error("Error fetching portfolio projects:", error);
        throw error;
      }

      return data as PortfolioProject[];
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
