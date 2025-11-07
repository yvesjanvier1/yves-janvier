
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFields } from "./blog-form/FormFields";
import { blogPostSchema, sanitizeError } from "@/lib/security";
import { z } from "zod";
import { toast } from "sonner";
import { BlogPostFormData } from "@/types/blog";

interface BlogFormProps {
  id?: string;
  initialData?: BlogPostFormData;
  isLoading?: boolean;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
}

export function BlogForm({ id, initialData, isLoading, onSubmit }: BlogFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<BlogPostFormData>({
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
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, published: checked }));
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 10) {
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      title,
      slug: (!isEditing || prev.slug === '') ? title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : prev.slug
    }));
    
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      blogPostSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the validation errors");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast.error(sanitizeError(error));
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
          validationErrors={validationErrors}
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
