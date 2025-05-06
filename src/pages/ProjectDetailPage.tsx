
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectLink {
  title: string;
  url: string;
}

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  category?: string;
  tech_stack?: string[];
  created_at: string;
  images?: string[];
  links?: ProjectLink[];
}

const ProjectHeader = ({ title, category }: { title: string; category?: string }) => (
  <div className="mb-6">
    <h1 className="text-4xl font-bold">{title}</h1>
    {category && <Badge className="mt-2">{category}</Badge>}
  </div>
);

const ProjectGallery = ({ images }: { images?: string[] }) => (
  <div className="mb-8">
    {images && images.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Project image ${index + 1}`}
            className="rounded-md object-cover w-full"
            style={{ maxHeight: "400px" }}
          />
        ))}
      </div>
    )}
  </div>
);

const ProjectLinks = ({ links }: { links?: ProjectLink[] }) => (
  <div className="flex flex-wrap gap-3 mb-6">
    {links && links.map((link, index) => (
      <Button key={index} variant="outline" size="sm" asChild>
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <LinkIcon className="mr-2 h-4 w-4" />
          {link.title}
        </a>
      </Button>
    ))}
  </div>
);

const TechStack = ({ technologies }: { technologies?: string[] }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-3">Technologies</h3>
    <div className="flex flex-wrap gap-2">
      {technologies && technologies.map((tech, index) => (
        <Badge key={index} variant="secondary">{tech}</Badge>
      ))}
    </div>
  </div>
);

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // First try to fetch by slug
        let { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("slug", id)
          .maybeSingle();

        if (!data && !error) {
          // If no project found by slug, try by id
          ({ data, error } = await supabase
            .from("portfolio_projects")
            .select("*")
            .eq("id", id)
            .maybeSingle());
        }
        
        if (error) throw error;
        
        if (data) {
          // Format links if they exist
          let formattedLinks: ProjectLink[] = [];
          
          if (data.links) {
            if (Array.isArray(data.links)) {
              formattedLinks = data.links.map(link => {
                if (typeof link === 'object' && link !== null && 'title' in link && 'url' in link) {
                  return {
                    title: String(link.title || ''),
                    url: String(link.url || '')
                  };
                }
                return { title: 'Link', url: String(link) };
              });
            } else if (typeof data.links === 'object' && data.links !== null) {
              formattedLinks = Object.entries(data.links as Record<string, any>).map(([title, url]) => ({ 
                title, 
                url: String(url) 
              }));
            }
          }
          
          setProject({
            ...data,
            links: formattedLinks
          });
        } else {
          // No project found
          toast.error("Project not found");
          navigate("/portfolio");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project details");
        navigate("/portfolio");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="container py-16 mx-auto">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-16 mx-auto">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16 mx-auto">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/portfolio">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolio
        </Link>
      </Button>
      
      <Card className="p-6">
        <ProjectHeader title={project.title} category={project.category} />
        
        <ProjectGallery images={project.images} />
        
        <ProjectLinks links={project.links} />
        
        <TechStack technologies={project.tech_stack} />
        
        <div className="prose dark:prose-invert max-w-none">
          {project.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
