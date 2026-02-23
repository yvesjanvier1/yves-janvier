import { FileText, FolderKanban, MessageSquare, Eye, Users, Mail } from "lucide-react";
import { KPICard } from "./KPICard";

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  pageViews: number;
  subscribers: number;
  unreadMessages: number;
}

interface KPIGridProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function KPIGrid({ stats, isLoading }: KPIGridProps) {
  const kpis = [
    {
      title: "Total Page Views",
      value: stats.pageViews,
      description: "All-time impressions",
      icon: Eye,
      accent: "text-blue-600 dark:text-blue-400",
      accentBg: "bg-blue-100 dark:bg-blue-500/15",
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      description: "Published articles",
      icon: FileText,
      accent: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-100 dark:bg-emerald-500/15",
    },
    {
      title: "Portfolio Projects",
      value: stats.projects,
      description: "Showcased work",
      icon: FolderKanban,
      accent: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-100 dark:bg-amber-500/15",
    },
    {
      title: "Messages",
      value: stats.messages,
      description: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : "All read",
      icon: MessageSquare,
      accent: "text-purple-600 dark:text-purple-400",
      accentBg: "bg-purple-100 dark:bg-purple-500/15",
    },
    {
      title: "Subscribers",
      value: stats.subscribers,
      description: "Newsletter sign-ups",
      icon: Users,
      accent: "text-rose-600 dark:text-rose-400",
      accentBg: "bg-rose-100 dark:bg-rose-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          description={kpi.description}
          icon={kpi.icon}
          isLoading={isLoading}
          accent={kpi.accent}
          accentBg={kpi.accentBg}
        />
      ))}
    </div>
  );
}
