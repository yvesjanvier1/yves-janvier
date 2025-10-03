/**
 * Centralized route configuration
 * Single source of truth for all application routes
 */

export interface RouteItem {
  path: (lang: string) => string;
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
    path: (lang: string) => `/${lang}`,
    nameKey: "home"
  },

  work: {
    titleKey: "work",
    items: [
      {
        path: (lang: string) => `/${lang}/portfolio`,
        nameKey: "portfolio",
        descriptionKey: "portfolioDescription"
      },
      {
        path: (lang: string) => `/${lang}/projects`,
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
        path: (lang: string) => `/${lang}/blog`,
        nameKey: "blog",
        descriptionKey: "blogDescription"
      },
      {
        path: (lang: string) => `/${lang}/journal`,
        nameKey: "journal",
        descriptionKey: "journalDescription"
      },
      {
        path: (lang: string) => `/${lang}/now`,
        nameKey: "now",
        descriptionKey: "nowDescription"
      }
    ]
  },

  resources: {
    titleKey: "resources",
    items: [
      {
        path: (lang: string) => `/${lang}/resources`,
        nameKey: "resources",
        descriptionKey: "resourcesDescription"
      },
      {
        path: (lang: string) => `/${lang}/resources/tools`,
        nameKey: "tools",
        descriptionKey: "toolsDescription"
      },
      {
        path: (lang: string) => `/${lang}/resources/guides`,
        nameKey: "guides",
        descriptionKey: "guidesDescription"
      },
      {
        path: (lang: string) => `/${lang}/resources/downloads`,
        nameKey: "downloads",
        descriptionKey: "downloadsDescription"
      }
    ]
  },

  about: {
    titleKey: "about",
    items: [
      {
        path: (lang: string) => `/${lang}/about`,
        nameKey: "about",
        descriptionKey: "aboutDescription"
      },
      {
        path: (lang: string) => `/${lang}/about#resume`,
        nameKey: "resume",
        descriptionKey: "resumeDescription"
      },
      {
        path: (lang: string) => `/${lang}/contact`,
        nameKey: "contact",
        descriptionKey: "contactDescription"
      }
    ]
  }
};

export type AppRoutes = typeof appRoutes;
