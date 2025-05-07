
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    {links && links.length > 0 && links.map((link, index) => (
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log(`ProjectDetailPage: Fetching project with id/slug: ${id}`);
        
        // First try to fetch by slug
        let { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("slug", id)
          .maybeSingle();

        if (!data && !error) {
          console.log("ProjectDetailPage: No project found by slug, trying by ID");
          // If no project found by slug, try by id
          ({ data, error } = await supabase
            .from("portfolio_projects")
            .select("*")
            .eq("id", id)
            .maybeSingle());
        }
        
        if (error) {
          console.error("ProjectDetailPage: Supabase error:", error);
          throw error;
        }
        
        console.log("ProjectDetailPage: Project data:", data);
        
        if (data) {
          // Format links if they exist
          let formattedLinks: ProjectLink[] = [];
          
          if (data.links) {
            try {
              if (Array.isArray(data.links)) {
                formattedLinks = data.links.map(link => {
                  if (typeof link === 'object' && link !== null && 'title' in link && 'url' in link) {
                    return {
                      title: String(link.title || 'Link'),
                      url: String(link.url || '#')
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
            } catch (err) {
              console.error("ProjectDetailPage: Error formatting links:", err);
            }
          }
          
          setProject({
            ...data,
            links: formattedLinks
          });
        } else {
          // No project found
          console.error("ProjectDetailPage: No project found with this ID/slug");
          setError("Project not found");
          toast.error("Project not found");
        }
      } catch (err) {
        console.error("ProjectDetailPage: Error fetching project:", err);
        setError("Failed to load project details");
        toast.error("Failed to load project details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="container py-16 mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
        
        <Card className="p-6">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-32 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
          
          <Skeleton className="h-8 w-48 mb-3" />
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
        
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/portfolio")}>
            Return to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-16 mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
        
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/portfolio")}>
            Return to Portfolio
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
