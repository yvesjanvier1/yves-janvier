
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  className,
  centered = false
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "max-w-3xl mb-12",
      centered && "mx-auto text-center",
      className
    )}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
