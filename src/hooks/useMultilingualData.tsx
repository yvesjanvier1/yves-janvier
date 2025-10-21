
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
      // Set current locale for RLS
      await (supabase.rpc as any)('set_current_locale', { _locale: language });
      
      // Create the query with type assertion to handle dynamic table names
      let query = (supabase as any).from(table).select(select);

      // Apply language filter for multilingual tables
      const multilingualTables = ['blog_posts', 'portfolio_projects', 'services', 'testimonials'];
      if (multilingualTables.includes(table)) {
        // Use OR condition to get content in selected language or without locale (fallback)
        query = query.or(`locale.eq.${language},locale.is.null`);
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
        console.error(`Error fetching from ${table}:`, error);
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

export const useMultilingualServices = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: 'services',
    filters,
    orderBy: { column: 'created_at', ascending: false }
  });
};

export const useMultilingualTestimonials = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: 'testimonials',
    filters,
    orderBy: { column: 'created_at', ascending: false }
  });
};
