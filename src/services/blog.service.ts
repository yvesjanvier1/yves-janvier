import { supabase } from "@/integrations/supabase/client";
import { createCrudService } from "./_base";
import type { BlogPost } from "@/types/blog";

const base = createCrudService("blog_posts");

export interface ListPublicOptions {
  locale: string;
  limit?: number;
  offset?: number;
  tag?: string | null;
  search?: string | null;
}

const localeFilter = (locale: string) => `locale.eq.${locale},locale.is.null`;

export const blogService = {
  ...base,

  /**
   * Public listing of published posts. Locale filtering is done in the query
   * (not via RLS) so content stays visible for anonymous visitors.
   */
  async listPublic({ locale, limit = 10, offset = 0, tag, search }: ListPublicOptions) {
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .or(localeFilter(locale))
      .order("created_at", { ascending: false });

    if (tag) query = query.contains("tags", [tag]);
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`,
      );
    }
    if (offset) {
      query = query.range(offset, offset + limit - 1);
    } else {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as BlogPost[];
  },

  /**
   * Fetch a published post by slug (fallback to UUID).
   */
  async getPublicBySlugOrId(idOrSlug: string, _locale?: string): Promise<BlogPost> {
    let { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", idOrSlug)
      .eq("published", true)
      .maybeSingle();

    const looksLikeUuid =
      !data && !error && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    if (looksLikeUuid) {
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
};
