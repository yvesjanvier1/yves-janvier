
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  const getGridCols = () => {
    const classes = ['grid'];
    
    if (cols.mobile) classes.push(`grid-cols-${cols.mobile}`);
    if (cols.tablet) classes.push(`md:grid-cols-${cols.tablet}`);
    if (cols.desktop) classes.push(`lg:grid-cols-${cols.desktop}`);
    if (cols.large) classes.push(`xl:grid-cols-${cols.large}`);
    
    return classes.join(' ');
  };

  return (
    <div
      className={cn(
        getGridCols(),
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};
