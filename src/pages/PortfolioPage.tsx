import { useState, useMemo } from "react";
import { Search, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMultilingualData } from "@/hooks/useMultilingualData";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";

const PortfolioPage = () => {
  const { t } = useLanguage();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("all");
  const [featuredFirst, setFeaturedFirst] = useState(true);

  // Fetch projects from Supabase (or any backend)
  const { data: projects = [], isLoading, error } = useMultilingualData<any>({
    table: "projects",
    filters: { published: true },
    orderBy: { column: "created_at", ascending: false },
  });

  // Extract unique categories & techs
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [projects]);

  const technologies = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) =>
      p.technologies?.forEach((tech: string) => set.add(tech))
    );
    return Array.from(set);
  }, [projects]);

  // Filter & sort
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Tech filter
    if (selectedTech !== "all") {
      result = result.filter((p) =>
        p.technologies?.includes(selectedTech)
      );
    }

    // Featured first
    if (featuredFirst) {
      result.sort((a, b) => (b.featured === true ? 1 : 0) - (a.featured === true ? 1 : 0));
    }

    return result;
  }, [projects, searchQuery, selectedCategory, selectedTech, featuredFirst]);

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <SectionHeader
          title={t("portfolio.title")}
          subtitle={t("portfolio.subtitle")}
          centered
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t("portfolio.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="all">{t("portfolio.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Tech Filter */}
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="all">{t("portfolio.allTech")}</option>
              {technologies.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>

            {/* Featured First Toggle */}
            <Button
              type="button"
              variant={featuredFirst ? "default" : "outline"}
              onClick={() => setFeaturedFirst((prev) => !prev)}
              className="flex items-center gap-1"
            >
              <Star className="h-4 w-4" />
              {t("portfolio.featuredFirst")}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden border shadow-sm">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-destructive">
            <p>{t("common.error")}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              {t("common.retry")}
            </Button>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
              >
                <LazyImage
                  src={project.cover_image || "/placeholder.svg"}
                  alt={project.title}
                  aspectRatio="video"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.technologies?.slice(0, 3).map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {project.description || ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {t("portfolio.noProjectsFound")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("portfolio.checkBackMessage")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioPage;
