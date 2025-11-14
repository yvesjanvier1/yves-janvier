import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PortfolioForm } from "@/components/dashboard/portfolio/PortfolioForm";
import { PortfolioProjectFormData, ProjectLink } from "@/types/portfolio";

const PortfolioFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<PortfolioProjectFormData | null>(null);

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
            // Convert links from JSON to ProjectLink[]
            const links: ProjectLink[] = Array.isArray(data.links) 
              ? data.links.map((link: any) => ({
                  title: link.title || '',
                  url: link.url || ''
                }))
              : [];

            setInitialData({
              title: data.title,
              slug: data.slug,
              description: data.description,
              category: data.category || "",
              tech_stack: data.tech_stack || [],
              images: data.images || [],
              links,
              featured: data.featured || false,
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

  const handleSubmit = async (formData: PortfolioProjectFormData) => {
    try {
      const { formatPortfolioProjectData, supabaseInsert, supabaseUpdate } = await import("@/lib/supabase-helpers");
      
      if (isEditing) {
        await supabaseUpdate("portfolio_projects", id!, formData, formatPortfolioProjectData);
        toast.success("Project updated successfully");
      } else {
        await supabaseInsert("portfolio_projects", formData, formatPortfolioProjectData);
        toast.success("Project created successfully");
      }
      
      navigate("/dashboard/portfolio");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/portfolio")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit" : "Create"} Portfolio Project
        </h1>
      </div>

      <PortfolioForm
        id={id}
        initialData={initialData || undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default PortfolioFormPage;
