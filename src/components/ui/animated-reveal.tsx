import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface AnimatedRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in-up' | 'scale-in-bounce' | 'slide-up' | 'fade-in';
  delay?: number;
  threshold?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export function AnimatedReveal({
  children,
  className,
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
  staggerChildren = false,
  staggerDelay = 100,
}: AnimatedRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, triggerOnce: true });

  const animationClasses = {
    'fade-in-up': 'animate-fade-in-up',
    'scale-in-bounce': 'animate-scale-in-bounce',
    'slide-up': 'animate-slide-up',
    'fade-in': 'animate-fade-in',
  };

  if (staggerChildren) {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
      >
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <div
              key={index}
              className={cn(
                isVisible ? animationClasses[animation] : 'opacity-0',
                'transform'
              )}
              style={{
                animationDelay: `${delay + (index * staggerDelay)}ms`,
              }}
            >
              {child}
            </div>
          ))
        ) : (
          <div
            className={cn(
              isVisible ? animationClasses[animation] : 'opacity-0',
              'transform'
            )}
            style={{
              animationDelay: `${delay}ms`,
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? animationClasses[animation] : 'opacity-0',
        'transform',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}