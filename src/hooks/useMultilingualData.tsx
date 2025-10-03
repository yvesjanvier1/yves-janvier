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
  scope?: "public" | "dashboard"; // NEW
}

export const useMultilingualData = <T,>({
  table,
  select = "*",
  filters = {},
  orderBy,
  enabled = true,
  limit,
  scope = "public", // default to public
}: UseMultilingualDataOptions) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: [table, language, filters, orderBy, select, limit, scope],
    queryFn: async () => {
      // Only set locale for public scope
      if (scope === "public") {
        try {
          await supabase.rpc("set_current_locale", { _locale: language });
        } catch (error) {
          console.warn("Failed to set locale:", error);
        }
      }

      let query = (supabase as any).from(table).select(select);

      // Apply locale filtering only for public scope
      if (scope === "public") {
        query = query.or(`locale.eq.${language},locale.is.null`);
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "search" && typeof value === "string") {
            query = query.or(
              `title.ilike.%${value}%,description.ilike.%${value}%,content.ilike.%${value}%`
            );
          } else if (Array.isArray(value)) {
            query = query.overlaps(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Limit
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

// 🔗 Public-facing hooks (localized)
export const useMultilingualBlogPosts = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: "blog_posts",
    filters: { published: true, ...filters },
    orderBy: { column: "created_at", ascending: false },
    scope: "public",
  });
};

export const useMultilingualPortfolioProjects = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: "portfolio_projects",
    filters,
    orderBy: { column: "featured", ascending: false },
    scope: "public",
  });
};

export const useMultilingualServices = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: "services",
    filters,
    orderBy: { column: "created_at", ascending: false },
    scope: "public",
  });
};

export const useMultilingualTestimonials = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: "testimonials",
    filters,
    orderBy: { column: "created_at", ascending: false },
    scope: "public",
  });
};

// 🔗 Dashboard-facing hooks (all records, no locale filtering)
export const useDashboardBlogPosts = () =>
  useMultilingualData<any>({ table: "blog_posts", orderBy: { column: "created_at", ascending: false }, scope: "dashboard" });

export const useDashboardPortfolioProjects = () =>
  useMultilingualData<any>({ table: "portfolio_projects", orderBy: { column: "created_at", ascending: false }, scope: "dashboard" });

export const useDashboardServices = () =>
  useMultilingualData<any>({ table: "services", orderBy: { column: "created_at", ascending: false }, scope: "dashboard" });

export const useDashboardTestimonials = () =>
  useMultilingualData<any>({ table: "testimonials", orderBy: { column: "created_at", ascending: false }, scope: "dashboard" });

export const useDashboardMessages = () =>
  useMultilingualData<any>({ table: "contact_messages", orderBy: { column: "created_at", ascending: false }, scope: "dashboard" });

// 🔗 Resources hooks
export const useResources = (filters: Record<string, any> = {}) => {
  return useMultilingualData<any>({
    table: "resources",
    filters,
    orderBy: { column: "featured", ascending: false },
    scope: "public",
  });
};

export const useDashboardResources = () =>
  useMultilingualData<any>({ table: "resources", orderBy: { column: "created_at", ascending: false }, scope: "dashboard" });
