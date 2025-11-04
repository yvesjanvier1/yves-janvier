
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { secureLog } from "@/lib/security";

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

export const useProjectData = (id: string | undefined) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure locale is set for RLS before querying
        const lang = localStorage.getItem('language') || 'fr';
        await (supabase.rpc as any)('set_current_locale', { _locale: lang });
        
        // First try to fetch by slug
        let { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("slug", id)
          .maybeSingle();

        if (!data && !error) {
          // If no project found by slug, try by id only if UUID
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
          if (isUuid) {
            ({ data, error } = await supabase
              .from("portfolio_projects")
              .select("*")
              .eq("id", id)
              .maybeSingle());
          }
        }
        
        if (error) {
          secureLog.error('Failed to fetch project', error);
          throw error;
        }
        
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
              secureLog.warn('Failed to format project links', err);
            }
          }
          
          setProject({
            ...data,
            links: formattedLinks
          });
          secureLog.info('Project loaded successfully');
        } else {
          setError("Project not found");
          toast.error("Project not found");
        }
      } catch (err) {
        setError("Failed to load project details");
        toast.error("Failed to load project details");
        secureLog.error('Project fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  return { project, isLoading, error };
};
