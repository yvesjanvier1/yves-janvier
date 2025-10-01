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
    nameKey: "nav.home",
  },
  work: {
    titleKey: "nav.work",
    items: [
      {
        path: (lang: string) => `/${lang}/portfolio`,
        nameKey: "nav.portfolio",
        descriptionKey: "navDescriptions.portfolio",
      },
      {
        path: (lang: string) => `/${lang}/projects`,
        nameKey: "nav.projects",
        descriptionKey: "navDescriptions.projects",
        comingSoon: true,
      },
    ],
  },
  content: {
    titleKey: "nav.content",
    items: [
      {
        path: (lang: string) => `/${lang}/blog`,
        nameKey: "nav.blog",
        descriptionKey: "navDescriptions.blog",
      },
      {
        path: (lang: string) => `/${lang}/journal`,
        nameKey: "nav.journal",
        descriptionKey: "navDescriptions.journal",
      },
      {
        path: (lang: string) => `/${lang}/now`,
        nameKey: "nav.now",
        descriptionKey: "navDescriptions.now",
      },
    ],
  },
  resources: {
    titleKey: "nav.resources",
    items: [
      {
        path: (lang: string) => `/${lang}/resources`,
        nameKey: "nav.resources",
        descriptionKey: "navDescriptions.resources",
      },
      {
        path: (lang: string) => `/${lang}/resources/tools`,
        nameKey: "resources.tools.title",
        descriptionKey: "resources.tools.description",
      },
      {
        path: (lang: string) => `/${lang}/resources/guides`,
        nameKey: "resources.guides.title",
        descriptionKey: "resources.guides.description",
      },
      {
        path: (lang: string) => `/${lang}/resources/downloads`,
        nameKey: "resources.downloads.title",
        descriptionKey: "resources.downloads.description",
      },
    ],
  },
  about: {
    titleKey: "nav.about",
    items: [
      {
        path: (lang: string) => `/${lang}/about`,
        nameKey: "nav.about",
        descriptionKey: "navDescriptions.aboutMe",
      },
      {
        path: (lang: string) => `/${lang}/about#resume`,
        nameKey: "nav.resume",
        descriptionKey: "navDescriptions.resume",
      },
      {
        path: (lang: string) => `/${lang}/contact`,
        nameKey: "nav.contact",
        descriptionKey: "navDescriptions.getInTouch",
      },
    ],
  },
};

export type AppRoutes = typeof appRoutes;
