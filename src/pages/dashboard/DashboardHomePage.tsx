import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/home/DashboardHeader";
import { KPIGrid } from "@/components/dashboard/home/KPIGrid";
import { VisitorTrendsChart } from "@/components/dashboard/home/VisitorTrendsChart";
import { PageViewsBarChart } from "@/components/dashboard/home/PageViewsBarChart";
import { PopularTopics } from "@/components/dashboard/home/PopularTopics";
import { RecentActivityFeed } from "@/components/dashboard/home/RecentActivityFeed";

const DashboardHomePage = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [stats, setStats] = useState({
    blogPosts: 0,
    projects: 0,
    messages: 0,
    pageViews: 0,
    subscribers: 0,
    unreadMessages: 0,
  });
  const [blogData, setBlogData] = useState<{ name: string; value: number }[]>([]);
  const [pageViewData, setPageViewData] = useState<{ name: string; value: number }[]>([]);
  const [visitorData, setVisitorData] = useState<{ name: string; views: number; visitors: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ title: string; type: string; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        // Build date filter
        const now = new Date();
        let dateFilter: string | null = null;
        if (dateRange === "7d") {
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (dateRange === "30d") {
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        // Build filtered queries using dateFilter
        let pageViewsQuery = supabase.from("page_views").select("*", { count: "exact", head: true });
        let messagesQuery = supabase.from("contact_messages").select("*", { count: "exact", head: true });
        let unreadQuery = supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false);
        let subscribersQuery = supabase.from("newsletter_subscriptions").select("*", { count: "exact", head: true }).eq("is_active", true);
        let blogPostsQuery = supabase.from("blog_posts").select("*", { count: "exact", head: true });
        let projectsQuery = supabase.from("portfolio_projects").select("*", { count: "exact", head: true });
        let monthlyViewsQuery = supabase.from("page_views").select("created_at, visitor_id");
        let activityBlogQuery = supabase.from("blog_posts").select("title, created_at").order("created_at", { ascending: false }).limit(5);
        let blogTagsQuery = supabase.from("blog_posts").select("tags").not("tags", "is", null);

        if (dateFilter) {
          pageViewsQuery = pageViewsQuery.gte("created_at", dateFilter);
          messagesQuery = messagesQuery.gte("created_at", dateFilter);
          unreadQuery = unreadQuery.gte("created_at", dateFilter);
          subscribersQuery = subscribersQuery.gte("created_at", dateFilter);
          blogPostsQuery = blogPostsQuery.gte("created_at", dateFilter);
          projectsQuery = projectsQuery.gte("created_at", dateFilter);
          monthlyViewsQuery = monthlyViewsQuery.gte("created_at", dateFilter);
          activityBlogQuery = supabase.from("blog_posts").select("title, created_at").gte("created_at", dateFilter).order("created_at", { ascending: false }).limit(5);
          blogTagsQuery = supabase.from("blog_posts").select("tags").not("tags", "is", null).gte("created_at", dateFilter);
        }

        // Parallel fetches
        const [
          blogPostsResult,
          projectsResult,
          messagesResult,
          pageViewsResult,
          unreadResult,
          subscribersResult,
          analyticsResult,
          blogTagsResult,
          activityResult,
          monthlyViewsResult,
        ] = await Promise.all([
          blogPostsQuery,
          projectsQuery,
          messagesQuery,
          pageViewsQuery,
          unreadQuery,
          subscribersQuery,
          supabase.from("analytics_summary").select("*").order("views", { ascending: false }).limit(8),
          blogTagsQuery,
          activityBlogQuery,
          monthlyViewsQuery,
        ]);

        setStats({
          blogPosts: blogPostsResult.count || 0,
          projects: projectsResult.count || 0,
          messages: messagesResult.count || 0,
          pageViews: pageViewsResult.count || 0,
          subscribers: subscribersResult.count || 0,
          unreadMessages: unreadResult.count || 0,
        });

        // Process analytics for page views bar chart
        if (analyticsResult.data) {
          const viewData = analyticsResult.data
            .filter(item => !item.page?.includes('/dashboard'))
            .slice(0, 6)
            .map(item => ({
              name: item.page === '/' ? 'Home' : (item.page?.replace(/^\//, '').replace(/\/$/, '') || 'Home'),
              value: item.views || 0,
              visitors: item.unique_visitors || 0,
            }));
          setPageViewData(viewData);
        }

        // Process blog tags
        if (blogTagsResult.data) {
          const tagCounts: Record<string, number> = {};
          blogTagsResult.data.forEach((post) => {
            if (post.tags) {
              post.tags.forEach((tag) => {
                const cleanTag = tag.replace(/^#/, '');
                tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
              });
            }
          });
          const processedTags = Object.entries(tagCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
          setBlogData(processedTags);
        }

        // Process monthly visitor trends from raw page_views
        if (monthlyViewsResult.data) {
          const monthlyMap: Record<string, { views: number; visitors: Set<string> }> = {};
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          monthlyViewsResult.data.forEach((row) => {
            const date = new Date(row.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
            if (!monthlyMap[key]) {
              monthlyMap[key] = { views: 0, visitors: new Set() };
            }
            monthlyMap[key].views += 1;
            if (row.visitor_id) monthlyMap[key].visitors.add(row.visitor_id);
          });

          // Build continuous month range from earliest data to current month
          const allKeys = Object.keys(monthlyMap).sort();
          const now = new Date();
          const currentKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
          const startKey = allKeys.length > 0 ? allKeys[0] : currentKey;
          
          const [startYear, startMonth] = startKey.split('-').map(Number);
          const endYear = now.getFullYear();
          const endMonth = now.getMonth();
          
          const trendData: { name: string; views: number; visitors: number }[] = [];
          let y = startYear;
          let m = startMonth;
          while (y < endYear || (y === endYear && m <= endMonth)) {
            const key = `${y}-${String(m).padStart(2, '0')}`;
            const entry = monthlyMap[key];
            trendData.push({
              name: `${monthNames[m]} ${y}`,
              views: entry ? entry.views : 0,
              visitors: entry ? entry.visitors.size : 0,
            });
            m++;
            if (m > 11) { m = 0; y++; }
          }
          setVisitorData(trendData);
        }

        // Build recent activity from multiple sources
        const activities: { title: string; type: string; created_at: string }[] = [];
        
        if (activityResult.data) {
          activityResult.data.forEach((post) => {
            activities.push({ title: post.title, type: "blog_post", created_at: post.created_at });
          });
        }

        // Also fetch recent projects and messages
        let projActivityQuery = supabase.from("portfolio_projects").select("title, created_at").order("created_at", { ascending: false }).limit(3);
        let msgActivityQuery = supabase.from("contact_messages").select("name, subject, created_at").order("created_at", { ascending: false }).limit(3);
        if (dateFilter) {
          projActivityQuery = projActivityQuery.gte("created_at", dateFilter);
          msgActivityQuery = msgActivityQuery.gte("created_at", dateFilter);
        }
        const [projectsActivity, messagesActivity] = await Promise.all([
          projActivityQuery,
          msgActivityQuery,
        ]);

        if (projectsActivity.data) {
          projectsActivity.data.forEach((p) => {
            activities.push({ title: p.title, type: "project", created_at: p.created_at });
          });
        }
        if (messagesActivity.data) {
          messagesActivity.data.forEach((m) => {
            activities.push({ title: `${m.name}: ${m.subject || 'No subject'}`, type: "message", created_at: m.created_at });
          });
        }

        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentActivity(activities.slice(0, 8));

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [dateRange]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardHeader 
        dateRange={dateRange} 
        onDateRangeChange={setDateRange} 
      />
      
      <KPIGrid stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorTrendsChart data={visitorData} isLoading={isLoading} />
        <PageViewsBarChart data={pageViewData} isLoading={isLoading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularTopics data={blogData} isLoading={isLoading} />
        <RecentActivityFeed activities={recentActivity} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardHomePage;
