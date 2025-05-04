
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Cell, Legend } from "recharts";

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
            post.tags.map(tag => ({ name: tag }))
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stats.blogPosts}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stats.projects}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stats.messages}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stats.pageViews}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Visitors</CardTitle>
            <CardDescription>Monthly visitor trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitorData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
            <CardDescription>Views by page</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">Loading chart data...</div>
              ) : pageViewData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageViewData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE">
                      {pageViewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">No page view data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
            <CardDescription>Most used tags in blog posts</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">Loading chart data...</div>
              ) : blogData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={blogData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {blogData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">No blog tag data available</div>
              )}
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

export default DashboardHomePage;
