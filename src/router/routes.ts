/**
 * Centralized route configuration
 * Single source of truth for all application routes (French only)
 */

export interface RouteItem {
  path: string;
  nameKey: string;
  descriptionKey?: string;
  comingSoon?: boolean;
}

export interface RouteSection {
  titleKey: string;
  items: RouteItem[];
}

export const appRoutes = {
  home: {
    path: "/",
    nameKey: "home"
  },

  work: {
    titleKey: "work",
    items: [
      {
        path: "/portfolio",
        nameKey: "portfolio",
        descriptionKey: "portfolioDescription"
      },
      {
        path: "/projects",
        nameKey: "projects",
        descriptionKey: "projectsDescription",
        comingSoon: true
      }
    ]
  },

  content: {
    titleKey: "content",
    items: [
      {
        path: "/blog",
        nameKey: "blog",
        descriptionKey: "blogDescription"
      },
      {
        path: "/journal",
        nameKey: "journal",
        descriptionKey: "journalDescription"
      },
      {
        path: "/now",
        nameKey: "now",
        descriptionKey: "nowDescription"
      }
    ]
  },

  resources: {
    titleKey: "resources",
    items: [
      {
        path: "/resources",
        nameKey: "resources",
        descriptionKey: "resourcesDescription"
      },
      {
        path: "/resources/tools",
        nameKey: "tools",
        descriptionKey: "toolsDescription"
      },
      {
        path: "/resources/guides",
        nameKey: "guides",
        descriptionKey: "guidesDescription"
      },
      {
        path: "/resources/downloads",
        nameKey: "downloads",
        descriptionKey: "downloadsDescription"
      }
    ]
  },

  about: {
    titleKey: "about",
    items: [
      {
        path: "/about",
        nameKey: "about",
        descriptionKey: "aboutDescription"
      },
      {
        path: "/about#resume",
        nameKey: "resume",
        descriptionKey: "resumeDescription"
      },
      {
        path: "/contact",
        nameKey: "contact",
        descriptionKey: "contactDescription"
      }
    ]
  },

  services: {
    path: "/services",
    nameKey: "services"
  }
};

export type AppRoutes = typeof appRoutes;
