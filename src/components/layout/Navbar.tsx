// src/components/layout/Navbar.tsx

import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { toast } from "@/hooks/use-toast";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useStaticMultilingualData } from "@/hooks/useStaticMultilingualData";

// Types matching navbar.json structure
interface NavItemData {
  label: string;
  description: string;
}

interface NavSectionData {
  label: string;
  description: string;
  items?: Record<string, NavItemData>;
}

interface NavbarData {
  home: NavItemData;
  aboutSection: NavSectionData;
  work: NavSectionData;
  content: NavSectionData;
  resources: NavSectionData;
}

// Map section keys to actual routes
const SECTION_ROUTE_MAP: Record<string, string> = {
  about: "/about",
  contact: "/contact",
  resume: "/resume",
  portfolio: "/portfolio",
  projects: "/projects",
  blog: "/blog",
  journal: "/journal",
  now: "/now",
  tools: "/resources/tools",
  guides: "/resources/guides",
  downloads: "/resources/downloads",
};

// Determine if a section item is "coming soon"
const IS_COMING_SOON: Record<string, boolean> = {
  projects: true,
};

// NavItem remains mostly the same
interface NavItemProps {
  item: {
    path: string;
    nameKey: string;
    descriptionKey?: string;
    comingSoon?: boolean;
  };
  closeMenu: () => void;
  isActiveItem: (path: string) => boolean;
  t: (key: string) => string;
  isMobile?: boolean;
}

const NavItem = ({ item, closeMenu, isActiveItem, t, isMobile = false }: NavItemProps) => {
  const hasDescription = !!item.descriptionKey;

  if (item.comingSoon) {
    return (
      <button
        onClick={() =>
          toast({
            title: t("common.comingSoon"),
            description: t("common.comingSoonDescription"),
          })
        }
        className={cn(
          "block w-full text-left p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer text-foreground/60 hover:text-foreground/80",
          isMobile ? "px-6 py-3 min-h-[48px]" : ""
        )}
      >
        <div className="font-medium">
          {t(item.nameKey)}{" "}
          <span className="text-xs text-muted-foreground">({t("common.comingSoon")})</span>
        </div>
        {hasDescription && (
          <div className="text-sm text-muted-foreground">{t(item.descriptionKey!)}</div>
        )}
      </button>
    );
  }

  return isMobile ? (
    <NavLink
      to={item.path}
      onClick={closeMenu}
      className={({ isActive }) =>
        cn(
          "block px-6 py-3 rounded-lg text-base transition-colors min-h-[48px]",
          isActive
            ? "text-primary font-medium bg-primary/10"
            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
        )
      }
    >
      <div className="font-medium">{t(item.nameKey)}</div>
      {hasDescription && <div className="text-sm text-muted-foreground">{t(item.descriptionKey!)}</div>}
    </NavLink>
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
      <div className="font-medium">{t(item.nameKey)}</div>
      {hasDescription && <div className="text-sm text-muted-foreground">{t(item.descriptionKey!)}</div>}
    </Link>
  );
};

// Main Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, currentLanguage } = useLanguage();
  const { isMobile } = useResponsive();

  // Load navbar.json dynamically
  const { data: navbarData, loading } = useStaticMultilingualData<NavbarData>("navbar");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const isActiveItem = (itemPath: string) =>
    location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);

  // Convert navbar.json structure into navigationSections
  const navigationSections = React.useMemo(() => {
    if (!navbarData) return [];

    const sections: {
      key: string;
      titleKey: string;
      items: { path: string; nameKey: string; descriptionKey: string; comingSoon?: boolean }[];
    }[] = [];

    // Helper to build key path for t()
    const buildKey = (sectionKey: string, itemKey?: string) => {
      if (itemKey) {
        return `navbar.${sectionKey}.items.${itemKey}`;
      }
      return `navbar.${sectionKey}`;
    };

    // Process each section
    Object.entries(navbarData).forEach(([sectionKey, section]) => {
      // Skip "home" — it's handled separately
      if (sectionKey === "home") return;

      const items: typeof sections[number]["items"] = [];

      if (section.items) {
        Object.keys(section.items).forEach((itemKey) => {
          const route = SECTION_ROUTE_MAP[itemKey] || `/${itemKey}`;
          items.push({
            path: route,
            nameKey: `${buildKey(sectionKey, itemKey)}.label`,
            descriptionKey: `${buildKey(sectionKey, itemKey)}.description`,
            comingSoon: IS_COMING_SOON[itemKey],
          });
        });
      }

      sections.push({
        key: sectionKey,
        titleKey: `${buildKey(sectionKey)}.label`,
        items,
      });
    });

    return sections;
  }, [navbarData]);

  if (loading) {
    // Optional: show minimal navbar skeleton
    return (
      <nav className="sticky top-0 z-50 w-full glass border-b border-primary/10 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="w-24 h-6 bg-muted rounded animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="w-10 h-10 rounded bg-muted animate-pulse lg:hidden" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav id="navigation" className="sticky top-0 z-50 w-full glass border-b border-primary/10">
      <ResponsiveContainer padding="sm">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  navigationMenuTriggerStyle(),
                  "text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              {navbarData ? t("navbar.home.label") : "Accueil"}
            </NavLink>

            <NavigationMenu>
              <NavigationMenuList>
                {navigationSections.map((section) => (
                  <NavigationMenuItem key={section.key}>
                    <NavigationMenuTrigger
                      className={cn(
                        navigationSections.some((s) =>
                          s.items.some((item) => isActiveItem(item.path))
                        ) && section.items.some((item) => isActiveItem(item.path))
                          ? "text-primary font-semibold bg-primary/10"
                          : "text-foreground/80"
                      )}
                    >
                      {t(section.titleKey)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div
                        className={cn(
                          "p-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg z-50",
                          section.items.length > 3 ? "grid grid-cols-2 gap-4 w-96" : "w-64"
                        )}
                      >
                        {section.items.map((item) => (
                          <NavItem
                            key={item.path}
                            item={item}
                            closeMenu={closeMenu}
                            isActiveItem={isActiveItem}
                            t={t}
                          />
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-2 ml-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
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

      {/* Mobile Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" />
          <div
            id="mobile-menu"
            className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur-md border-b border-border shadow-lg z-50 lg:hidden animate-slide-in"
          >
            <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] flex items-center",
                    isActive
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                  )
                }
              >
                {navbarData ? t("navbar.home.label") : "Accueil"}
              </NavLink>

              {navigationSections.map((section) => (
                <div key={section.key} className="space-y-2">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t(section.titleKey)}
                  </div>
                  {section.items.map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      closeMenu={closeMenu}
                      isActiveItem={isActiveItem}
                      t={t}
                      isMobile
                    />
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