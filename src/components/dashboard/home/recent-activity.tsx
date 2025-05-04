
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  pageViews: number;
}

interface RecentActivityProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function RecentActivity({ stats, isLoading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your site</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">Loading recent activity...</div>
        ) : (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="font-medium">Page views: {stats.pageViews}</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm text-muted-foreground">Content</p>
              <p className="font-medium">{stats.blogPosts} Blog posts published</p>
            </div>
            
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <p className="text-sm text-muted-foreground">Portfolio</p>
              <p className="font-medium">{stats.projects} Projects showcased</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="font-medium">{stats.messages} Contact messages received</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
