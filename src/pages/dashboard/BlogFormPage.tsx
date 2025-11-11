
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/dashboard/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BlogForm } from "@/components/dashboard/blog/BlogForm";
import { ArrowLeft } from "lucide-react";
import { BlogPostFormData } from "@/types/blog";

const BlogFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<BlogPostFormData | null>(null);

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

  const handleSubmit = async (formData: BlogPostFormData) => {
    try {
      const baseData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || "",
        cover_image: formData.cover_image || "",
        published: formData.published,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        locale: 'fr'
      };
      
      let result;
      
      if (isEditing) {
        // For updates, don't send author_id or created_at
        result = await supabase
          .from("blog_posts")
          .update({
            ...baseData,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);
      } else {
        // For inserts, include author_id
        result = await supabase
          .from("blog_posts")
          .insert([{
            ...baseData,
            author_id: user?.id
          }]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(`Post ${isEditing ? "updated" : "created"} successfully`);
      navigate("/dashboard/blog");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("A post with this slug already exists. Please use a different slug.");
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} post: ${error.message}`);
      }
      throw error;
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
