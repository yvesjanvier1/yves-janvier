
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface UseMultilingualDataOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
  limit?: number;
}

export const useMultilingualData = <T,>({
  table,
  select = "*",
  filters = {},
  orderBy,
  enabled = true,
  limit
}: UseMultilingualDataOptions) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: [table, language, filters, orderBy, select, limit],
    queryFn: async () => {
      // Set current locale in Supabase for RLS filtering
      try {
        await supabase.rpc('set_current_locale', { _locale: language });
      } catch (error) {
        console.warn('Failed to set locale:', error);
      }
      
      // Create the query with type assertion to handle dynamic table names
      let query = (supabase as any).from(table).select(select);

      // Apply locale filtering for multilingual tables
      query = query.or(`locale.eq.${language},locale.is.null`);

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'search' && typeof value === 'string') {
            // Handle search across title and content fields
            query = query.or(`title.ilike.%${value}%,description.ilike.%${value}%,content.ilike.%${value}%`);
          } else if (Array.isArray(value)) {
            // Handle array filters (like tags)
            query = query.overlaps(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        throw error;
      }

      return data as T[];
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
