
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { Json } from "@/integrations/supabase/types";
import { FormHeader } from "@/components/dashboard/portfolio/form/form-header";
import { TechStackField } from "@/components/dashboard/portfolio/form/tech-stack-field";
import { ImageField } from "@/components/dashboard/portfolio/form/image-field";
import { LinkField } from "@/components/dashboard/portfolio/form/link-field";

interface ProjectLink {
  title: string;
  url: string;
}

interface PortfolioProjectData {
  title: string;
  slug: string;
  description: string;
  category: string;
  tech_stack: string[];
  links: ProjectLink[];
  images: string[];
  featured: boolean;
}

const PortfolioFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<PortfolioProjectData>({
    title: "",
    slug: "",
    description: "",
    category: "",
    tech_stack: [],
    links: [],
    images: [],
    featured: false
  });

  useEffect(() => {
    if (isEditing) {
      const fetchProject = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("portfolio_projects")
            .select("*")
            .eq("id", id)
            .single();
            
          if (error) throw error;
          if (data) {
            // Parse the links JSON as ProjectLink array
            const links = Array.isArray(data.links) 
              ? data.links.map((link: any) => ({
                  title: link.title || '',
                  url: link.url || ''
                }))
              : [];
              
            setFormData({
              ...data,
              links
            });
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast.error("Failed to fetch project");
          navigate("/dashboard/portfolio");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProject();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, featured: checked }));
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

  const addTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: [...prev.tech_stack, tech]
    }));
  };

  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(tech => tech !== techToRemove)
    }));
  };

  const addImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, image]
    }));
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  const addLink = (link: ProjectLink) => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, link]
    }));
  };

  const removeLink = (linkToRemove: ProjectLink) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter(link => !(link.title === linkToRemove.title && link.url === linkToRemove.url))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!formData.title || !formData.description) {
        toast.error("Title and description are required");
        return;
      }

      const projectData = {
        ...formData,
        // Convert links array to JSON compatible format for Supabase
        links: formData.links as unknown as Json,
        updated_at: new Date().toISOString() // Convert Date to ISO string
      };
      
      let result;
      
      if (isEditing) {
        result = await supabase
          .from("portfolio_projects")
          .update(projectData)
          .eq("id", id);
      } else {
        result = await supabase
          .from("portfolio_projects")
          .insert([projectData]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(`Project ${isEditing ? "updated" : "created"} successfully`);
      navigate("/dashboard/portfolio");
    } catch (error: any) {
      console.error("Error saving project:", error);
      
      if (error.code === "23505") { // Unique violation error code
        toast.error("A project with this slug already exists. Please use a different slug.");
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} project: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading project data...</div>;
  }

  return (
    <div className="space-y-6">
      <FormHeader isEditing={isEditing} />
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField id="title" label="Title" required>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              placeholder="Project title"
            />
          </FormField>
          
          <FormField id="slug" label="Slug" required>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="project-url-slug"
            />
          </FormField>
          
          <FormField id="category" label="Category">
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Web Development, Data Analytics"
            />
          </FormField>
          
          <FormField id="description" label="Description" required>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Project description (Markdown supported)"
              rows={8}
            />
          </FormField>
          
          <TechStackField 
            techStack={formData.tech_stack}
            onAddTech={addTechnology}
            onRemoveTech={removeTechnology}
          />
          
          <LinkField 
            links={formData.links}
            onAddLink={addLink}
            onRemoveLink={removeLink}
          />
          
          <ImageField 
            images={formData.images}
            onAddImage={addImage}
            onRemoveImage={removeImage}
          />
          
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="featured">Feature this project</Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard/portfolio")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PortfolioFormPage;
