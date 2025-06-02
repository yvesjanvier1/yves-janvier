
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center space-x-3 ${className}`} aria-label="Yves Janvier - Home">
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <rect width="40" height="40" rx="8" fill="currentColor" />
          <path
            d="M12 28V14.5L16 26L20 14.5V28H23V12H19L16 22L13 12H9V28H12Z"
            fill="white"
            fontWeight="bold"
          />
          <path
            d="M25 28V20L29 12H26L24 17L22 12H19L23 20V28H25Z"
            fill="white"
            fontWeight="bold"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-bold text-xl text-foreground">Yves Janvier</span>
      )}
    </Link>
  );
};
