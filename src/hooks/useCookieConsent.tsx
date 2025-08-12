
import { useState, useEffect } from 'react';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing privacy consent (new system)
    const privacyConsent = localStorage.getItem('privacy-consent');
    
    if (privacyConsent === 'accepted') {
      setHasConsented(true);
    } else if (privacyConsent === 'declined') {
      setHasConsented(false);
    } else {
      // Check for old cookie consent system
      const oldConsent = localStorage.getItem('cookieConsent');
      if (oldConsent === 'accepted') {
        setHasConsented(true);
        // Migrate to new system
        localStorage.setItem('privacy-consent', 'accepted');
      } else if (oldConsent === 'declined') {
        setHasConsented(false);
        // Migrate to new system
        localStorage.setItem('privacy-consent', 'declined');
      } else {
        setHasConsented(null); // No decision made yet
      }
    }
    setIsLoading(false);
  }, []);

  const handleConsent = (accepted: boolean) => {
    setHasConsented(accepted);
    localStorage.setItem('privacy-consent', accepted ? 'accepted' : 'declined');
  };

  return {
    hasConsented,
    isLoading,
    handleConsent,
    canUseTracking: hasConsented === true,
    shouldShowBanner: hasConsented === null && !isLoading
  };
};
