
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import BlogCard from "@/components/blog/blog-card";
import { PaginationEnhanced } from "@/components/ui/pagination-enhanced";
import { BlogPostSkeleton } from "@/components/ui/loading-skeletons";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { AnimatedSection } from "@/components/ui/animated-section";

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

const POSTS_PER_PAGE = 6;

const BlogPage = () => {
  const { page } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  
  const currentPage = parseInt(page || "1", 10);
  const selectedTag = searchParams.get("tag") || "all";
  const sortBy = searchParams.get("sort") || "date";
  const searchTerm = searchParams.get("search") || "";
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedTag, sortBy, searchTerm]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from("blog_posts")
        .select("*", { count: 'exact' })
        .eq("published", true);

      // Apply tag filter
      if (selectedTag !== "all") {
        query = query.contains("tags", [selectedTag]);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      if (sortBy === "date") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "title") {
        query = query.order("title", { ascending: true });
      } else if (sortBy === "updated") {
        query = query.order("updated_at", { ascending: false });
      }

      // Get total count first
      const { count } = await query;
      const totalCount = count || 0;
      setTotalPages(Math.ceil(totalCount / POSTS_PER_PAGE));

      // Apply pagination
      const offset = (currentPage - 1) * POSTS_PER_PAGE;
      const { data, error } = await query
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const validPosts = data.filter(post => 
          post.title && post.slug && post.content
        );
        
        setBlogPosts(validPosts);
        
        // Extract unique tags from all posts
        const { data: allPosts } = await supabase
          .from("blog_posts")
          .select("tags")
          .eq("published", true);
        
        if (allPosts) {
          const allTags: string[] = [];
          allPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                if (!allTags.includes(tag)) {
                  allTags.push(tag);
                }
              });
            }
          });
          
          setAvailableTags(allTags);
        }
      } else {
        setBlogPosts([]);
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError("Failed to load blog posts");
      toast.error("Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  return (
    <ResponsiveContainer className="py-16 md:py-24">
      <AnimatedSection>
        <SectionHeader
          title={t('blog.title') || "Blog"}
          subtitle={t('blog.subtitle') || "Articles, insights, and updates"}
          centered
        />
      </AnimatedSection>
      
      {/* Filters and Search */}
      <AnimatedSection delay={0.2}>
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => updateSearchParams("search", e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedTag} onValueChange={(value) => updateSearchParams("tag", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => updateSearchParams("sort", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="title">By Title</SelectItem>
                <SelectItem value="updated">By Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AnimatedSection>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <BlogPostSkeleton />
            </AnimatedSection>
          ))}
        </div>
      ) : error ? (
        <AnimatedSection>
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">Error Loading Posts</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={fetchPosts}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </AnimatedSection>
      ) : blogPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts.map((post, index) => (
              <AnimatedSection key={post.id} delay={index * 0.1}>
                <BlogCard 
                  post={{
                    id: post.slug || post.id,
                    title: post.title,
                    excerpt: post.excerpt || post.content.substring(0, 150) + "...",
                    content: post.content,
                    coverImage: post.cover_image || "/placeholder.svg",
                    tags: post.tags || [],
                    date: post.created_at,
                    author: {
                      name: "Yves Janvier",
                      avatar: "/placeholder.svg"
                    }
                  }} 
                />
              </AnimatedSection>
            ))}
          </div>
          
          {totalPages > 1 && (
            <AnimatedSection delay={0.6}>
              <PaginationEnhanced
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/content/blog"
                className="mt-12"
              />
            </AnimatedSection>
          )}
        </>
      ) : (
        <AnimatedSection>
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No Posts Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedTag !== "all" 
                ? "Try adjusting your search criteria or filters." 
                : "Check back soon for new content."}
            </p>
          </div>
        </AnimatedSection>
      )}
    </ResponsiveContainer>
  );
};

export default BlogPage;
