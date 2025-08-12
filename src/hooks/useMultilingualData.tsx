
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
      let query = supabase.from(table).select(select);

      // Apply language filter if locale column exists
      // Check if the table has a locale column first
      const { data: tableInfo } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', table)
        .eq('column_name', 'locale');

      if (tableInfo && tableInfo.length > 0) {
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
