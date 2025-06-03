
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeader } from "@/components/ui/section-header";
import ProjectCard from "@/components/portfolio/project-card";
import ProjectFilters from "@/components/portfolio/project-filters";
import { AnimatedSection } from "@/components/ui/animated-section";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category?: string;
  tech_stack?: string[];
  links?: {
    title?: string;
    url?: string;
  }[];
  featured: boolean;
  created_at: string;
}

const PortfolioPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  
  const [categories, setCategories] = useState<string[]>(["All"]);
  const activeCategory = searchParams.get("category") || "All";
  const searchValue = searchParams.get("search") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let query = supabase
          .from("portfolio_projects")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply category filter
        if (activeCategory !== "All") {
          query = query.eq("category", activeCategory);
        }

        // Apply search filter
        if (searchValue) {
          query = query.or(`title.ilike.%${searchValue}%,description.ilike.%${searchValue}%`);
        }

        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const processedProjects = data.map(project => ({
            ...project,
            links: Array.isArray(project.links) 
              ? project.links 
              : (typeof project.links === 'string' 
                  ? JSON.parse(project.links) 
                  : (project.links || []))
          }));
          
          setProjects(processedProjects);
          
          // Extract unique categories from all projects
          const { data: allProjects } = await supabase
            .from("portfolio_projects")
            .select("category");
          
          if (allProjects) {
            const allCategories = ["All"];
            allProjects.forEach(project => {
              if (project.category && !allCategories.includes(project.category)) {
                allCategories.push(project.category);
              }
            });
            
            setCategories(allCategories);
          }
        }
      } catch (err) {
        setError("Failed to load projects");
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [activeCategory, searchValue]);

  const handleCategoryChange = (category: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (category === "All") {
        newParams.delete("category");
      } else {
        newParams.set("category", category);
      }
      return newParams;
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (search) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }
      return newParams;
    });
  };

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <AnimatedSection>
        <SectionHeader
          title={t('portfolio.title')}
          subtitle={t('portfolio.subtitle')}
          centered
        />
      </AnimatedSection>
      
      <AnimatedSection delay={0.2}>
        <ProjectFilters 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
      </AnimatedSection>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="flex flex-col h-full">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      ) : error ? (
        <AnimatedSection>
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">{t('common.error')}</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              {t('common.retry')}
            </button>
          </div>
        </AnimatedSection>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <AnimatedSection
              key={project.id}
              delay={index * 0.1}
              className="h-full"
            >
              <ProjectCard 
                project={{
                  id: project.slug || project.id,
                  title: project.title,
                  description: project.description,
                  image: project.images && project.images.length > 0 
                    ? project.images[0] 
                    : "/placeholder.svg",
                  tags: project.tech_stack || [],
                  category: project.category || "Project"
                }}
              />
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">{t('portfolio.noProjectsFound')}</h3>
            <p className="text-muted-foreground">
              {t('portfolio.noProjectsMessage')}
            </p>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
};

export default PortfolioPage;
