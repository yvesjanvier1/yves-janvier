
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

export function PageDetailsTable({ data, isLoading }: PageDetailsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Details</CardTitle>
        <CardDescription>Detailed analytics by page</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading data...</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3">Page</th>
                  <th className="text-right p-3">Total Views</th>
                  <th className="text-right p-3">Unique Visitors</th>
                  <th className="text-right p-3">Last View</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-3 font-medium">{item.page}</td>
                    <td className="p-3 text-right">{item.views.toLocaleString()}</td>
                    <td className="p-3 text-right">{item.unique_visitors.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {new Date(item.last_view).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
