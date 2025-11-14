
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TestimonialForm } from "@/components/dashboard/testimonials/TestimonialForm";
import { ArrowLeft } from "lucide-react";

interface TestimonialData {
  name: string;
  position: string;
  testimonial: string;
  image: string;
}

const TestimonialsFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<TestimonialData | undefined>();

  useEffect(() => {
    if (isEditing) {
      const fetchTestimonial = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .eq("id", id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setInitialData({
              name: data.name,
              position: data.position,
              testimonial: data.testimonial,
              image: data.image || ""
            });
          }
        } catch (error) {
          console.error("Error fetching testimonial:", error);
          toast.error("Failed to fetch testimonial");
          navigate("/dashboard/testimonials");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTestimonial();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (formData: TestimonialData) => {
    try {
      const { formatTestimonialData, supabaseInsert, supabaseUpdate } = await import("@/lib/supabase-helpers");
      
      if (isEditing) {
        await supabaseUpdate("testimonials", id!, formData, formatTestimonialData);
        toast.success("Testimonial updated successfully");
      } else {
        await supabaseInsert("testimonials", formData, formatTestimonialData);
        toast.success("Testimonial created successfully");
      }
      
      navigate("/dashboard/testimonials");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/testimonials")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Testimonials
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit" : "Create"} Testimonial</h1>
      </div>
      
      <TestimonialForm 
        id={id} 
        initialData={initialData} 
        isLoading={isLoading} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default TestimonialsFormPage;
