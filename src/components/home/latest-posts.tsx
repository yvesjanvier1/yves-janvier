
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { LazyImage } from "@/components/ui/lazy-image";
import { useMultilingualData } from "@/hooks/useMultilingualData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";

const LatestPosts = () => {
  const { t, formatDate, language } = useLanguage();
  const { isMobile } = useResponsive();
  const { data: posts = [], isLoading, error } = useMultilingualData<any>({
    table: 'blog_posts',
    filters: { published: true },
    orderBy: { column: 'created_at', ascending: false },
    limit: isMobile ? 2 : 3
  });

  if (error) {
    return (
      <section className="section">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title={t('blog.latestPosts')}
            subtitle={t('blog.latestPostsSubtitle')}
            centered
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{t('common.error')}</p>
            <Button onClick={() => window.location.reload()} variant="outline">{t('common.retry')}</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title={t('blog.latestPosts')}
          subtitle={t('blog.latestPostsSubtitle')}
          centered
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden border shadow-sm">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                    <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                  </div>
                  <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
              >
                <LazyImage
                  src={post.cover_image || "/placeholder.svg"}
                  alt={post.title}
                  aspectRatio="video"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags && post.tags.slice(0, 2).map((tag) => (
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
                  <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt || ""}</p>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="text-primary font-medium inline-flex items-center hover:underline"
                  >
                    {t('blog.readMore')}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{t('blog.noPostsFound')}</p>
            <p className="text-sm text-muted-foreground">{t('blog.noPostsMessage')}</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">{t('blog.viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
