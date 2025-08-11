
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";

interface SubMenuItem {
  name: string;
  path: string;
  comingSoon?: boolean;
}

interface NavItem {
  name: string;
  path?: string;
  submenu?: SubMenuItem[];
}

const NavigationMenu = () => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const { t } = useLanguage();
  const { isMobile } = useResponsive();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const navItems: NavItem[] = [
    {
      name: t('nav.home'),
      path: "/",
    },
    {
      name: "Work",
      submenu: [
        { name: t('nav.portfolio'), path: "/portfolio" },
        { name: "Projects", path: "/projects", comingSoon: true },
      ],
    },
    {
      name: "Content",
      submenu: [
        { name: t('nav.blog'), path: "/blog" },
        { name: "Journal", path: "/journal" },
        { name: "Now", path: "/now" },
      ],
    },
    {
      name: "Resources",
      submenu: [
        { name: "Resources", path: "/resources" },
        { name: "Tools", path: "/tools", comingSoon: true },
        { name: "Guides", path: "/guides", comingSoon: true },
      ],
    },
    {
      name: t('nav.about'),
      submenu: [
        { name: t('nav.about'), path: "/about" },
        { name: "Resume", path: "/resume", comingSoon: true },
        { name: t('nav.contact'), path: "/contact" },
      ],
    },
  ];

  const handleMouseEnter = (itemName: string) => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSubmenu(itemName);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 150);
  };

  const handleClick = (itemName: string) => {
    if (isMobile) {
      setOpenSubmenu(openSubmenu === itemName ? null : itemName);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(itemName);
    }
    if (event.key === 'Escape') {
      setOpenSubmenu(null);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const hasActiveSubmenu = (submenu: SubMenuItem[]) => 
    submenu.some(item => isActive(item.path));

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close submenu when route changes
  useEffect(() => {
    setOpenSubmenu(null);
  }, [location.pathname]);

  return (
    <div className="hidden lg:flex items-center space-x-1">
      {navItems.map((item) => (
        <div
          key={item.name}
          className="relative"
          onMouseEnter={() => item.submenu && handleMouseEnter(item.name)}
          onMouseLeave={() => item.submenu && handleMouseLeave()}
        >
          {item.submenu ? (
            <button
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                hasActiveSubmenu(item.submenu)
                  ? "text-primary font-semibold bg-gradient-to-r from-primary/10 to-secondary/10"
                  : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
              }`}
              onClick={() => handleClick(item.name)}
              onKeyDown={(e) => handleKeyDown(e, item.name)}
              aria-haspopup="true"
              aria-expanded={openSubmenu === item.name}
              aria-label={`${item.name} menu`}
            >
              {item.name}
              <ChevronDown 
                className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                  openSubmenu === item.name ? 'rotate-180' : ''
                }`} 
              />
            </button>
          ) : (
            <Link
              to={item.path!}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                isActive(item.path!)
                  ? "text-primary font-semibold bg-gradient-to-r from-primary/10 to-secondary/10"
                  : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
              }`}
              aria-current={isActive(item.path!) ? "page" : undefined}
            >
              {item.name}
            </Link>
          )}

          {/* Submenu Dropdown */}
          {item.submenu && openSubmenu === item.name && (
            <div 
              className="absolute top-full left-0 mt-1 min-w-[200px] glass-card rounded-xl shadow-lg border border-border/20 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              role="menu"
              aria-label={`${item.name} submenu`}
            >
              <div className="py-2">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.comingSoon ? "#" : subItem.path}
                    className={`block px-4 py-2 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      subItem.comingSoon
                        ? "text-muted-foreground cursor-not-allowed"
                        : isActive(subItem.path)
                        ? "text-primary font-medium bg-gradient-to-r from-primary/10 to-secondary/10"
                        : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
                    }`}
                    role="menuitem"
                    onClick={(e) => {
                      if (subItem.comingSoon) {
                        e.preventDefault();
                      } else {
                        setOpenSubmenu(null);
                      }
                    }}
                  >
                    <span className="flex items-center justify-between">
                      {subItem.name}
                      {subItem.comingSoon && (
                        <span className="text-xs text-muted-foreground ml-2">Soon</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavigationMenu;
