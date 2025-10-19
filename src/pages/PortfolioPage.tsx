
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/portfolio/project-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ProjectSkeleton } from "@/components/ui/loading-skeletons";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  locale?: string;
}

const PortfolioPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const selectedCategory = searchParams.get("category") || "all";
  const selectedTag = searchParams.get("tag") || "all";
  const sortBy = searchParams.get("sort") || "featured";
  const searchTerm = searchParams.get("search") || "";
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedTag, sortBy, searchTerm, language]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use atomic RPC function - sets locale and queries in same transaction
      const { data, error } = await (supabase.rpc as any)('set_locale_and_get_portfolio_projects', {
        _locale: language,
        _limit: 1000, // Get all for client-side filtering
        _offset: 0,
        _category: selectedCategory !== "all" ? selectedCategory : null,
        _featured: null
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        let filteredData = data;

        // Client-side tag filter
        if (selectedTag !== "all") {
          filteredData = filteredData.filter((p: any) => 
            p.tech_stack && Array.isArray(p.tech_stack) && p.tech_stack.includes(selectedTag)
          );
        }

        // Client-side search filter
        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          filteredData = filteredData.filter((p: any) =>
            p.title?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
          );
        }

        // Client-side sorting
        let sortedData = [...filteredData];
        if (sortBy === "date") {
          sortedData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === "title") {
          sortedData.sort((a: any, b: any) => a.title.localeCompare(b.title));
        } else if (sortBy === "featured") {
          sortedData.sort((a: any, b: any) => {
            if (a.featured === b.featured) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.featured ? 1 : -1;
          });
        }

        const processedProjects = sortedData.map((project: any) => ({
          ...project,
          links: Array.isArray(project.links) 
            ? project.links 
            : (typeof project.links === 'string' 
                ? JSON.parse(project.links) 
                : (project.links || []))
        }));
        
        setProjects(processedProjects);
        
        // Extract unique categories and tags from all data
        const allCategories: string[] = [];
        const allTags: string[] = [];
        
        data.forEach((project: any) => {
          if (project.category && !allCategories.includes(project.category)) {
            allCategories.push(project.category);
          }
          if (project.tech_stack && Array.isArray(project.tech_stack)) {
            project.tech_stack.forEach((tag: string) => {
              if (!allTags.includes(tag)) {
                allTags.push(tag);
              }
            });
          }
        });
        
        setCategories(allCategories);
        setAvailableTags(allTags);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(t('portfolio.noProjectsMessage'));
      toast.error(t('portfolio.noProjectsMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  return (
    <ResponsiveContainer className="py-16 md:py-24">
      <AnimatedSection>
        <SectionHeader
          title={t('portfolio.title')}
          subtitle={t('portfolio.subtitle')}
          centered
        />
      </AnimatedSection>
      
      {/* Filters and Search */}
      <AnimatedSection delay={0.2}>
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('portfolio.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => updateSearchParams("search", e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCategory} onValueChange={(value) => updateSearchParams("category", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('portfolio.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('portfolio.allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={(value) => updateSearchParams("tag", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tech" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('portfolio.allTech')}</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => updateSearchParams("sort", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('common.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('portfolio.featuredFirst')}</SelectItem>
                <SelectItem value="date">{t('portfolio.byDate')}</SelectItem>
                <SelectItem value="title">{t('portfolio.byTitle')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AnimatedSection>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <ProjectSkeleton />
            </AnimatedSection>
          ))}
        </div>
      ) : error ? (
        <AnimatedSection>
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">{t('common.error')}</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={fetchProjects}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
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
                  category: project.category || t('portfolio.title')
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
              {searchTerm || selectedCategory !== "all" || selectedTag !== "all" 
                ? t('portfolio.noProjectsMessage')
                : "Check back soon for new projects."}
            </p>
          </div>
        </AnimatedSection>
      )}
    </ResponsiveContainer>
  );
};

export default PortfolioPage;
