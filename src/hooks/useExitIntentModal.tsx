
import { useState, useCallback, useEffect } from 'react';
import { useExitIntent } from './useExitIntent';
import { useCookieConsent } from './useCookieConsent';

const STORAGE_KEY = 'exitPopupShown';

export const useExitIntentModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { canUseTracking } = useCookieConsent();

  // Check localStorage on mount
  useEffect(() => {
    if (canUseTracking) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setHasShown(true);
      }
    }
  }, [canUseTracking]);

  const showModal = useCallback(() => {
    if (!hasShown && !isModalOpen && canUseTracking) {
      setIsModalOpen(true);
      setHasShown(true);
      if (canUseTracking) {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    }
  }, [hasShown, isModalOpen, canUseTracking]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubscribe = useCallback(() => {
    // Additional logic when user subscribes can go here
    closeModal();
  }, [closeModal]);

  // Set up exit intent detection only if tracking is allowed
  useExitIntent({
    enabled: !hasShown && canUseTracking,
    onExitIntent: showModal
  });

  return {
    isModalOpen,
    closeModal,
    handleSubscribe
  };
};
