
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";

interface SkillData {
  id?: string;
  category: string;
  items: string[];
}

interface SkillFormProps {
  skill: SkillData | null;
  isLoading: boolean;
  onSubmit: (data: SkillData) => Promise<void>;
  onCancel: () => void;
}

export function SkillForm({ skill, isLoading, onSubmit, onCancel }: SkillFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!skill?.id;
  
  const [formData, setFormData] = useState<SkillData>({
    category: "",
    items: []
  });

  useEffect(() => {
    if (skill) {
      setFormData({
        id: skill.id,
        category: skill.category,
        items: skill.items
      });
    }
  }, [skill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkillItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  const removeSkillItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!formData.category) {
        throw new Error("Category is required");
      }

      if (formData.items.length === 0) {
        throw new Error("At least one skill item is required");
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving skill:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading skill data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="category" label="Category" required>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Skill category"
          />
        </FormField>
        
        <FormField id="items" label="Skills" required>
          <TagInput
            tags={formData.items}
            onAddTag={addSkillItem}
            onRemoveTag={removeSkillItem}
            placeholder="Add skill"
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
            {isSaving ? "Saving..." : isEditing ? "Update Skill" : "Add Skill"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
