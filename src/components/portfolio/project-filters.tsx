
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  onSearchChange
}: ProjectFiltersProps) => {
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
              activeCategory === category && "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Search input */}
      <div className="relative">
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="project-search"
          name="search"
          type="search"
          autoComplete="off"
          placeholder="Search projects..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
};

export default ProjectFilters;
