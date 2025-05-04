
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCardGrid } from "@/components/dashboard/home/stats-card-grid";
import { VisitorsChart } from "@/components/dashboard/home/visitors-chart";
import { PageViewsChart } from "@/components/dashboard/home/page-views-chart";
import { TopicsChart } from "@/components/dashboard/home/topics-chart";
import { RecentActivity } from "@/components/dashboard/home/recent-activity";

const DashboardHomePage = () => {
  const [stats, setStats] = useState({
    blogPosts: 0,
    projects: 0,
    messages: 0,
    pageViews: 0,
  });
  const [blogData, setBlogData] = useState([]);
  const [pageViewData, setPageViewData] = useState([]);
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
              name: item.page.replace(/^\//, '').replace(/\/$/, '') || 'Home',
              value: item.views 
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
  }, []);

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Overview */}
      <StatsCardGrid stats={stats} isLoading={isLoading} />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorsChart data={visitorData} />
        <PageViewsChart data={pageViewData} isLoading={isLoading} />
      </div>
      
      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicsChart data={blogData} isLoading={isLoading} />
        <RecentActivity stats={stats} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardHomePage;
