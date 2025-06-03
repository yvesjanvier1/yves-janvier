
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
          await supabase.rpc('track_performance_metrics', {
            page_path: location.pathname,
            load_time: Math.round(metrics.loadTime),
            dom_content_loaded: Math.round(metrics.domContentLoaded),
            first_contentful_paint: metrics.firstContentfulPaint ? Math.round(metrics.firstContentfulPaint) : null,
            largest_contentful_paint: metrics.largestContentfulPaint ? Math.round(metrics.largestContentfulPaint) : null,
            user_agent: navigator.userAgent,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            connection_type: (navigator as any)?.connection?.effectiveType || null
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
