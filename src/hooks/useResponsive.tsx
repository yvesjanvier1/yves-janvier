
import { useState, useEffect } from 'react';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'large';
}

export const useResponsive = (): BreakpointState => {
  const [breakpoint, setBreakpoint] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    screenSize: 'desktop'
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024 && width < 1280;
      const isLarge = width >= 1280;
      
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
        screenSize
      });
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};
