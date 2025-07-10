import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = "", showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl"
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center space-x-3 hover:opacity-80 transition-opacity ${className}`} 
      aria-label="Yves Janvier - Home"
    >
      <div className="relative flex-shrink-0">
        <img
          src="/lovable-uploads/078881d9-124b-4172-a520-e9d11a852ec0.png"
          alt="Yves Janvier"
          className={`${sizeClasses[size]} object-cover rounded-full border-2 border-primary/20`}
          loading="eager"
        />
      </div>
      {showText && (
        <span className={`font-bold text-foreground ${textSizeClasses[size]} whitespace-nowrap`}>
          Yves Janvier
        </span>
      )}
    </Link>
  );
};
