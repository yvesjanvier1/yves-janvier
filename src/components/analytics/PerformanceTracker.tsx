
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePerformance } from '@/hooks/usePerformance';
import { supabase } from '@/integrations/supabase/client';

export const PerformanceTracker = () => {
  const location = useLocation();
  const metrics = usePerformance();

  useEffect(() => {
    if (metrics && metrics.loadTime > 0) {
      const trackPerformance = async () => {
        try {
          // Use the existing track_page_view function with performance data in user_agent
          const performanceData = JSON.stringify({
            loadTime: Math.round(metrics.loadTime),
            domContentLoaded: Math.round(metrics.domContentLoaded),
            firstContentfulPaint: metrics.firstContentfulPaint ? Math.round(metrics.firstContentfulPaint) : null,
            largestContentfulPaint: metrics.largestContentfulPaint ? Math.round(metrics.largestContentfulPaint) : null,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            connectionType: (navigator as any)?.connection?.effectiveType || null
          });

          await supabase.rpc('track_page_view', {
            page_path: location.pathname,
            visitor: 'performance-tracker',
            referrer: document.referrer || null,
            agent: performanceData
          });
        } catch (error) {
          console.warn('Performance tracking failed:', error);
        }
      };

      trackPerformance();
    }
  }, [metrics, location.pathname]);

  return null;
};
