
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
}

export function StatCard({ title, value, isLoading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "Loading..." : value}
        </div>
      </CardContent>
    </Card>
  );
}
