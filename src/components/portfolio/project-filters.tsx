
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const ProjectFilters = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: ProjectFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
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
  );
};

export default ProjectFilters;
