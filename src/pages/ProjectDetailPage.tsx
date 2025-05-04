import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Json } from "@/integrations/supabase/types";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tech_stack: string[];
  featured: boolean;
  created_at: string;
  images: string[];
  links?: {
    title: string;
    url: string;
  }[];
}

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError("Project not found");
          return;
        }

        // Format links from JSON
        let formattedLinks: { title: string; url: string }[] = [];
        
        if (data.links) {
          if (Array.isArray(data.links)) {
            formattedLinks = data.links.map(link => {
              if (typeof link === 'object' && link !== null) {
                return {
                  title: String(link.title || ''),
                  url: String(link.url || '')
                };
              }
              return { title: 'Link', url: String(link) };
            });
          } else if (typeof data.links === 'object' && data.links !== null) {
            formattedLinks = Object.entries(data.links).map(([title, url]) => ({ 
              title, 
              url: String(url) 
            }));
          }
        }

        setProject({
          ...data,
          links: formattedLinks
        });
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container px-4 py-16 md:py-24 mx-auto">
        <SectionHeader title={<Skeleton className="h-8 w-80" />} subtitle={<Skeleton className="h-6 w-64" />} centered />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <Skeleton className="h-64" />
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-16 md:py-24 mx-auto text-center">
        <SectionHeader title="Error" subtitle={error} centered />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container px-4 py-16 md:py-24 mx-auto text-center">
        <SectionHeader title="Project Not Found" subtitle="The requested project could not be found." centered />
      </div>
    );
  }

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <div className="mb-8">
        <Link to="/portfolio" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolio
        </Link>
      </div>

      <SectionHeader title={project.title} subtitle={project.description.substring(0, 150) + "..."} centered />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div>
          {project.images && project.images.length > 0 ? (
            <img src={project.images[0]} alt={project.title} className="w-full rounded-md shadow-md" />
          ) : (
            <div className="bg-secondary rounded-md aspect-video flex items-center justify-center text-secondary-foreground">
              No Image Available
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Project Details</h3>
          <p className="text-muted-foreground mb-6">{project.description}</p>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Category</h4>
            <Badge>{project.category}</Badge>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Technologies Used</h4>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack && project.tech_stack.map((tech, index) => (
                <Badge key={index} variant="secondary">{tech}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Links</h4>
            <div className="flex flex-col gap-2">
              {project.links && project.links.map((link, index) => (
                <Button key={index} asChild variant="outline">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full">
                    {link.title}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
