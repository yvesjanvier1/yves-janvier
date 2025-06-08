
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/portfolio/project-card";
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
  
  const [categories, setCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const selectedCategory = searchParams.get("category") || "all";
  const selectedTag = searchParams.get("tag") || "all";
  const sortBy = searchParams.get("sort") || "date";
  const searchTerm = searchParams.get("search") || "";
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedTag, sortBy, searchTerm]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from("portfolio_projects")
        .select("*");

      // Apply category filter
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // Apply tag filter
      if (selectedTag !== "all") {
        query = query.contains("tech_stack", [selectedTag]);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      if (sortBy === "date") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "title") {
        query = query.order("title", { ascending: true });
      } else if (sortBy === "featured") {
        query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
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
        
        // Extract unique categories and tags from all projects
        const { data: allProjects } = await supabase
          .from("portfolio_projects")
          .select("category, tech_stack");
        
        if (allProjects) {
          const allCategories: string[] = [];
          const allTags: string[] = [];
          
          allProjects.forEach(project => {
            if (project.category && !allCategories.includes(project.category)) {
              allCategories.push(project.category);
            }
            if (project.tech_stack && Array.isArray(project.tech_stack)) {
              project.tech_stack.forEach(tag => {
                if (!allTags.includes(tag)) {
                  allTags.push(tag);
                }
              });
            }
          });
          
          setCategories(allCategories);
          setAvailableTags(allTags);
        }
      }
    } catch (err) {
      setError("Failed to load projects");
      toast.error("Failed to load projects");
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
    <div className="container px-4 py-16 md:py-24 mx-auto">
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
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => updateSearchParams("search", e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCategory} onValueChange={(value) => updateSearchParams("category", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={(value) => updateSearchParams("tag", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => updateSearchParams("sort", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="title">By Title</SelectItem>
                <SelectItem value="featured">By Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
