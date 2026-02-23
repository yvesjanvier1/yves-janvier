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
  data: { name: string; value: number; visitors?: number }[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-medium text-foreground capitalize mb-1">/{label || 'home'}</p>
        <p className="text-sm font-semibold text-primary">
          {payload[0].value.toLocaleString()} views
        </p>
        {payload[0].payload.visitors != null && (
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.visitors.toLocaleString()} unique visitors
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function PageViewsBarChart({ data, isLoading }: PageViewsBarChartProps) {
  // Color gradient from primary to lighter
  const getBarColor = (index: number, total: number) => {
    const opacity = 1 - (index / Math.max(total, 1)) * 0.5;
    return `hsl(var(--primary) / ${opacity})`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Top Pages
          </h3>
          <p className="text-xs text-muted-foreground">
            Traffic distribution across pages
          </p>
        </div>
        <div className="p-2 rounded-lg bg-secondary/10">
          <BarChart3 className="h-4 w-4 text-secondary" />
        </div>
      </div>
      
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
                    fill={getBarColor(index, data.length)}
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
