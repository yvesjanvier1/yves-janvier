
import { useState, useEffect } from 'react';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  height: number;
}

// Mobile-first breakpoints
const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  large: 1440,
} as const;

export const useResponsive = (): BreakpointState => {
  const [breakpoint, setBreakpoint] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    screenSize: 'desktop',
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < BREAKPOINTS.tablet;
      const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
      const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.large;
      const isLarge = width >= BREAKPOINTS.large;
      
      let screenSize: 'mobile' | 'tablet' | 'desktop' | 'large';
      if (isMobile) screenSize = 'mobile';
      else if (isTablet) screenSize = 'tablet';
      else if (isDesktop) screenSize = 'desktop';
      else screenSize = 'large';

      setBreakpoint({
        isMobile,
        isTablet,
        isDesktop,
        isLarge,
        screenSize,
        width,
        height,
      });
    };

    // Initialize on mount
    updateBreakpoint();
    
    // Listen for resize events with debouncing
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoint, 100);
    };
    
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', updateBreakpoint);
    
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', updateBreakpoint);
      clearTimeout(timeoutId);
    };
  }, []);

  return breakpoint;
};

// Utility hook for responsive values
export const useResponsiveValue = function<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
  large?: T;
}): T {
  const { screenSize } = useResponsive();
  
  switch (screenSize) {
    case 'mobile':
      return values.mobile;
    case 'tablet':
      return values.tablet ?? values.mobile;
    case 'desktop':
      return values.desktop ?? values.tablet ?? values.mobile;
    case 'large':
      return values.large ?? values.desktop ?? values.tablet ?? values.mobile;
    default:
      return values.mobile;
  }
};
