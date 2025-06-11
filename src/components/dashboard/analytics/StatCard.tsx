
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
  description?: string;
  trend?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, isLoading = false, description, trend, icon }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="animate-pulse bg-muted rounded h-8 w-20"></div>
            ) : (
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {value}
              </span>
            )}
          </div>
          {description && (
            <CardDescription className="text-xs">
              {description}
              {trend && (
                <span className="ml-2 font-medium text-green-600">
                  {trend}
                </span>
              )}
            </CardDescription>
          )}
        </div>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
    </Card>
  );
}
