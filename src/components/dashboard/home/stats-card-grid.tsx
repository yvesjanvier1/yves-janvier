
import { StatCard } from "@/components/dashboard/analytics/StatCard";

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  pageViews: number;
}

interface StatsCardGridProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function StatsCardGrid({ stats, isLoading }: StatsCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Blog Posts"
        value={isLoading ? "Loading..." : stats.blogPosts}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Portfolio Projects"
        value={isLoading ? "Loading..." : stats.projects}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Contact Messages"
        value={isLoading ? "Loading..." : stats.messages}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Page Views"
        value={isLoading ? "Loading..." : stats.pageViews}
        isLoading={isLoading}
      />
    </div>
  );
}
