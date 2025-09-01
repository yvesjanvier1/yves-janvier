
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface UseMultilingualDataOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

export const useMultilingualData = <T,>({
  table,
  select = "*",
  filters = {},
  orderBy,
  enabled = true
}: UseMultilingualDataOptions) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: [table, language, filters, orderBy, select],
    queryFn: async () => {
      // Use any to bypass TypeScript strict typing for dynamic table names
      let query = (supabase as any).from(table).select(select);

      // Apply language filter - assume locale column exists for multilingual tables
      // This is a safe assumption for blog_posts, portfolio_projects, etc.
      if (['blog_posts', 'portfolio_projects', 'services', 'testimonials'].includes(table)) {
        query = query.eq('locale', language);
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as T[];
    },
    enabled,
  });
};

// Specific hooks for common use cases
export const useMultilingualBlogPosts = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: 'blog_posts',
    filters: { published: true, ...filters },
    orderBy: { column: 'created_at', ascending: false }
  });
};

export const useMultilingualPortfolioProjects = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: 'portfolio_projects',
    filters,
    orderBy: { column: 'featured', ascending: false }
  });
};
