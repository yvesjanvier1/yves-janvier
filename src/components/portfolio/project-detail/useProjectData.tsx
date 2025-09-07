
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { secureLog } from "@/lib/security";
import { useLanguage } from "@/contexts/LanguageContext";

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
  locale?: string;
}

export const useProjectData = (id: string | undefined) => {
  const { language, t } = useLanguage();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to fetch by slug with language preference
        let { data, error } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("slug", id)
          .or(`locale.eq.${language},locale.is.null`)
          .order('locale', { ascending: false }) // Prefer current language
          .maybeSingle();

        if (!data && !error) {
          // If no project found by slug, try by id
          ({ data, error } = await supabase
            .from("portfolio_projects")
            .select("*")
            .eq("id", id)
            .or(`locale.eq.${language},locale.is.null`)
            .order('locale', { ascending: false })
            .maybeSingle());
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
          setError(t('portfolio.noProjectsFound'));
          toast.error(t('portfolio.noProjectsFound'));
        }
      } catch (err) {
        setError(t('common.error'));
        toast.error(t('common.error'));
        secureLog.error('Project fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id, language, t]);

  return { project, isLoading, error };
};
