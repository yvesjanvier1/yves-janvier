
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/dashboard/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
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
        toast.error("Title and content are required");
        setIsSaving(false);
        return;
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      
      if (error.code === "23505") { // Unique violation error code
        toast.error("A post with this slug already exists. Please use a different slug.");
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} post: ${error.message}`);
      }
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading post data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            required
            placeholder="Post title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="post-url-slug"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief summary of the post"
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Post content (Markdown supported)"
            rows={12}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cover_image">Cover Image URL</Label>
          <Input
            id="cover_image"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag}>Add</Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="published">Publish this post</Label>
        </div>
        
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
