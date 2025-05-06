
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectLink {
  title: string;
  url: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  tech_stack: string[];
  featured: boolean;
  images?: string[];
  coverImage?: string;
  links?: ProjectLink[];
}

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data) {
          // Transform the data to match the expected format
          const formattedProjects = data.map((project) => {
            // Handle links data appropriately
            let formattedLinks: ProjectLink[] = [];
            if (project.links) {
              // Type assertion to handle potential different formats
              if (Array.isArray(project.links)) {
                formattedLinks = project.links.map((link: any) => ({
                  title: link.title || "Link",
                  url: link.url || "#"
                }));
              } else if (typeof project.links === 'object' && project.links !== null) {
                const linksObj = project.links as Record<string, any>;
                formattedLinks = Object.entries(linksObj).map(([title, url]) => ({ 
                  title, 
                  url: typeof url === 'string' ? url : '' 
                }));
              }
            }
            
            return {
              id: project.id,
              title: project.title,
              description: project.description,
              slug: project.slug,
              category: project.category || "",
              tech_stack: project.tech_stack || [],
              featured: project.featured || false,
              coverImage: project.images && project.images.length > 0 ? project.images[0] : "/placeholder.svg",
              links: formattedLinks
            };
          });
          
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error);
        setError("Failed to load featured projects");
        toast.error("Failed to load featured projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (error) {
    return (
      <section className="section">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title="Featured Projects"
            subtitle="Showcasing some of my best work and achievements"
            centered
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="Featured Projects"
          subtitle="Showcasing some of my best work and achievements"
          centered
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button asChild variant="secondary">
                      <Link to={`/portfolio/${project.slug}`}>View Project</Link>
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-2">
                    {project.category && (
                      <span 
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                      >
                        {project.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{project.description.substring(0, 150)}...</p>
                  <Link 
                    to={`/portfolio/${project.slug}`}
                    className="text-primary font-medium inline-flex items-center hover:underline"
                  >
                    Read Case Study
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No featured projects found.</p>
            <p className="text-sm text-muted-foreground">Check back later for updates.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">View All Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
