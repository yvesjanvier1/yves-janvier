
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsChartWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  hasData?: boolean;
}

export function StatsChartWrapper({
  title,
  description,
  children,
  isLoading = false,
  emptyMessage = "No data available",
  hasData = true
}: StatsChartWrapperProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">Loading chart data...</div>
          ) : hasData ? (
            children
          ) : (
            <div className="h-full flex items-center justify-center">{emptyMessage}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
