
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "./StatCard";
import { PieChartDisplay, BarChartDisplay, LineChartDisplay } from "./AnalyticsCharts";
import { PageDetailsTable } from "./PageDetailsTable";

interface AnalyticsSummary {
  page: string;
  views: number;
  unique_visitors: number;
  last_view: string;
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

  // Convert data for charts
  const pieChartData = pageSummary.map(item => ({
    name: item.page,
    value: item.views,
  }));
  
  const barChartData = pageSummary.map(item => ({
    name: item.page,
    views: item.views,
    visitors: item.unique_visitors,
  }));
  
  // Sample data for timeline chart (normally would be from database)
  const timelineData = [
    { date: "2025-04", views: 120 },
    { date: "2025-05", views: 240 },
    { date: "2025-06", views: 380 },
    { date: "2025-07", views: 520 },
    { date: "2025-08", views: 650 },
    { date: "2025-09", views: 870 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Page Views" 
          value={totalViews.toLocaleString()} 
          isLoading={isLoading} 
        />
        
        <StatCard 
          title="Unique Visitors" 
          value={uniqueVisitors.toLocaleString()} 
          isLoading={isLoading} 
        />
        
        <StatCard 
          title="Pages Tracked" 
          value={pageSummary.length} 
          isLoading={isLoading} 
        />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <PieChartDisplay data={pieChartData} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="pages" className="space-y-4">
          <BarChartDisplay data={barChartData} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <LineChartDisplay data={timelineData} />
        </TabsContent>
      </Tabs>
      
      <PageDetailsTable data={pageSummary} isLoading={isLoading} />
    </div>
  );
}
