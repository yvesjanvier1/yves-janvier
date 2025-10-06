
import { useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import BlogCard from "@/components/blog/blog-card";
import { PaginationEnhanced } from "@/components/ui/pagination-enhanced";
import { BlogPostSkeleton } from "@/components/ui/loading-skeletons";
import { useLanguage } from "@/contexts/LanguageContext";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useMultilingualBlogPosts } from "@/hooks/useMultilingualData";

const POSTS_PER_PAGE = 6;

const BlogPage = () => {
  const { page } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  
  const currentPage = parseInt(page || "1", 10);
  const selectedTag = searchParams.get("tag") || "all";
  const sortBy = searchParams.get("sort") || "date";
  const searchTerm = searchParams.get("search") || "";
  
  const filters = {
    ...(selectedTag !== "all" && { tags: [selectedTag] }),
    ...(searchTerm && { search: searchTerm })
  };

  const { data: allPosts = [], isLoading, error } = useMultilingualBlogPosts(filters);

  // Client-side pagination and filtering
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const blogPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Extract available tags from posts
  const availableTags = Array.from(new Set(allPosts.flatMap(post => post.tags || [])));

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
          title={t('blog.title')}
          subtitle={t('blog.subtitle')}
          centered
        />
      </AnimatedSection>
      
      {/* Filters and Search */}
      <AnimatedSection delay={0.2}>
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('blog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => updateSearchParams("search", e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedTag} onValueChange={(value) => updateSearchParams("tag", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')} Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => updateSearchParams("sort", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('common.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('portfolio.byDate')}</SelectItem>
                <SelectItem value="title">{t('portfolio.byTitle')}</SelectItem>
                <SelectItem value="updated">{t('common.updated')}</SelectItem>
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
            <h3 className="text-xl font-medium mb-2">{t('common.error')}</h3>
            <p className="text-muted-foreground mb-4">{t('blog.noPostsMessage')}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              {t('common.retry')}
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
                    id: post.id,
                    slug: post.slug || post.id,
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
            <h3 className="text-xl font-medium mb-2">{t('blog.noPostsFound')}</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedTag !== "all" 
                ? t('blog.noPostsMessage')
                : t('blog.noPostsMessage')}
            </p>
          </div>
        </AnimatedSection>
      )}
    </ResponsiveContainer>
  );
};

export default BlogPage;
