
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import BlogCard from "@/components/blog/blog-card";
import BlogFilters from "@/components/blog/blog-filters";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for blog posts from Supabase
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string[];
  created_at: string;
  author_id?: string;
  published: boolean;
}

const BlogPage = () => {
  const [activeTag, setActiveTag] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("BlogPage: Fetching blog posts...");
        
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true) // Only fetch published posts
          .order("created_at", { ascending: false });

        if (error) {
          console.error("BlogPage: Supabase error:", error);
          throw error;
        }

        console.log("BlogPage: Blog posts data:", data);
        
        if (data && data.length > 0) {
          // Process posts and extract unique tags
          const validPosts = data.filter(post => 
            post.title && post.slug && post.content
          );
          
          console.log("BlogPage: Valid posts count:", validPosts.length);
          setBlogPosts(validPosts);
          
          // Extract unique tags
          const allTags = ["All"];
          validPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                if (!allTags.includes(tag)) {
                  allTags.push(tag);
                }
              });
            }
          });
          
          console.log("BlogPage: Extracted tags:", allTags);
          setTags(allTags);
        } else {
          console.log("BlogPage: No published posts found");
        }
      } catch (err) {
        console.error("BlogPage: Error fetching blog posts:", err);
        setError("Failed to load blog posts");
        toast.error("Failed to load blog posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  // Filter posts by tag and search value
  const filteredPosts = blogPosts.filter(post => {
    const matchesTag = activeTag === "All" || (post.tags && post.tags.includes(activeTag));
    const matchesSearch = searchValue === "" || 
      post.title.toLowerCase().includes(searchValue.toLowerCase()) || 
      (post.excerpt && post.excerpt.toLowerCase().includes(searchValue.toLowerCase()));
    
    return matchesTag && matchesSearch;
  });

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <SectionHeader
        title="Blog"
        subtitle="Insights on data, technology, and innovation"
        centered
      />
      
      <BlogFilters 
        tags={tags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex flex-col h-full">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">Error loading posts</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <BlogCard 
              key={post.id} 
              post={{
                id: post.slug || post.id,
                title: post.title,
                excerpt: post.excerpt || post.content.substring(0, 150) + "...",
                content: post.content,
                coverImage: post.cover_image || "/placeholder.svg",
                tags: post.tags || [],
                date: post.created_at,
                author: {
                  name: "Admin", // Default author name
                  avatar: "/placeholder.svg" // Default avatar
                }
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No posts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
