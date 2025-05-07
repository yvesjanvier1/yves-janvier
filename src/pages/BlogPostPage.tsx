
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_image?: string;
  tags: string[];
  created_at: string;
  author_id?: string;
  published: boolean;
}

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log(`BlogPostPage: Fetching blog post with id/slug: ${id}`);
        
        // First try to fetch by slug
        let { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", id)
          .eq("published", true)
          .maybeSingle();

        if (!data && !error) {
          console.log("BlogPostPage: No post found by slug, trying by ID");
          // If no post found by slug, try by id
          ({ data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("id", id)
            .eq("published", true)
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
          // No post found
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
  }, [id, navigate]);

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
    );
  }

  if (!post) {
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
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/blog")}>
            Return to Blog
          </Button>
        </div>
      </div>
    );
  }

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

      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags && post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        
        <div className="text-muted-foreground mb-6">
          Published on {formatDate(post.created_at)}
        </div>

        {post.cover_image && (
          <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mt-8" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
      </article>
    </div>
  );
};

export default BlogPostPage;
