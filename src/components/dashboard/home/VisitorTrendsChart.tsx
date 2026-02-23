import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface VisitorTrendsChartProps {
  data: { name: string; views: number; visitors: number }[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.value.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">{entry.dataKey === 'views' ? 'views' : 'unique visitors'}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function VisitorTrendsChart({ data, isLoading }: VisitorTrendsChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Traffic Trends
          </h3>
          <p className="text-xs text-muted-foreground">
            Monthly page views and unique visitors
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
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
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={28}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground capitalize">{value === 'views' ? 'Page Views' : 'Unique Visitors'}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#viewsGradient)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                fill="url(#visitorsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No traffic data available
          </div>
        )}
      </div>
    </div>
  );
}
