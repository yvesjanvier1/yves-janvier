
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import BlogCard from "@/components/blog/blog-card";
import BlogFilters from "@/components/blog/blog-filters";
import { PaginationEnhanced } from "@/components/ui/pagination-enhanced";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, formatDate } = useLanguage();
  
  const currentPage = parseInt(page || "1", 10);
  const activeTag = searchParams.get("tag") || "All";
  const searchValue = searchParams.get("search") || "";
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let query = supabase
          .from("blog_posts")
          .select("*", { count: 'exact' })
          .eq("published", true)
          .order("created_at", { ascending: false });

        // Apply tag filter
        if (activeTag !== "All") {
          query = query.contains("tags", [activeTag]);
        }

        // Apply search filter
        if (searchValue) {
          query = query.or(`title.ilike.%${searchValue}%,excerpt.ilike.%${searchValue}%,content.ilike.%${searchValue}%`);
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
          
          // Extract unique tags from all posts (not just current page)
          const { data: allPosts } = await supabase
            .from("blog_posts")
            .select("tags")
            .eq("published", true);
          
          if (allPosts) {
            const allTags = ["All"];
            allPosts.forEach(post => {
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
        } else {
          setBlogPosts([]);
        }
      } catch (err) {
        setError("Failed to load blog posts");
        toast.error("Failed to load blog posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, activeTag, searchValue]);

  const handleTagChange = (tag: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (tag === "All") {
        newParams.delete("tag");
      } else {
        newParams.set("tag", tag);
      }
      return newParams;
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (search) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }
      return newParams;
    });
  };

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <SectionHeader
        title={t('blog.title')}
        subtitle={t('blog.subtitle')}
        centered
      />
      
      <BlogFilters 
        tags={tags}
        activeTag={activeTag}
        onTagChange={handleTagChange}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
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
          <h3 className="text-xl font-medium mb-2">{t('common.error')}</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : blogPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts.map(post => (
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
                    name: "Admin",
                    avatar: "/placeholder.svg"
                  }
                }} 
              />
            ))}
          </div>
          
          <PaginationEnhanced
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/blog"
            className="mt-12"
          />
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">{t('blog.noPostsFound')}</h3>
          <p className="text-muted-foreground">
            {t('blog.noPostsMessage')}
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
