
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6
}: AnimatedSectionProps) => {
  const { ref, isInView } = useScrollAnimation();

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: 60, opacity: 0 };
      case "down":
        return { y: -60, opacity: 0 };
      case "left":
        return { x: -60, opacity: 0 };
      case "right":
        return { x: 60, opacity: 0 };
      default:
        return { y: 60, opacity: 0 };
    }
  };

  const getFinalPosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { y: 0, opacity: 1 };
      case "left":
      case "right":
        return { x: 0, opacity: 1 };
      default:
        return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isInView ? getFinalPosition() : getInitialPosition()}
      transition={{
        duration,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.4, 0.55, 1.4]
      }}
    >
      {children}
    </motion.div>
  );
};
