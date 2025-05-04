
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tech_stack: string[];
  images: string[];
  links: {
    title: string;
    url: string;
  }[];
  created_at: string;
}

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          // Parse links from JSON if necessary
          const links = Array.isArray(data.links) 
            ? data.links
            : typeof data.links === 'object' && data.links !== null
              ? Object.entries(data.links).map(([title, url]) => ({ title, url }))
              : [];

          setProject({
            ...data,
            links
          });
        } else {
          // No project found
          navigate("/portfolio");
          toast.error("Project not found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
        navigate("/portfolio");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  const nextImage = () => {
    if (!project || !project.images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = () => {
    if (!project || !project.images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl px-4 py-16 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="container max-w-6xl px-4 py-16 mx-auto">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{project.title}</h1>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{project.category}</Badge>
            {project.tech_stack && project.tech_stack.map((tech) => (
              <Badge key={tech} variant="outline">{tech}</Badge>
            ))}
          </div>
          
          {project.images && project.images.length > 0 && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img 
                src={project.images[currentImageIndex]} 
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {project.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {project.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? "bg-primary" : "bg-muted"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              {project.images.length > 1 && (
                <>
                  <button
                    className="absolute top-1/2 left-4 -translate-y-1/2 bg-background/80 rounded-full p-2"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute top-1/2 right-4 -translate-y-1/2 bg-background/80 rounded-full p-2"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <ArrowLeft className="h-5 w-5 transform rotate-180" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: project.description.replace(/\n/g, '<br />') }} />
          </div>

          {project.links && project.links.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Project Links</h3>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link, index) => (
                  <Button key={index} variant="outline" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <Link2 className="mr-2 h-4 w-4" />
                      {link.title}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
