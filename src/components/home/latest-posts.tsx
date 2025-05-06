
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  content: string;
  cover_image?: string;
  tags: string[];
  created_at: string;
}

const LatestPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching latest blog posts...");
        
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Latest blog posts data:", data);

        if (data) {
          // Transform the data to match the expected format
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching latest posts:", error);
        setError("Failed to load latest blog posts");
        toast.error("Failed to load latest blog posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (error) {
    return (
      <section className="section">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title="Latest from the Blog"
            subtitle="Insights, tutorials, and thoughts on data and tech"
            centered
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="Latest from the Blog"
          subtitle="Insights, tutorials, and thoughts on data and tech"
          centered
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.cover_image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-2">
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
                  <h3 className="font-semibold text-xl mb-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="text-primary font-medium inline-flex items-center hover:underline"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No blog posts found.</p>
            <p className="text-sm text-muted-foreground">Check back later for new content.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
