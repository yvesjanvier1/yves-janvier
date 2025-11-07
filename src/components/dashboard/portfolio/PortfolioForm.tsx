import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { TechStackField } from "./form/tech-stack-field";
import { LinkField } from "./form/link-field";
import { ImageField } from "./form/image-field";
import { toast } from "sonner";
import { PortfolioProjectFormData, ProjectLink } from "@/types/portfolio";

interface PortfolioFormProps {
  id?: string;
  initialData?: PortfolioProjectFormData;
  isLoading?: boolean;
  onSubmit: (data: PortfolioProjectFormData) => Promise<void>;
}

export function PortfolioForm({ id, initialData, isLoading, onSubmit }: PortfolioFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!id;

  const [formData, setFormData] = useState<PortfolioProjectFormData>({
    title: "",
    slug: "",
    description: "",
    category: "",
    tech_stack: [],
    images: [],
    links: [],
    featured: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing || prev.slug === ""
        ? title.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-")
        : prev.slug,
    }));
  };

  const addTechnology = (tech: string) => {
    if (!formData.tech_stack?.includes(tech)) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...(prev.tech_stack || []), tech],
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack?.filter((t) => t !== tech) || [],
    }));
  };

  const addImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const addLink = (link: ProjectLink) => {
    setFormData((prev) => ({
      ...prev,
      links: [...(prev.links || []), link],
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} project`);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading project data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="title" label="Title" required error="">
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Project Title"
            required
          />
        </FormField>

        <FormField id="slug" label="Slug" required error="">
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="project-slug"
            required
          />
        </FormField>

        <FormField id="category" label="Category" error="">
          <Input
            id="category"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            placeholder="Web Development, Mobile App, etc."
          />
        </FormField>

        <FormField id="description" label="Description" required error="">
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Project description"
            rows={4}
            required
          />
        </FormField>

        <TechStackField
          techStack={formData.tech_stack || []}
          onAddTech={addTechnology}
          onRemoveTech={removeTechnology}
        />

        <ImageField
          images={formData.images || []}
          onAddImage={addImage}
          onRemoveImage={(url) => {
            const index = formData.images?.indexOf(url) ?? -1;
            if (index !== -1) removeImage(index);
          }}
        />

        <LinkField
          links={formData.links || []}
          onAddLink={addLink}
          onRemoveLink={(link) => {
            const index = formData.links?.findIndex(l => l.url === link.url && l.title === link.title) ?? -1;
            if (index !== -1) removeLink(index);
          }}
        />

        <FormField id="featured" label="Featured Project" error="">
          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={handleSwitchChange}
            />
            <span className="text-sm text-muted-foreground">
              Show this project on the homepage
            </span>
          </div>
        </FormField>

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
  );
}
