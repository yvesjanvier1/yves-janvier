import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface PageViewsBarChartProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-medium text-foreground capitalize">{label || 'Home'}</p>
        <p className="text-sm font-semibold text-primary">
          {payload[0].value.toLocaleString()} views
        </p>
      </div>
    );
  }
  return null;
};

export function PageViewsBarChart({ data, isLoading }: PageViewsBarChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Page Views by Page
          </h3>
          <p className="text-xs text-muted-foreground">
            Traffic distribution across pages
          </p>
        </div>
        <div className="p-2 rounded-lg bg-secondary/10">
          <BarChart3 className="h-4 w-4 text-secondary" />
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading data...</span>
            </div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No page view data available
          </div>
        )}
      </div>
    </div>
  );
}
