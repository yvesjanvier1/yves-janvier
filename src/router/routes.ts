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
        descriptionKey: "nav.descriptions.portfolio",
      },
      {
        path: (lang: string) => `/${lang}/projects`,
        nameKey: "nav.projects",
        descriptionKey: "nav.descriptions.projects",
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
        descriptionKey: "nav.descriptions.blog",
      },
      {
        path: (lang: string) => `/${lang}/journal`,
        nameKey: "nav.journal",
        descriptionKey: "nav.descriptions.journal",
      },
      {
        path: (lang: string) => `/${lang}/now`,
        nameKey: "nav.now",
        descriptionKey: "nav.descriptions.now",
      },
    ],
  },
  resources: {
    titleKey: "nav.resources",
    items: [
      {
        path: (lang: string) => `/${lang}/resources`,
        nameKey: "nav.resources",
        descriptionKey: "nav.descriptions.resources",
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
        descriptionKey: "nav.descriptions.aboutMe",
      },
      {
        path: (lang: string) => `/${lang}/about#resume`,
        nameKey: "nav.resume",
        descriptionKey: "nav.descriptions.resume",
      },
      {
        path: (lang: string) => `/${lang}/contact`,
        nameKey: "nav.contact",
        descriptionKey: "nav.descriptions.getInTouch",
      },
    ],
  },
};

export type AppRoutes = typeof appRoutes;
