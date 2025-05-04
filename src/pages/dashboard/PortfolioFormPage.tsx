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
import { ArrowLeft, Plus, Trash2, Link2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types"; // Import the Json type from Supabase types

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

  const [techInput, setTechInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

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

  const addTechnology = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(tech => tech !== techToRemove)
    }));
  };

  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput("");
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  const addLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { title: linkTitle.trim(), url: linkUrl.trim() }]
      }));
      setLinkTitle("");
      setLinkUrl("");
    }
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/portfolio")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit" : "Create"} Portfolio Project</h1>
      </div>
      
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
              placeholder="Project title"
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
              placeholder="project-url-slug"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Web Development, Data Analytics"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Project description (Markdown supported)"
              rows={8}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tech_stack">Technologies Used</Label>
            <div className="flex gap-2">
              <Input
                id="techInput"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
              />
              <Button type="button" onClick={addTechnology}>Add</Button>
            </div>
            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tech_stack.map((tech, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1">
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Links</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Link title (e.g. GitHub, Demo)"
              />
              <div className="flex gap-2">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL (https://...)"
                />
                <Button type="button" onClick={addLink} className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {formData.links.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      <span className="font-medium">{link.title}:</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline truncate max-w-[200px]"
                      >
                        {link.url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(link)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <div className="flex gap-2">
              <Input
                id="imageInput"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Image URL (https://...)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button type="button" onClick={addImage}>Add</Button>
            </div>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group rounded-md overflow-hidden">
                    <img
                      src={image}
                      alt={`Project image ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
