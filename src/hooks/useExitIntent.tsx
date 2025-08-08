
import { useEffect, useRef, useCallback } from 'react';

interface UseExitIntentOptions {
  enabled?: boolean;
  delay?: number;
  onExitIntent: () => void;
}

export const useExitIntent = ({ 
  enabled = true, 
  delay = 200, 
  onExitIntent 
}: UseExitIntentOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger if cursor is moving towards the top of the screen
    if (e.clientY <= 10 && e.relatedTarget === null) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (!isSelectingRef.current && enabled) {
          onExitIntent();
        }
      }, delay);
    }
  }, [enabled, delay, onExitIntent]);

  const handleMouseDown = useCallback(() => {
    isSelectingRef.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  }, []);

  const handleBeforeUnload = useCallback(() => {
    if (enabled) {
      onExitIntent();
    }
  }, [enabled, onExitIntent]);

  useEffect(() => {
    if (!enabled) return;

    // Check if on mobile (optional: disable on mobile)
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleMouseLeave, handleMouseDown, handleMouseUp, handleBeforeUnload]);
};
