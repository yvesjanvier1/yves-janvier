
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";

interface TopicsChartProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

export function TopicsChart({ data, isLoading }: TopicsChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Topics</CardTitle>
        <CardDescription>Most used tags in blog posts</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">Loading chart data...</div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
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
  );
}
