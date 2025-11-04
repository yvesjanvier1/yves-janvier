
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
      try {
        // Set current locale for RLS - this MUST succeed
        await (supabase.rpc as any)('set_current_locale', { _locale: language });
      } catch (error) {
        console.error('Failed to set locale:', error);
        // Continue anyway - RLS will handle locale filtering
      }
      
      // Create the query with type assertion to handle dynamic table names
      let query = (supabase as any).from(table).select(select);

      // Note: Locale filtering is now handled entirely by RLS policies
      // No need for duplicate client-side filtering

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

// Specific hooks for common use cases - use dedicated hooks instead:
// - useBlogPosts from @/hooks/useBlogPosts
// - usePortfolioProjects from @/hooks/usePortfolioProjects

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
