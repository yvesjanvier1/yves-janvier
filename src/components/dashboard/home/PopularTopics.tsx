import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopularTopicsProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

export function PopularTopics({ data, isLoading }: PopularTopicsProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Color palette for progress bars
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-emerald-500 dark:bg-emerald-400",
    "bg-amber-500 dark:bg-amber-400",
    "bg-rose-500 dark:bg-rose-400",
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Popular Topics
          </h3>
          <p className="text-xs text-muted-foreground">
            Most used tags in content
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Tag className="h-4 w-4 text-primary" />
        </div>
      </div>
      
      {/* Topics list */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
              </div>
            ))}
          </>
        ) : data.length > 0 ? (
          data.map((topic, index) => {
            const percentage = total > 0 ? Math.round((topic.value / total) * 100) : 0;
            return (
              <div key={topic.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                    {topic.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      colors[index % colors.length]
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            No topic data available
          </div>
        )}
      </div>
    </div>
  );
}
