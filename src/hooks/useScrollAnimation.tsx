
import { useInView } from "framer-motion";
import { useRef } from "react";

interface UseScrollAnimationOptions {
  amount?: number;
  once?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: options.amount || 0.1,
    once: options.once !== false
  });

  return { ref, isInView };
};
