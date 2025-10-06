import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { useMultilingualData } from "@/hooks/useMultilingualData";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";

import { ArrowRight } from "lucide-react";

const LatestPosts = () => {
  const { t, i18n } = useTranslation(["blog", "common"]);
  const { isMobile } = useResponsive();

  const { data: posts = [], isLoading, error } = useMultilingualData<any>({
    table: "blog_posts",
    filters: { published: true },
    orderBy: { column: "created_at", ascending: false },
    limit: isMobile ? 2 : 3,
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title={t("blog.latestPosts")}
          subtitle={t("blog.latestPostsSubtitle")}
          centered
        />

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: isMobile ? 2 : 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-card rounded-lg overflow-hidden border shadow-sm animate-pulse"
              >
                <div className="aspect-video bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-24 bg-muted rounded-full" />
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{t("common.error")}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : posts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {t("blog.noPostsFound")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("blog.noPostsMessage")}
            </p>
          </div>
        ) : (
          // Posts Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300"
              >
                <LazyImage
                  src={post.cover_image || "/placeholder.svg"}
                  alt={post.title}
                  aspectRatio="video"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags?.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <time className="text-sm text-muted-foreground block mb-2">
                    {formatDate(post.created_at)}
                  </time>
                  <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {post.excerpt || ""}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-primary font-medium inline-flex items-center hover:underline"
                  >
                    {t("blog.readMore")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">{t("blog.viewAll")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
