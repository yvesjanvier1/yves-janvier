
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AboutFormData {
  bio: string;
  profile_image: string;
  resume_url: string;
}

interface AboutFormProps {
  initialData: AboutFormData | null;
  isLoading: boolean;
  onSubmit: (data: AboutFormData) => Promise<void>;
}

export function AboutForm({ initialData, isLoading, onSubmit }: AboutFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<AboutFormData>({
    bio: "",
    profile_image: "",
    resume_url: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        bio: initialData.bio || "",
        profile_image: initialData.profile_image || "",
        resume_url: initialData.resume_url || ""
      });
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
      if (!formData.bio) {
        throw new Error("Bio is required");
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving about data:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading about page data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="bio" label="Bio" required>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            required
            placeholder="Professional bio (supports line breaks)"
            rows={8}
          />
        </FormField>
        
        <FormField id="profile_image" label="Profile Image URL">
          <Input
            id="profile_image"
            name="profile_image"
            value={formData.profile_image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </FormField>
        
        <FormField id="resume_url" label="Resume URL">
          <Input
            id="resume_url"
            name="resume_url"
            value={formData.resume_url}
            onChange={handleChange}
            placeholder="URL to downloadable resume file"
          />
        </FormField>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Update About Page"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
