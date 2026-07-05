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

export const blogService = {
  ...base,

  /**
   * Locale-aware public listing via RPC. The RPC also sets the locale
   * for RLS in the same transaction, avoiding a race with `set_current_locale`.
   */
  async listPublic({ locale, limit = 10, offset = 0, tag, search }: ListPublicOptions) {
    const { data, error } = await (supabase.rpc as any)("set_locale_and_get_blog_posts", {
      _locale: locale,
      _limit: limit,
      _offset: offset,
      _tag: tag ?? null,
      _search: search ?? null,
    });
    if (error) throw error;
    return (data ?? []) as BlogPost[];
  },

  /**
   * Fetch a published post by slug (fallback to UUID). Sets locale first for RLS.
   */
  async getPublicBySlugOrId(idOrSlug: string, locale: string): Promise<BlogPost> {
    await (supabase.rpc as any)("set_current_locale", { _locale: locale });

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
