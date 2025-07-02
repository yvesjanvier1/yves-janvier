
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalyticsSummary {
  page: string;
  views: number;
  unique_visitors: number;
  last_view: string;
}

interface PageDetailsTableProps {
  data: AnalyticsSummary[];
  isLoading: boolean;
}

// Function to categorize and format page titles
const formatPageTitle = (page: string): { category: string; title: string; url: string } => {
  if (page.includes('/blog/')) {
    const slug = page.replace('/blog/', '').replace('/', '');
    const title = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return { 
      category: 'Blog', 
      title: title || 'Blog Post',
      url: page 
    };
  }
  if (page.includes('/portfolio/') || page.includes('/project/')) {
    const slug = page.replace('/portfolio/', '').replace('/project/', '').replace('/', '');
    const title = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return { 
      category: 'Portfolio', 
      title: title || 'Portfolio Project',
      url: page 
    };
  }
  if (page.includes('/dashboard')) {
    return { 
      category: 'Dashboard', 
      title: 'Dashboard Pages',
      url: page 
    };
  }
  if (page === '/' || page === '/home') {
    return { 
      category: 'Home', 
      title: 'Home Page',
      url: page 
    };
  }
  if (page.includes('/about')) {
    return { 
      category: 'About', 
      title: 'About Page',
      url: page 
    };
  }
  if (page.includes('/contact')) {
    return { 
      category: 'Contact', 
      title: 'Contact Page',
      url: page 
    };
  }
  if (page.includes('/journal')) {
    return { 
      category: 'Journal', 
      title: 'Journal Activities',
      url: page 
    };
  }
  return { 
    category: 'Other', 
    title: page,
    url: page 
  };
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Blog': 'bg-blue-100 text-blue-800',
    'Portfolio': 'bg-green-100 text-green-800',
    'Dashboard': 'bg-purple-100 text-purple-800',
    'Home': 'bg-yellow-100 text-yellow-800',
    'About': 'bg-orange-100 text-orange-800',
    'Contact': 'bg-red-100 text-red-800',
    'Journal': 'bg-indigo-100 text-indigo-800',
    'Other': 'bg-gray-100 text-gray-800'
  };
  return colors[category as keyof typeof colors] || colors.Other;
};

export function PageDetailsTable({ data, isLoading }: PageDetailsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEngagementRate = (views: number, visitors: number): string => {
    if (visitors === 0) return "0.0";
    return ((visitors / views) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📄 Page Performance Details
        </CardTitle>
        <CardDescription>
          Comprehensive breakdown of individual page analytics and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-4 font-semibold">Page</th>
                    <th className="text-right p-4 font-semibold">Views</th>
                    <th className="text-right p-4 font-semibold">Visitors</th>
                    <th className="text-right p-4 font-semibold">Engagement</th>
                    <th className="text-right p-4 font-semibold">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((item, index) => {
                    const pageInfo = formatPageTitle(item.page);
                    const engagementRate = calculateEngagementRate(item.views, item.unique_visitors);
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getCategoryColor(pageInfo.category)}`}
                              >
                                {pageInfo.category}
                              </Badge>
                              <span className="font-medium">
                                {pageInfo.title}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {pageInfo.url}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-bold text-lg">
                            {item.views.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-semibold">
                            {item.unique_visitors.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Badge 
                            variant={parseFloat(engagementRate) > 70 ? "default" : "secondary"}
                            className="font-mono"
                          >
                            {engagementRate}%
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          {formatDate(item.last_view)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
