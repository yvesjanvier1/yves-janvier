
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { isMobile } = useResponsive();

  const navigationItems = {
    work: {
      title: "Work",
      items: [
        { name: "Portfolio", path: "/work/portfolio", description: "View my complete portfolio" },
        { name: "Projects", path: "/work/projects", description: "Featured projects and case studies", comingSoon: true },
      ]
    },
    content: {
      title: "Content",
      items: [
        { name: t('nav.blog') || "Blog", path: "/content/blog", description: "Latest articles and insights" },
        { name: "Journal", path: "/content/journal", description: "Project updates and activities" },
        { name: "Now", path: "/content/now", description: "What I'm currently working on" },
      ]
    },
    resources: {
      title: "Resources",
      items: [
        { name: "Tools", path: "/resources/tools", description: "Useful development tools" },
        { name: "Guides", path: "/resources/guides", description: "Technical guides and tutorials" },
        { name: "Downloads", path: "/resources/downloads", description: "Free resources and downloads" },
      ]
    },
    about: {
      title: "About",
      items: [
        { name: t('nav.about') || "About", path: "/about", description: "Learn more about me" },
        { name: "Resume", path: "/about#resume", description: "Professional experience" },
        { name: t('nav.contact') || "Contact", path: "/contact", description: "Get in touch" },
      ]
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActiveSection = (sectionPath: string) => {
    return location.pathname.startsWith(sectionPath);
  };

  const isActiveItem = (itemPath: string) => {
    if (itemPath.includes('#')) {
      return location.pathname === itemPath.split('#')[0] && location.hash === '#' + itemPath.split('#')[1];
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  const handleItemClick = (item: any) => {
    if (item.comingSoon) {
      alert("Coming soon! This feature is under development.");
      return;
    }
    closeMenu();
  };

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
            <NavLink
              to="/"
              className={({ isActive }) => cn(
                navigationMenuTriggerStyle(),
                "text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isActive
                  ? "text-primary font-semibold bg-primary/10" 
                  : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
              )}
            >
              Home
            </NavLink>

            <NavigationMenu>
              <NavigationMenuList>
                {Object.entries(navigationItems).map(([key, section]) => (
                  <NavigationMenuItem key={key}>
                    <NavigationMenuTrigger 
                      className={cn(
                        isActiveSection(`/${key}`) 
                          ? "text-primary font-semibold bg-primary/10" 
                          : "text-foreground/80"
                      )}
                    >
                      {section.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-64 p-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg z-50">
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item.path}>
                              <NavigationMenuLink asChild>
                                {item.comingSoon ? (
                                  <button
                                    onClick={() => handleItemClick(item)}
                                    className={cn(
                                      "block w-full text-left p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer",
                                      "text-foreground/60 hover:text-foreground/80"
                                    )}
                                  >
                                    <div className="font-medium">{item.name} <span className="text-xs text-muted-foreground">(Coming Soon)</span></div>
                                    <div className="text-sm text-muted-foreground">{item.description}</div>
                                  </button>
                                ) : (
                                  <Link
                                    to={item.path}
                                    className={cn(
                                      "block p-3 rounded-md transition-colors hover:bg-muted/50",
                                      isActiveItem(item.path) 
                                        ? "text-primary font-medium bg-primary/10" 
                                        : "text-foreground/80 hover:text-foreground"
                                    )}
                                  >
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">{item.description}</div>
                                  </Link>
                                )}
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

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
            className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur-md border-b border-border shadow-lg z-50 lg:hidden animate-slide-in"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) => cn(
                  "block px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] flex items-center",
                  isActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                )}
              >
                Home
              </NavLink>

              {Object.entries(navigationItems).map(([key, section]) => (
                <div key={key} className="space-y-2">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <div key={item.path}>
                      {item.comingSoon ? (
                        <button
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "block w-full text-left px-6 py-3 rounded-lg text-base transition-colors min-h-[48px]",
                            "text-foreground/60 hover:text-foreground/80 hover:bg-muted/50"
                          )}
                        >
                          <div className="font-medium">{item.name} <span className="text-xs text-muted-foreground">(Coming Soon)</span></div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </button>
                      ) : (
                        <NavLink
                          to={item.path}
                          onClick={closeMenu}
                          className={({ isActive }) => cn(
                            "block px-6 py-3 rounded-lg text-base transition-colors min-h-[48px]",
                            isActive
                              ? "text-primary font-medium bg-primary/10"
                              : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </NavLink>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
