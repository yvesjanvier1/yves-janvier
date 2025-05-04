
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFields } from "./blog-form/FormFields";

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
  tags: string[];
}

interface BlogFormProps {
  id?: string;
  initialData?: BlogPostData;
  isLoading?: boolean;
  onSubmit: (data: BlogPostData) => Promise<void>;
}

export function BlogForm({ id, initialData, isLoading, onSubmit }: BlogFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<BlogPostData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    published: false,
    tags: []
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, published: checked }));
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      title,
      // Only auto-generate slug if we're not editing or the slug is empty
      slug: (!isEditing || prev.slug === '') ? title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!formData.title || !formData.content) {
        throw new Error("Title and content are required");
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading post data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormFields 
          formData={formData}
          isEditing={isEditing}
          handleChange={handleChange}
          handleSwitchChange={handleSwitchChange}
          handleTitleChange={handleTitleChange}
          addTag={addTag}
          removeTag={removeTag}
        />
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/dashboard/blog")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
