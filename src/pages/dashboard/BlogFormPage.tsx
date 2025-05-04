
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/dashboard/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BlogForm } from "@/components/dashboard/blog/BlogForm";
import { ArrowLeft } from "lucide-react";

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
  tags: string[];
}

const BlogFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<BlogPostData | null>(null);

  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("id", id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setInitialData({
              title: data.title,
              slug: data.slug,
              content: data.content,
              excerpt: data.excerpt || "",
              cover_image: data.cover_image || "",
              published: data.published || false,
              tags: data.tags || []
            });
          }
        } catch (error) {
          console.error("Error fetching blog post:", error);
          toast.error("Failed to fetch blog post");
          navigate("/dashboard/blog");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPost();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (formData: BlogPostData) => {
    try {
      const postData = {
        ...formData,
        author_id: user?.id,
        updated_at: new Date().toISOString() // Convert Date to ISO string
      };
      
      let result;
      
      if (isEditing) {
        result = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", id);
      } else {
        result = await supabase
          .from("blog_posts")
          .insert([postData]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(`Post ${isEditing ? "updated" : "created"} successfully`);
      navigate("/dashboard/blog");
    } catch (error: any) {
      if (error.code === "23505") { // Unique violation error code
        toast.error("A post with this slug already exists. Please use a different slug.");
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} post: ${error.message}`);
      }
      throw error; // Rethrow to be handled by the form
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit" : "Create"} Blog Post</h1>
      </div>
      
      <BlogForm 
        id={id} 
        initialData={initialData || undefined} 
        isLoading={isLoading} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BlogFormPage;
