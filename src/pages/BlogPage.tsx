
import { useState } from "react";
import { blogTags, blogPosts } from "@/data/blog-posts";
import { SectionHeader } from "@/components/ui/section-header";
import BlogCard from "@/components/blog/blog-card";
import BlogFilters from "@/components/blog/blog-filters";

const BlogPage = () => {
  const [activeTag, setActiveTag] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  
  // Filter posts by tag and search value
  const filteredPosts = blogPosts.filter(post => {
    const matchesTag = activeTag === "All" || post.tags.includes(activeTag);
    const matchesSearch = searchValue === "" || 
      post.title.toLowerCase().includes(searchValue.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchValue.toLowerCase());
    
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
        tags={blogTags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
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
