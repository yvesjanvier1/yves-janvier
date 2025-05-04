
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface PageViewsChartProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

export function PageViewsChart({ data, isLoading }: PageViewsChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Views</CardTitle>
        <CardDescription>Views by page</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">Loading chart data...</div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE">
                  {data.map((entry, index) => (
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
  );
}
