
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  content: string;
  cover_image?: string;
  tags: string[];
  created_at: string;
  published: boolean;
}

const LatestPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, formatDate } = useLanguage();
  const { isMobile } = useResponsive();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const lang = localStorage.getItem('language') || 'fr';
        
        // Use atomic RPC function that sets locale and queries in single transaction
        const { data, error } = await (supabase.rpc as any)('set_locale_and_get_blog_posts', {
          _locale: lang,
          _limit: isMobile ? 2 : 3,
          _offset: 0,
          _tag: null,
          _search: null
        });

        if (error) throw error;

        if (data) {
          const validPosts = data.filter((post: any) => 
            post.title && post.slug && post.content
          );
          setPosts(validPosts);
        }
      } catch (error) {
        console.error("LatestPosts: Error fetching latest posts:", error);
        setError("Failed to load latest blog posts");
        toast.error("Failed to load latest blog posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isMobile]);

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
            <p className="text-destructive mb-4">{error}</p>
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
            <p className="text-sm text-muted-foreground">Check back later for new content.</p>
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
