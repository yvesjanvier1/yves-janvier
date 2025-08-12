
import { useState, useEffect, useCallback } from 'react';

interface ConsentFlowState {
  showPrivacyBanner: boolean;
  showSubscriptionModal: boolean;
  privacyConsent: boolean | null;
}

export const useConsentFlow = () => {
  const [state, setState] = useState<ConsentFlowState>({
    showPrivacyBanner: false,
    showSubscriptionModal: false,
    privacyConsent: null,
  });

  useEffect(() => {
    // Check existing privacy consent
    const existingConsent = localStorage.getItem('privacy-consent');
    const subscriptionShown = localStorage.getItem('subscription-popup-shown');
    const subscriptionDismissed = localStorage.getItem('subscription-dismissed');

    if (!existingConsent) {
      // No privacy consent yet, show banner
      setState(prev => ({
        ...prev,
        showPrivacyBanner: true,
      }));
    } else {
      // Privacy consent exists, check if we should show subscription modal
      const consentValue = existingConsent === 'accepted';
      setState(prev => ({
        ...prev,
        privacyConsent: consentValue,
      }));

      // Only show subscription modal if not shown before and not dismissed
      if (!subscriptionShown && !subscriptionDismissed) {
        setState(prev => ({
          ...prev,
          showSubscriptionModal: true,
        }));
      }
    }
  }, []);

  const handlePrivacyConsent = useCallback((accepted: boolean) => {
    // Store privacy consent
    localStorage.setItem('privacy-consent', accepted ? 'accepted' : 'declined');
    
    // Update state
    setState(prev => ({
      ...prev,
      showPrivacyBanner: false,
      privacyConsent: accepted,
    }));

    // Check if subscription modal should be shown
    const subscriptionShown = localStorage.getItem('subscription-popup-shown');
    const subscriptionDismissed = localStorage.getItem('subscription-dismissed');
    
    if (!subscriptionShown && !subscriptionDismissed) {
      // Small delay to allow banner to animate out
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showSubscriptionModal: true,
        }));
      }, 300);
    }
  }, []);

  const handleSubscriptionModalClose = useCallback(() => {
    localStorage.setItem('subscription-popup-shown', 'true');
    setState(prev => ({
      ...prev,
      showSubscriptionModal: false,
    }));
  }, []);

  return {
    showPrivacyBanner: state.showPrivacyBanner,
    showSubscriptionModal: state.showSubscriptionModal,
    privacyConsent: state.privacyConsent,
    handlePrivacyConsent,
    handleSubscriptionModalClose,
  };
};
