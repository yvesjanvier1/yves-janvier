
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_image?: string;
  tags: string[];
  created_at: string;
  author_id?: string;
}

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .eq("published", true)
          .single();

        if (error) throw error;

        if (data) {
          setPost(data);
        } else {
          // No post found
          navigate("/blog");
          toast.error("Blog post not found");
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast.error("Failed to load blog post");
        navigate("/blog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4 py-16 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-muted rounded w-full mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

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
