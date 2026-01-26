import { Activity, Eye, FileText, FolderKanban, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  pageViews: number;
}

interface ActivityFeedProps {
  stats: DashboardStats;
  isLoading: boolean;
}

interface ActivityItem {
  icon: typeof Eye;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

export function ActivityFeed({ stats, isLoading }: ActivityFeedProps) {
  const activities: ActivityItem[] = [
    {
      icon: Eye,
      label: "Page views tracked",
      value: stats.pageViews.toLocaleString(),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-500/20",
    },
    {
      icon: FileText,
      label: "Blog posts published",
      value: stats.blogPosts.toString(),
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
    },
    {
      icon: FolderKanban,
      label: "Portfolio projects showcased",
      value: stats.projects.toString(),
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-500/20",
    },
    {
      icon: MessageSquare,
      label: "Contact messages received",
      value: stats.messages.toString(),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/20",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Recent Activity
          </h3>
          <p className="text-xs text-muted-foreground">
            Summary of site performance
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="h-4 w-4 text-primary" />
        </div>
      </div>
      
      {/* Activity timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-3 bottom-3 w-px bg-border" />
        
        {/* Activity items */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 pl-1">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={activity.label} 
                className="flex items-center gap-4 pl-1 relative"
              >
                {/* Icon bubble */}
                <div 
                  className={cn(
                    "relative z-10 flex items-center justify-center h-8 w-8 rounded-full",
                    activity.bgColor
                  )}
                >
                  <activity.icon className={cn("h-4 w-4", activity.color)} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {activity.value}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {activity.label}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
