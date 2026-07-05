import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { blogService } from "@/services/blog.service";

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
  enabled = true,
}: UseBlogPostsOptions = {}) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ["blog_posts", language, limit, offset, tag, search],
    queryFn: () =>
      blogService.listPublic({ locale: language, limit, offset, tag, search }),
    enabled,
  });
};

export const useBlogPost = (idOrSlug: string | undefined, enabled = true) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ["blog_post", idOrSlug, language],
    queryFn: () => {
      if (!idOrSlug) throw new Error("No ID or slug provided");
      return blogService.getPublicBySlugOrId(idOrSlug, language);
    },
    enabled: enabled && !!idOrSlug,
  });
};
