
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import SocialShare from "@/components/blog/social-share";
import SEOHead from "@/components/seo/SEOHead";
import { SEOInternational } from "@/components/seo/SEOInternational";
import { SecureHtml } from "@/components/ui/secure-html";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id?: string;
  published: boolean;
  locale?: string;
}

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, formatDate, language } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log(`BlogPostPage: Fetching blog post with id/slug: ${id}`);
        
        // First try to fetch by slug with language preference
        let { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", id)
          .eq("published", true)
          .or(`locale.eq.${language},locale.is.null`)
          .order('locale', { ascending: false }) // Prefer current language
          .maybeSingle();

        if (!data && !error) {
          // If no post found by slug, try by id
          ({ data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("id", id)
            .eq("published", true)
            .or(`locale.eq.${language},locale.is.null`)
            .order('locale', { ascending: false })
            .maybeSingle());
        }

        if (error) {
          console.error("BlogPostPage: Supabase error:", error);
          throw error;
        }

        console.log("BlogPostPage: Blog post data:", data);

        if (data) {
          setPost(data);
        } else {
          console.error("BlogPostPage: No blog post found with this ID/slug");
          setError(t('blog.noPostsFound'));
          toast.error(t('blog.noPostsFound'));
        }
      } catch (err) {
        console.error("BlogPostPage: Error fetching blog post:", err);
        setError(t('common.error'));
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, language, t]);

  if (isLoading) {
    return (
      <>
        <SEOInternational />
        <div className="container max-w-4xl px-4 py-16 mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.backTo')} {t('blog.title')}
              </Link>
            </Button>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/6" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead 
          title={`${t('blog.noPostsFound')} - Yves Janvier`}
          description={t('blog.noPostsMessage')}
        />
        <SEOInternational />
        <div className="container max-w-4xl px-4 py-16 mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.backTo')} {t('blog.title')}
              </Link>
            </Button>
          </div>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">{t('common.error')}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/blog")}>
              {t('common.backTo')} {t('blog.title')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SEOHead 
          title={`${t('blog.noPostsFound')} - Yves Janvier`}
          description={t('blog.noPostsMessage')}
        />
        <SEOInternational />
        <div className="container max-w-4xl px-4 py-16 mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.backTo')} {t('blog.title')}
              </Link>
            </Button>
          </div>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">{t('blog.noPostsFound')}</h2>
            <p className="text-muted-foreground mb-6">{t('blog.noPostsMessage')}</p>
            <Button onClick={() => navigate("/blog")}>
              {t('common.backTo')} {t('blog.title')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${post.title} - Yves Janvier`}
        description={post.excerpt || post.content.substring(0, 160) + "..."}
        image={post.cover_image}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        tags={post.tags}
        url={currentUrl}
      />
      <SEOInternational />
      <div className="container max-w-4xl px-4 py-16 mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.backTo')} {t('blog.title')}
            </Link>
          </Button>
        </div>

        <article className="prose dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags && post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            
            <div className="text-muted-foreground mb-6">
              <time dateTime={post.created_at}>
                {t('common.publishedOn')} {formatDate(post.created_at)}
              </time>
              {post.updated_at !== post.created_at && (
                <span className="ml-4">
                  <time dateTime={post.updated_at}>
                    {t('common.updated')} {formatDate(post.updated_at)}
                  </time>
                </span>
              )}
            </div>

            {post.cover_image && (
              <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
                <img 
                  src={post.cover_image} 
                  alt={`${t('blog.title')} - ${post.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          <div className="mt-8 leading-relaxed">
            <SecureHtml 
              html={post.content}
              className="blog-content"
            />
          </div>

          <footer className="mt-12 pt-8 border-t">
            <SocialShare 
              title={post.title}
              url={currentUrl}
              description={post.excerpt}
            />
          </footer>
        </article>
      </div>
    </>
  );
};

export default BlogPostPage;
