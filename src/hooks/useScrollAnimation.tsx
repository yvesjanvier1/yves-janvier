
import { useInView } from "framer-motion";
import { useRef } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold: options.threshold || 0.1,
    once: options.triggerOnce !== false
  });

  return { ref, isInView };
};
