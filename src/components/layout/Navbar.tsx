
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import NavigationMenu from "./NavigationMenu";
import MobileNavigation from "./MobileNavigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
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
            <NavigationMenu />

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

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </ResponsiveContainer>
      </nav>

      {/* Mobile Navigation */}
      <MobileNavigation isOpen={isOpen} onClose={closeMenu} />
    </>
  );
};

export default Navbar;
