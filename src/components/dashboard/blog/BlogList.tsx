
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { blogService } from "@/services";
import { BlogListHeader } from "./blog-list/BlogListHeader";
import { getBlogListColumns } from "./blog-list/BlogListColumns";
import { BlogPostListItem } from "@/types/blog";

export function BlogList() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await blogService.list({ orderBy: "created_at", ascending: false });
      setPosts((data as any[]).map(p => ({
        id: p.id, title: p.title, slug: p.slug, published: p.published,
        created_at: p.created_at, tags: p.tags,
      })));
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to fetch blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postToDelete);
        
      if (error) throw error;
      
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setPostToDelete(null);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const columns = getBlogListColumns({ onDeleteClick: handleDeleteClick });

  return (
    <div className="space-y-6">
      <BlogListHeader 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

      <DataTable 
        columns={columns} 
        data={filteredPosts} 
        isLoading={isLoading} 
        emptyMessage={searchQuery ? "No posts match your search" : "No blog posts found. Create your first post!"}
      />

      <ConfirmDialog
        open={!!postToDelete}
        onOpenChange={(isOpen) => !isOpen && setPostToDelete(null)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeletePost}
        destructive
      />
    </div>
  );
}
