import { FileText, FolderKanban, MessageSquare, Eye } from "lucide-react";
import { KPICard } from "./KPICard";

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  pageViews: number;
}

interface KPIGridProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function KPIGrid({ stats, isLoading }: KPIGridProps) {
  const kpis = [
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      description: "Published articles",
      icon: FileText,
    },
    {
      title: "Portfolio Projects",
      value: stats.projects,
      description: "Showcased work",
      icon: FolderKanban,
    },
    {
      title: "Contact Messages",
      value: stats.messages,
      description: "Inquiries received",
      icon: MessageSquare,
    },
    {
      title: "Page Views",
      value: stats.pageViews,
      description: "Total impressions",
      icon: Eye,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          description={kpi.description}
          icon={kpi.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
