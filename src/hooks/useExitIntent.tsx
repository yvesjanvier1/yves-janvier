
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
  const lastScrollYRef = useRef(0);
  const scrollStartYRef = useRef(0);
  const isTouchingRef = useRef(false);

  // Desktop: Mouse exit intent detection
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

  // Mobile: Scroll-up intent detection
  const handleTouchStart = useCallback((e: TouchEvent) => {
    isTouchingRef.current = true;
    scrollStartYRef.current = window.scrollY;
    lastScrollYRef.current = window.scrollY;
  }, []);

  const handleTouchMove = useCallback(() => {
    if (!isTouchingRef.current) return;
    
    const currentScrollY = window.scrollY;
    const scrollDiff = scrollStartYRef.current - currentScrollY;
    
    // Detect upward scroll of 30px or more from near bottom of page
    if (
      scrollDiff >= 30 && 
      currentScrollY > 100 && // Not at the very top
      window.innerHeight + currentScrollY >= document.body.offsetHeight - 200 // Near bottom
    ) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (enabled && !isSelectingRef.current) {
          onExitIntent();
        }
      }, delay);
    }
    
    lastScrollYRef.current = currentScrollY;
  }, [enabled, delay, onExitIntent]);

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

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

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    
    if (isMobile) {
      // Mobile: scroll-up detection
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    } else {
      // Desktop: mouse exit detection
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    // Common events
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      } else {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleMouseLeave, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseUp, handleBeforeUnload]);
};
