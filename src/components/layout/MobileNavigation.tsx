
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { t } = useLanguage();

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

  const toggleSection = (sectionName: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionName)) {
      newOpenSections.delete(sectionName);
    } else {
      newOpenSections.add(sectionName);
    }
    setOpenSections(newOpenSections);
  };

  const isActive = (path: string) => location.pathname === path;
  const hasActiveSubmenu = (submenu: SubMenuItem[]) => 
    submenu.some(item => isActive(item.path));

  // Auto-expand sections with active items
  useEffect(() => {
    const sectionsWithActive = new Set<string>();
    navItems.forEach(item => {
      if (item.submenu && hasActiveSubmenu(item.submenu)) {
        sectionsWithActive.add(item.name);
      }
    });
    setOpenSections(sectionsWithActive);
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      <div 
        className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg z-50 lg:hidden animate-in slide-in-from-top-2 duration-200"
        role="navigation"
        aria-label="Mobile navigation menu"
      >
        <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <Collapsible 
                  open={openSections.has(item.name)}
                  onOpenChange={() => toggleSection(item.name)}
                >
                  <CollapsibleTrigger 
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[48px] ${
                      hasActiveSubmenu(item.submenu)
                        ? "text-primary font-semibold bg-gradient-to-r from-primary/10 to-secondary/10"
                        : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
                    }`}
                    aria-expanded={openSections.has(item.name)}
                    aria-label={`Toggle ${item.name} menu`}
                  >
                    {item.name}
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openSections.has(item.name) ? 'rotate-180' : ''
                      }`} 
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.comingSoon ? "#" : subItem.path}
                        className={`block pl-8 pr-4 py-2 text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px] flex items-center ${
                          subItem.comingSoon
                            ? "text-muted-foreground cursor-not-allowed"
                            : isActive(subItem.path)
                            ? "text-primary font-medium bg-gradient-to-r from-primary/10 to-secondary/10"
                            : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
                        }`}
                        onClick={(e) => {
                          if (subItem.comingSoon) {
                            e.preventDefault();
                          }
                        }}
                        aria-current={isActive(subItem.path) ? "page" : undefined}
                      >
                        <span className="flex items-center justify-between w-full">
                          {subItem.name}
                          {subItem.comingSoon && (
                            <span className="text-xs text-muted-foreground">Soon</span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  to={item.path!}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[48px] flex items-center ${
                    isActive(item.path!)
                      ? "text-primary font-semibold bg-gradient-to-r from-primary/10 to-secondary/10"
                      : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5"
                  }`}
                  aria-current={isActive(item.path!) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
