
import { useState, useEffect } from 'react';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing consent
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted') {
      setHasConsented(true);
    } else if (consent === 'declined') {
      setHasConsented(false);
    } else {
      setHasConsented(null); // No decision made yet
    }
    setIsLoading(false);
  }, []);

  const handleConsent = (accepted: boolean) => {
    setHasConsented(accepted);
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
  };

  return {
    hasConsented,
    isLoading,
    handleConsent,
    canUseTracking: hasConsented === true,
    shouldShowBanner: hasConsented === null && !isLoading
  };
};
