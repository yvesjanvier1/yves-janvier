import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { portfolioService } from "@/services/portfolio.service";

interface UsePortfolioProjectsOptions {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
  enabled?: boolean;
}

export const usePortfolioProjects = ({
  limit = 12,
  offset = 0,
  category,
  featured,
  enabled = true,
}: UsePortfolioProjectsOptions = {}) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ["portfolio_projects", language, limit, offset, category, featured],
    queryFn: () =>
      portfolioService.listPublic({
        locale: language,
        limit,
        offset,
        category,
        featured,
      }),
    enabled,
  });
};

export const usePortfolioProject = (idOrSlug: string | undefined, enabled = true) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ["portfolio_project", idOrSlug, language],
    queryFn: () => {
      if (!idOrSlug) throw new Error("No ID or slug provided");
      return portfolioService.getPublicBySlugOrId(idOrSlug, language);
    },
    enabled: enabled && !!idOrSlug,
  });
};
