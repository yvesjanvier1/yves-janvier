import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { servicesService } from "@/services/services.service";
import { testimonialsService } from "@/services/testimonials.service";

/**
 * @deprecated Use dedicated hooks or services directly:
 * - useBlogPosts from @/hooks/useBlogPosts
 * - usePortfolioProjects from @/hooks/usePortfolioProjects
 * - servicesService.listPublic / testimonialsService.listPublic
 */
export const useMultilingualServices = (filters: Record<string, any> = {}) => {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["services", language, filters],
    queryFn: () =>
      servicesService.listPublic({
        locale: language,
        filters,
        orderBy: { column: "created_at", ascending: false },
      }),
  });
};

export const useMultilingualTestimonials = (filters: Record<string, any> = {}) => {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["testimonials", language, filters],
    queryFn: () =>
      testimonialsService.listPublic({
        locale: language,
        filters,
        orderBy: { column: "created_at", ascending: false },
      }),
  });
};
