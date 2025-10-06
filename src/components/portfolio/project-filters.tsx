import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface ProjectFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const ProjectFilters = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchValue,
  onSearchChange,
}: ProjectFiltersProps) => {
  const { t } = useTranslation(["common", "portfolio"]);

  return (
    <div className="space-y-4 mb-8">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => onCategoryChange(category)}
            variant="outline"
            size="sm"
            className={cn(
              "transition-colors",
              activeCategory === category &&
                "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
            aria-pressed={activeCategory === category}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("portfolio.searchPlaceholder", "Search projects...")}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label={t("portfolio.searchAriaLabel", "Search projects")}
        />
      </div>
    </div>
  );
};

export default ProjectFilters;
