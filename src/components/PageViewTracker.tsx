
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const generateVisitorId = () => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

export const PageViewTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const visitorId = generateVisitorId();
        const pagePath = location.pathname;
        const referrer = document.referrer;
        const userAgent = navigator.userAgent;
        
        await supabase.rpc('track_page_view', {
          page_path: pagePath,
          visitor: visitorId,
          referrer: referrer,
          agent: userAgent
        });
        
        console.log('Page view tracked:', pagePath);
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null; // This component doesn't render anything
};
