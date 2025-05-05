
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ExperienceData {
  id?: string;
  year_range: string;
  role: string;
  company: string;
  description: string;
}

interface ExperienceFormProps {
  experience: ExperienceData | null;
  isLoading: boolean;
  onSubmit: (data: ExperienceData) => Promise<void>;
  onCancel: () => void;
}

export function ExperienceForm({ experience, isLoading, onSubmit, onCancel }: ExperienceFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!experience?.id;
  
  const [formData, setFormData] = useState<ExperienceData>({
    year_range: "",
    role: "",
    company: "",
    description: ""
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        id: experience.id,
        year_range: experience.year_range,
        role: experience.role,
        company: experience.company,
        description: experience.description
      });
    }
  }, [experience]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!formData.year_range || !formData.role || !formData.company || !formData.description) {
        throw new Error("All fields are required");
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving experience:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading experience data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="year_range" label="Year Range" required>
          <Input
            id="year_range"
            name="year_range"
            value={formData.year_range}
            onChange={handleChange}
            required
            placeholder="2020 - Present"
          />
        </FormField>
        
        <FormField id="role" label="Role" required>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            placeholder="Job title"
          />
        </FormField>
        
        <FormField id="company" label="Company" required>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            placeholder="Company name"
          />
        </FormField>
        
        <FormField id="description" label="Description" required>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Job description"
            rows={4}
          />
        </FormField>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Update Experience" : "Add Experience"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
