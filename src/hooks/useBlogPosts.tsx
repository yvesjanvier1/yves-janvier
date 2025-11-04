import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { BlogPost } from "@/types/blog";

interface UseBlogPostsOptions {
  limit?: number;
  offset?: number;
  tag?: string;
  search?: string;
  enabled?: boolean;
}

export const useBlogPosts = ({
  limit = 10,
  offset = 0,
  tag,
  search,
  enabled = true
}: UseBlogPostsOptions = {}) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['blog_posts', language, limit, offset, tag, search],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('set_locale_and_get_blog_posts', {
        _locale: language,
        _limit: limit,
        _offset: offset,
        _tag: tag || null,
        _search: search || null
      });

      if (error) {
        console.error("Error fetching blog posts:", error);
        throw error;
      }

      return data as BlogPost[];
    },
    enabled,
  });
};

export const useBlogPost = (idOrSlug: string | undefined, enabled = true) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['blog_post', idOrSlug, language],
    queryFn: async () => {
      if (!idOrSlug) throw new Error("No ID or slug provided");

      // Set locale first
      await (supabase.rpc as any)('set_current_locale', { _locale: language });

      // Try to find by slug first
      let { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", idOrSlug)
        .eq("published", true)
        .maybeSingle();

      // If not found by slug and idOrSlug looks like a UUID, try by ID
      if (!data && !error && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)) {
        const result = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", idOrSlug)
          .eq("published", true)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      if (!data) throw new Error("Blog post not found");

      return data as BlogPost;
    },
    enabled: enabled && !!idOrSlug,
  });
};
