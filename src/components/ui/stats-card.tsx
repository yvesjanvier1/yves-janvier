import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'accent';
  className?: string;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  gradient = 'primary',
  className,
  delay = 0
}: StatsCardProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2, triggerOnce: true });

  const gradientClasses = {
    primary: 'bg-gradient-primary hover:shadow-primary',
    secondary: 'bg-gradient-secondary hover:shadow-secondary',
    accent: 'bg-gradient-accent hover:shadow-accent',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'glass-card p-6 text-white relative overflow-hidden group',
        'hover:scale-105 transition-all duration-500 ease-out',
        'hover:shadow-glow transform',
        gradientClasses[gradient],
        isVisible ? 'animate-fade-in-up' : 'opacity-0',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {icon && (
          <div className="mb-4 text-white/80 group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/90 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-3xl font-bold text-white">
            {value}
          </p>
          {description && (
            <p className="text-sm text-white/70 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-lg transform -translate-x-8 translate-y-8 group-hover:scale-125 transition-transform duration-500" />
    </div>
  );
}