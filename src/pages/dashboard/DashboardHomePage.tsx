import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/home/DashboardHeader";
import { KPIGrid } from "@/components/dashboard/home/KPIGrid";
import { VisitorTrendsChart } from "@/components/dashboard/home/VisitorTrendsChart";
import { PageViewsBarChart } from "@/components/dashboard/home/PageViewsBarChart";
import { PopularTopics } from "@/components/dashboard/home/PopularTopics";
import { ActivityFeed } from "@/components/dashboard/home/ActivityFeed";

const DashboardHomePage = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [stats, setStats] = useState({
    blogPosts: 0,
    projects: 0,
    messages: 0,
    pageViews: 0,
  });
  const [blogData, setBlogData] = useState<{ name: string; value: number }[]>([]);
  const [pageViewData, setPageViewData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        // Fetch counts from different tables
        const [blogPostsResult, projectsResult, messagesResult, pageViewsResult, analyticsResult] = await Promise.all([
          supabase.from("blog_posts").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_projects").select("*", { count: "exact", head: true }),
          supabase.from("contact_messages").select("*", { count: "exact", head: true }),
          supabase.from("page_views").select("*", { count: "exact", head: true }),
          supabase.from("analytics_summary").select("*").order("views", { ascending: false }),
        ]);

        setStats({
          blogPosts: blogPostsResult.count || 0,
          projects: projectsResult.count || 0,
          messages: messagesResult.count || 0,
          pageViews: pageViewsResult.count || 0
        });

        // Get top blog posts
        const { data: blogTopData } = await supabase
          .from("blog_posts")
          .select("title, tags")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (blogTopData) {
          const processedBlogData = blogTopData.flatMap((post) => 
            post.tags ? post.tags.map(tag => ({ name: tag })) : []
          ).reduce((acc: {name: string, value: number}[], tag: {name: string}) => {
            const existingTag = acc.find(item => item.name === tag.name);
            if (existingTag) {
              existingTag.value += 1;
            } else {
              acc.push({ name: tag.name, value: 1 });
            }
            return acc;
          }, []).sort((a, b) => b.value - a.value).slice(0, 5);
          
          setBlogData(processedBlogData);
        }

        // Process analytics data
        if (analyticsResult.data) {
          const viewData = analyticsResult.data
            .slice(0, 5)
            .map(item => ({ 
              name: item.page?.replace(/^\//, '').replace(/\/$/, '') || 'Home',
              value: item.views || 0
            }));
          setPageViewData(viewData);
        }

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [dateRange]);

  // Example data for visitors graph (would ideally come from analytics)
  const visitorData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
    { name: "May", value: 700 },
    { name: "Jun", value: 900 },
    { name: "Jul", value: 1100 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with date range selector */}
      <DashboardHeader 
        dateRange={dateRange} 
        onDateRangeChange={setDateRange} 
      />
      
      {/* KPI Cards */}
      <KPIGrid stats={stats} isLoading={isLoading} />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorTrendsChart data={visitorData} />
        <PageViewsBarChart data={pageViewData} isLoading={isLoading} />
      </div>
      
      {/* Topics and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularTopics data={blogData} isLoading={isLoading} />
        <ActivityFeed stats={stats} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardHomePage;
