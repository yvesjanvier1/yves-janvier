import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import SocialShare from "@/components/blog/social-share";
import SEOHead from "@/components/seo/SEOHead";
import { SecureHtml } from "@/components/ui/secure-html";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id?: string;
  published: boolean;
}

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log(`BlogPostPage: Fetching blog post with id/slug: ${id}, locale: ${language}`);
        
        // Use RPC to set locale and fetch posts in the same transaction
        const { data: posts, error: rpcError } = await (supabase.rpc as any)('set_locale_and_get_blog_posts', {
          _locale: language,
          _limit: 100,
          _offset: 0,
          _tag: null,
          _search: null
        });

        if (rpcError) {
          console.error("BlogPostPage: RPC error:", rpcError);
          throw rpcError;
        }

        // Find the post by slug or ID from the returned posts
        let foundPost = posts?.find((p: BlogPost) => p.slug === id);
        
        if (!foundPost) {
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
          if (isUuid) {
            foundPost = posts?.find((p: BlogPost) => p.id === id);
          }
        }

        console.log("BlogPostPage: Blog post data:", foundPost);

        if (foundPost) {
          setPost(foundPost);
        } else {
          console.error("BlogPostPage: No blog post found with this ID/slug");
          setError("Blog post not found");
          toast.error("Blog post not found");
        }
      } catch (err) {
        console.error("BlogPostPage: Error fetching blog post:", err);
        setError("Failed to load blog post");
        toast.error("Failed to load blog post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, language]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4 py-16 mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
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
    );
  }

  if (error) {
    return (
      <>
        <SEOHead 
          title="Post Not Found - Yves Janvier"
          description="The blog post you're looking for could not be found."
        />
        <div className="container max-w-4xl px-4 py-16 mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/blog")}>
              Return to Blog
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
          title="Post Not Found - Yves Janvier"
          description="The blog post you're looking for could not be found."
        />
        <div className="container max-w-4xl px-4 py-16 mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/blog")}>
              Return to Blog
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
      <div className="container max-w-4xl px-4 py-16 mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
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
                Published on {formatDate(post.created_at)}
              </time>
              {post.updated_at !== post.created_at && (
                <span className="ml-4">
                  <time dateTime={post.updated_at}>
                    Updated {formatDate(post.updated_at)}
                  </time>
                </span>
              )}
            </div>

            {post.cover_image && (
              <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
                <img 
                  src={post.cover_image} 
                  alt={`Cover image for ${post.title}`}
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
