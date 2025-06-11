
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "./StatCard";
import { PieChartDisplay, BarChartDisplay, LineChartDisplay } from "./AnalyticsCharts";
import { PageDetailsTable } from "./PageDetailsTable";
import { StatsChartWrapper } from "./stats-chart-wrapper";
import { Badge } from "@/components/ui/badge";

interface AnalyticsSummary {
  page: string;
  views: number;
  unique_visitors: number;
  last_view: string;
}

interface CategorizedData {
  category: string;
  views: number;
  pages: number;
  percentage: number;
}

export function AnalyticsDashboard() {
  const [pageSummary, setPageSummary] = useState<AnalyticsSummary[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch analytics summary from the view
        const { data: summaryData, error: summaryError } = await supabase
          .from("analytics_summary")
          .select("*")
          .order("views", { ascending: false });
          
        if (summaryError) throw summaryError;
        
        setPageSummary(summaryData || []);
        
        // Calculate totals
        let viewsTotal = 0;
        let uniqueTotal = 0;
        
        if (summaryData) {
          summaryData.forEach(item => {
            viewsTotal += item.views;
            uniqueTotal += item.unique_visitors;
          });
        }
        
        setTotalViews(viewsTotal);
        setUniqueVisitors(uniqueTotal);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Function to categorize pages and clean URLs
  const categorizePage = (page: string): { category: string; title: string } => {
    if (page.includes('/blog/')) {
      const slug = page.replace('/blog/', '').replace('/', '');
      const title = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      return { category: 'Blog Posts', title: title || 'Blog Post' };
    }
    if (page.includes('/portfolio/') || page.includes('/project/')) {
      const slug = page.replace('/portfolio/', '').replace('/project/', '').replace('/', '');
      const title = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      return { category: 'Portfolio', title: title || 'Portfolio Project' };
    }
    if (page.includes('/dashboard')) {
      return { category: 'Dashboard', title: 'Dashboard Pages' };
    }
    if (page === '/' || page === '/home') {
      return { category: 'Home', title: 'Home Page' };
    }
    if (page.includes('/about')) {
      return { category: 'About', title: 'About Page' };
    }
    if (page.includes('/contact')) {
      return { category: 'Contact', title: 'Contact Page' };
    }
    if (page.includes('/journal')) {
      return { category: 'Journal', title: 'Journal Activities' };
    }
    return { category: 'Other', title: page };
  };

  // Categorize data for better insights
  const categorizedData: CategorizedData[] = pageSummary.reduce((acc, item) => {
    const { category } = categorizePage(item.page);
    const existing = acc.find(cat => cat.category === category);
    
    if (existing) {
      existing.views += item.views;
      existing.pages += 1;
    } else {
      acc.push({
        category,
        views: item.views,
        pages: 1,
        percentage: 0
      });
    }
    return acc;
  }, [] as CategorizedData[]).map(item => ({
    ...item,
    percentage: totalViews > 0 ? (item.views / totalViews) * 100 : 0
  })).sort((a, b) => b.views - a.views);

  // Convert data for charts with better formatting
  const pieChartData = categorizedData.map(item => ({
    name: item.category,
    value: item.views,
    percentage: item.percentage.toFixed(1)
  }));
  
  const barChartData = pageSummary.slice(0, 10).map(item => {
    const { title } = categorizePage(item.page);
    return {
      name: title.length > 30 ? title.substring(0, 30) + '...' : title,
      views: item.views,
      visitors: item.unique_visitors,
      fullTitle: title
    };
  });
  
  // Enhanced timeline data with trend indicators
  const timelineData = [
    { date: "Apr 2024", views: 120, trend: "↗" },
    { date: "May 2024", views: 240, trend: "↗" },
    { date: "Jun 2024", views: 380, trend: "↗" },
    { date: "Jul 2024", views: 520, trend: "↗" },
    { date: "Aug 2024", views: 650, trend: "↗" },
    { date: "Sep 2024", views: 870, trend: "↗" },
  ];

  // Calculate engagement metrics
  const avgViewsPerPage = totalViews / (pageSummary.length || 1);
  const topPerformer = pageSummary[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Insights & Analytics</h1>
          <Badge variant="secondary" className="text-sm">
            Last 30 days
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Comprehensive overview of website performance and user engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Page Views" 
          value={totalViews.toLocaleString()} 
          isLoading={isLoading}
          description="All time views"
        />
        
        <StatCard 
          title="Unique Visitors" 
          value={uniqueVisitors.toLocaleString()} 
          isLoading={isLoading}
          description="Individual users"
        />
        
        <StatCard 
          title="Pages Tracked" 
          value={pageSummary.length} 
          isLoading={isLoading}
          description="Active pages"
        />

        <StatCard 
          title="Avg. Views/Page" 
          value={Math.round(avgViewsPerPage).toLocaleString()} 
          isLoading={isLoading}
          description="Performance metric"
        />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="categories">📈 Categories</TabsTrigger>
          <TabsTrigger value="pages">📄 Top Pages</TabsTrigger>
          <TabsTrigger value="trends">📊 Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsChartWrapper 
              title="Traffic Distribution by Category" 
              description="How visitors engage with different sections"
              isLoading={isLoading}
              hasData={pieChartData.length > 0}
            >
              <PieChartDisplay data={pieChartData} showPercentages={true} />
            </StatsChartWrapper>

            <div className="space-y-4">
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {categorizedData.slice(0, 3).map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.percentage.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">{item.views} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {topPerformer && (
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-2">🏆 Top Performer</h3>
                  <p className="text-sm text-muted-foreground mb-2">Most viewed page</p>
                  <p className="font-medium">{categorizePage(topPerformer.page).title}</p>
                  <p className="text-2xl font-bold text-primary">{topPerformer.views.toLocaleString()} views</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <StatsChartWrapper 
            title="Performance by Content Category" 
            description="Detailed breakdown of views and engagement by section"
            isLoading={isLoading}
            hasData={categorizedData.length > 0}
          >
            <div className="space-y-4">
              {categorizedData.map((item, index) => (
                <div key={item.category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}></span>
                      {item.category}
                    </h4>
                    <Badge variant="outline">{item.pages} pages</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold">{item.views.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </StatsChartWrapper>
        </TabsContent>
        
        <TabsContent value="pages" className="space-y-4">
          <StatsChartWrapper 
            title="Top Performing Pages" 
            description="Individual page performance and visitor engagement"
            isLoading={isLoading}
            hasData={barChartData.length > 0}
          >
            <BarChartDisplay data={barChartData} />
          </StatsChartWrapper>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <StatsChartWrapper 
            title="Traffic Trends Over Time" 
            description="Monthly growth patterns and engagement trends"
            hasData={timelineData.length > 0}
          >
            <LineChartDisplay data={timelineData} />
          </StatsChartWrapper>
        </TabsContent>
      </Tabs>
      
      <PageDetailsTable data={pageSummary} isLoading={isLoading} />
    </div>
  );
}
