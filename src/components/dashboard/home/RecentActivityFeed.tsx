import { FileText, FolderKanban, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  title: string;
  type: string;
  created_at: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string; bgColor: string }> = {
  blog_post: {
    icon: FileText,
    label: "Blog Post",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  project: {
    icon: FolderKanban,
    label: "Project",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-500/20",
  },
  message: {
    icon: MessageSquare,
    label: "Message",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-500/20",
  },
};

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Recent Activity
          </h3>
          <p className="text-xs text-muted-foreground">
            Latest content and interactions
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-4 w-4 text-primary" />
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute left-[17px] top-3 bottom-3 w-px bg-border" />
        
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 pl-1">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : activities.length > 0 ? (
            activities.map((activity, index) => {
              const config = typeConfig[activity.type] || typeConfig.blog_post;
              const IconComponent = config.icon;
              const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
              
              return (
                <div key={`${activity.type}-${index}`} className="flex items-start gap-3 pl-1 relative">
                  <div className={cn("relative z-10 flex items-center justify-center h-8 w-8 rounded-full shrink-0", config.bgColor)}>
                    <IconComponent className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[10px] font-medium uppercase tracking-wide", config.color)}>{config.label}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
