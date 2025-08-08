
import { useState, useCallback, useEffect } from 'react';
import { useExitIntent } from './useExitIntent';

const STORAGE_KEY = 'exitPopupShown';

export const useExitIntentModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setHasShown(true);
    }
  }, []);

  const showModal = useCallback(() => {
    if (!hasShown && !isModalOpen) {
      setIsModalOpen(true);
      setHasShown(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [hasShown, isModalOpen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubscribe = useCallback(() => {
    // Additional logic when user subscribes can go here
    closeModal();
  }, [closeModal]);

  // Set up exit intent detection
  useExitIntent({
    enabled: !hasShown,
    onExitIntent: showModal
  });

  return {
    isModalOpen,
    closeModal,
    handleSubscribe
  };
};
