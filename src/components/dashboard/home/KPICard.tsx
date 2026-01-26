import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  isLoading = false,
  className 
}: KPICardProps) {
  return (
    <div 
      className={cn(
        "relative group rounded-xl border border-border bg-card p-5",
        "transition-all duration-200 hover:shadow-md hover:border-border/80",
        "dark:hover:shadow-lg dark:hover:shadow-primary/5",
        className
      )}
    >
      {/* Icon container */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 dark:bg-primary/15">
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
        </div>
      </div>
      
      {/* Value */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
        
        {/* Title */}
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        
        {/* Description */}
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
