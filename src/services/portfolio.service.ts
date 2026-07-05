import { supabase } from "@/integrations/supabase/client";
import { createCrudService } from "./_base";
import type { PortfolioProject, ProjectLink } from "@/types/portfolio";

const base = createCrudService("portfolio_projects");

export interface ListPublicOptions {
  locale: string;
  limit?: number;
  offset?: number;
  category?: string | null;
  featured?: boolean | null;
}

const convertLinks = (links: any): ProjectLink[] => {
  if (!links || !Array.isArray(links)) return [];
  return links
    .filter(
      (link: any) =>
        link && typeof link === "object" && typeof link.title === "string" && typeof link.url === "string",
    )
    .map((link: any) => ({ title: link.title, url: link.url }));
};

export const portfolioService = {
  ...base,

  /**
   * Locale-aware public listing. Sets RLS locale first, then applies filters.
   */
  async listPublic({ locale, limit = 12, offset = 0, category, featured }: ListPublicOptions) {
    await (supabase.rpc as any)("set_current_locale", { _locale: locale });

    let query = supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (featured !== undefined && featured !== null) query = query.eq("featured", featured);
    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((p) => ({ ...p, links: convertLinks(p.links) })) as PortfolioProject[];
  },

  async getPublicBySlugOrId(idOrSlug: string, locale: string): Promise<PortfolioProject> {
    await (supabase.rpc as any)("set_current_locale", { _locale: locale });

    let { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("slug", idOrSlug)
      .maybeSingle();

    const looksLikeUuid =
      !data && !error && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    if (looksLikeUuid) {
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
    return { ...data, links: convertLinks(data.links) } as PortfolioProject;
  },
};
