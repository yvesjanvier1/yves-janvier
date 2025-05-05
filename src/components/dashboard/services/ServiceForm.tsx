
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ServiceData {
  title: string;
  description: string;
  icon: string;
}

interface ServiceFormProps {
  id?: string;
  initialData?: ServiceData;
  isLoading?: boolean;
  onSubmit: (data: ServiceData) => Promise<void>;
}

export function ServiceForm({ id, initialData, isLoading, onSubmit }: ServiceFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<ServiceData>({
    title: "",
    description: "",
    icon: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!formData.title || !formData.description) {
        throw new Error("Title and description are required");
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving service:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading service data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="title" label="Title" required>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Service title"
          />
        </FormField>
        
        <FormField id="description" label="Description" required>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Service description"
            rows={4}
          />
        </FormField>
        
        <FormField id="icon" label="Icon (optional)">
          <Input
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="Icon name or URL"
          />
        </FormField>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/dashboard/services")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
