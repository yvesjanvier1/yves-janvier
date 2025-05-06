
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import BlogCard from "@/components/blog/blog-card";
import BlogFilters from "@/components/blog/blog-filters";
import { toast } from "sonner";

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
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching blog posts...");
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Blog posts data:", data);
        
        // Process posts and extract unique tags
        if (data) {
          setBlogPosts(data);
          
          // Extract unique tags
          const allTags = ["All"];
          data.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                if (!allTags.includes(tag)) {
                  allTags.push(tag);
                }
              });
            }
          });
          
          setTags(allTags);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        toast.error("Failed to load blog posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  // Filter posts by tag and search value
  const filteredPosts = blogPosts.filter(post => {
    const matchesTag = activeTag === "All" || post.tags?.includes(activeTag);
    const matchesSearch = searchValue === "" || 
      post.title.toLowerCase().includes(searchValue.toLowerCase()) || 
      post.excerpt?.toLowerCase().includes(searchValue.toLowerCase());
    
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
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <BlogCard 
              key={post.id} 
              post={{
                id: post.slug || post.id,
                title: post.title,
                excerpt: post.excerpt || "",
                content: post.content,
                coverImage: post.cover_image || "/placeholder.svg",
                tags: post.tags || [],
                date: post.created_at,
                author: {
                  name: "Admin",
                  avatar: "/placeholder.svg"
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
