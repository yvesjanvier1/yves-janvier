
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const navItems = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.portfolio'), path: "/portfolio" },
    { name: t('nav.blog'), path: "/blog" },
    { name: "Now", path: "/now" },
    { name: "Journal", path: "/journal" },
    { name: "Resources", path: "/resources" },
    { name: t('nav.about'), path: "/about" },
    { name: t('nav.contact'), path: "/contact" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('#navigation')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav 
      id="navigation" 
      className="sticky top-0 z-50 w-full glass border-b border-primary/10" 
      role="navigation" 
      aria-label="Main navigation"
    >
      <ResponsiveContainer padding="sm">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  location.pathname === item.path
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                }`}
                aria-current={location.pathname === item.path ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-2 ml-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile/Tablet Navigation Controls */}
          <div className="flex items-center space-x-2 lg:hidden">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="h-10 w-10 p-0"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Mobile/Tablet Menu Overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" />
          <div 
            id="mobile-menu"
            className="fixed inset-x-0 top-16 bg-background border-b border-border shadow-lg z-50 lg:hidden animate-slide-in"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    location.pathname === item.path
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
