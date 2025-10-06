import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

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
  onSearchChange,
}: BlogFiltersProps) => {
  const { t } = useTranslation(["common", "blog"]);

  return (
    <div className="space-y-6 mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder={t("blog.searchPlaceholder", "Search posts...")}
          className="pl-10"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t("blog.searchAriaLabel", "Search blog posts")}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Button
            key={tag}
            onClick={() => onTagChange(tag)}
            variant="outline"
            size="sm"
            className={cn(
              activeTag === tag &&
                "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
            aria-pressed={activeTag === tag}
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlogFilters;
