
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const visitorId = localStorage.getItem('visitorId') || 
          Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Store visitor ID for future tracking
        localStorage.setItem('visitorId', visitorId);
        
        await supabase.rpc('track_page_view', {
          page_path: location.pathname,
          visitor: visitorId,
          referrer: document.referrer,
          agent: navigator.userAgent
        });
        
        console.log('Page view tracked:', location.pathname);
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };
    
    trackPageView();
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default PageViewTracker;
