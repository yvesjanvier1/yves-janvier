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
import { appRoutes } from "@/router/routes";

interface NavSectionItem {
  path: string;
  nameKey: string;
  descriptionKey: string;
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavSectionItem[];
}

interface NavItemProps {
  item: NavSectionItem;
  closeMenu: () => void;
  isActiveItem: (path: string) => boolean;
  t: (key: string) => string;
  isMobile?: boolean;
}

const NavItem = ({ item, closeMenu, isActiveItem, t, isMobile = false }: NavItemProps) => {
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
          {t(item.nameKey)} <span className="text-xs text-muted-foreground">(Coming Soon)</span>
        </div>
        <div className="text-sm text-muted-foreground">{t(item.descriptionKey)}</div>
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
          isActive ? "text-primary font-medium bg-primary/10" : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
        )
      }
    >
      <div className="font-medium">{t(item.nameKey)}</div>
      <div className="text-sm text-muted-foreground">{t(item.descriptionKey)}</div>
    </NavLink>
  ) : (
    <Link
      to={item.path}
      className={cn(
        "block p-3 rounded-md transition-colors hover:bg-muted/50",
        isActiveItem(item.path) ? "text-primary font-medium bg-primary/10" : "text-foreground/80 hover:text-foreground"
      )}
    >
      <div className="font-medium">{t(item.nameKey)}</div>
      <div className="text-sm text-muted-foreground">{t(item.descriptionKey)}</div>
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language: lang, t } = useLanguage();
  const { isMobile } = useResponsive();

  const allSections = {
    work: appRoutes.work,
    content: appRoutes.content,
    resources: appRoutes.resources,
    about: appRoutes.about,
  };

  const navigationItems: Record<string, NavSection> = Object.fromEntries(
    Object.entries(allSections).map(([key, section]) => {
      const items: NavSectionItem[] = section.items
        .filter((item) => item.path)
        .map((item) => ({
          ...item,
          path: item.path(lang),
        }));
      return [key, { title: t(`nav.${key}`), items }];
    })
  ) as Record<string, NavSection>;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest("#navigation")) closeMenu();
    };
    if (isOpen) document.addEventListener("click", handleClickOutside), (document.body.style.overflow = "hidden");
    else document.body.style.overflow = "unset";
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isActiveSection = (sectionPath: string) => location.pathname.startsWith(sectionPath);
  const isActiveItem = (itemPath: string) => {
    if (itemPath.includes("#")) {
      const [path, hash] = itemPath.split("#");
      return location.pathname === path && location.hash === `#${hash}`;
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");
  };

  return (
    <nav id="navigation" className="sticky top-0 z-50 w-full glass border-b border-primary/10">
      <ResponsiveContainer padding="sm">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink
              to={`/${lang}`}
              className={({ isActive }) =>
                cn(
                  navigationMenuTriggerStyle(),
                  "text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive ? "text-primary font-semibold bg-primary/10" : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              {t("nav.home")}
            </NavLink>

            <NavigationMenu>
              <NavigationMenuList>
                {Object.entries(navigationItems).map(([key, section]) => (
                  <NavigationMenuItem key={key}>
                    <NavigationMenuTrigger
                      className={cn(isActiveSection(`/${key}`) ? "text-primary font-semibold bg-primary/10" : "text-foreground/80")}
                    >
                      {section.title}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <div
                        className={cn(
                          "p-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg z-50",
                          section.items.length > 3 ? "grid grid-cols-2 gap-4 w-96" : "w-64"
                        )}
                      >
                        {section.items.map((item) => (
                          <NavItem key={item.path} item={item} closeMenu={closeMenu} isActiveItem={isActiveItem} t={t} />
                        ))}
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

          {/* Mobile */}
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

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" />
          <div
            id="mobile-menu"
            className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur-md border-b border-border shadow-lg z-50 lg:hidden animate-slide-in"
          >
            <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <NavLink
                to={`/${lang}`}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] flex items-center",
                    isActive ? "text-primary font-semibold bg-primary/10" : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                  )
                }
              >
                {t("nav.home")}
              </NavLink>

              {Object.entries(navigationItems).map(([key, section]) => (
                <div key={key} className="space-y-2">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <NavItem key={item.path} item={item} closeMenu={closeMenu} isActiveItem={isActiveItem} t={t} isMobile />
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
