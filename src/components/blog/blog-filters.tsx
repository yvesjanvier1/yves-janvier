
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BlogFiltersProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const BlogFilters = ({ 
  tags, 
  activeTag, 
  onTagChange,
  searchValue,
  onSearchChange
}: BlogFiltersProps) => {
  return (
    <div className="space-y-6 mb-8">
      <div className="relative">
        <label htmlFor="blog-search" className="sr-only">
          Search blog posts
        </label>
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="blog-search"
          name="search"
          type="search"
          autoComplete="off"
          placeholder="Search posts..."
          className="pl-10"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Button
            key={tag}
            onClick={() => onTagChange(tag)}
            variant="outline"
            size="sm"
            className={cn(
              activeTag === tag && "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlogFilters;
