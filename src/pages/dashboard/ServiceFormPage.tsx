
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/dashboard/services/ServiceForm";
import { ArrowLeft } from "lucide-react";

interface ServiceData {
  title: string;
  description: string;
  icon: string;
}

const ServiceFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<ServiceData | undefined>();

  useEffect(() => {
    if (isEditing) {
      const fetchService = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("id", id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setInitialData({
              title: data.title,
              description: data.description,
              icon: data.icon || ""
            });
          }
        } catch (error) {
          console.error("Error fetching service:", error);
          toast.error("Failed to fetch service");
          navigate("/dashboard/services");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchService();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (formData: ServiceData) => {
    try {
      const { formatServiceData, supabaseInsert, supabaseUpdate } = await import("@/lib/supabase-helpers");
      
      if (isEditing) {
        await supabaseUpdate("services", id!, formData, formatServiceData);
        toast.success("Service updated successfully");
      } else {
        await supabaseInsert("services", formData, formatServiceData);
        toast.success("Service created successfully");
      }
      
      navigate("/dashboard/services");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/services")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit" : "Create"} Service</h1>
      </div>
      
      <ServiceForm 
        id={id} 
        initialData={initialData} 
        isLoading={isLoading} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ServiceFormPage;
