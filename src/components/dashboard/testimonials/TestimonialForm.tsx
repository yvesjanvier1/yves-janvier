
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TestimonialData {
  name: string;
  position: string;
  testimonial: string;
  image: string;
}

interface TestimonialFormProps {
  id?: string;
  initialData?: TestimonialData;
  isLoading?: boolean;
  onSubmit: (data: TestimonialData) => Promise<void>;
}

export function TestimonialForm({ id, initialData, isLoading, onSubmit }: TestimonialFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<TestimonialData>({
    name: "",
    position: "",
    testimonial: "",
    image: ""
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
      if (!formData.name || !formData.position || !formData.testimonial) {
        throw new Error("Name, position, and testimonial are required");
      }

      await onSubmit(formData);
      
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading testimonial data...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField id="name" label="Name" required>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Client name"
          />
        </FormField>
        
        <FormField id="position" label="Position" required>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            placeholder="Client position and company"
          />
        </FormField>
        
        <FormField id="testimonial" label="Testimonial" required>
          <Textarea
            id="testimonial"
            name="testimonial"
            value={formData.testimonial}
            onChange={handleChange}
            required
            placeholder="Client testimonial"
            rows={5}
          />
        </FormField>
        
        <FormField id="image" label="Profile Image URL">
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </FormField>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/dashboard/testimonials")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Update Testimonial" : "Create Testimonial"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
