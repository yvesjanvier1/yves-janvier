import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export type Language = "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatDate: (date: string | Date) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // French is the only language now
  const [language] = useState<Language>("fr");

  // Load French translations from JSON files
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const common = await import(`../../public/locales/fr/common.json`);
        const navbar = await import(`../../public/locales/fr/navbar.json`);
        const footer = await import(`../../public/locales/fr/footer.json`);
        const hero = await import(`../../public/locales/fr/hero.json`);
        const about = await import(`../../public/locales/fr/about.json`);
        const services = await import(`../../public/locales/fr/services.json`);
        const blog = await import(`../../public/locales/fr/blog.json`);
        const portfolio = await import(`../../public/locales/fr/portfolio.json`);
        const contact = await import(`../../public/locales/fr/contact.json`);
        const resources = await import(`../../public/locales/fr/resources.json`);

        // Flatten navbar structure to extract label values
        const flattenedNavbar: Record<string, any> = {};
        Object.keys(navbar.default).forEach((key) => {
          const value = navbar.default[key];
          if (typeof value === "object" && value !== null && "label" in value) {
            flattenedNavbar[key] = value.label;
            if ("description" in value) {
              flattenedNavbar[`${key}.description`] = value.description;
            }
          } else {
            flattenedNavbar[key] = value;
          }
        });

        setTranslations({
          ...common.default,
          ...flattenedNavbar,
          ...footer.default,
          ...hero.default,
          ...about.default,
          ...services.default,
          ...blog.default,
          ...portfolio.default,
          ...contact.default,
          ...resources.default,
        });
      } catch (err) {
        console.error("Error loading translations:", err);
        setTranslations(embeddedTranslations.fr);
      }
    };

    loadTranslations();
  }, []);

  // Set document language to French
  useEffect(() => {
    document.documentElement.lang = "fr";
  }, []);

  // No language switching needed - always French
  const handleSetLanguage = (newLang: Language) => {
    // Language is always French
    console.log("Language switching disabled - using French only");
  };

  // Translation function for French
  const t = (key: string): string => {
    if (!key) return "";

    // Check loaded translations
    let translation = translations[key];
    
    // If it's an object with label, extract the label
    if (translation && typeof translation === "object" && "label" in translation) {
      return translation.label;
    }
    
    if (typeof translation === "string") {
      return translation;
    }

    // Check nested keys (e.g., "nav.home")
    const keys = key.split(".");
    let value: any = translations;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // If nested value is an object with label, extract it
    if (value && typeof value === "object" && "label" in value) {
      return value.label;
    }

    if (value && typeof value === "string") {
      return value;
    }

    // Fallback to embedded French translations
    const embedded = embeddedTranslations.fr;
    if (embedded && embedded[key]) {
      const embeddedVal = embedded[key];
      if (typeof embeddedVal === "object" && "label" in embeddedVal) {
        return embeddedVal.label;
      }
      if (typeof embeddedVal === "string") {
        return embeddedVal;
      }
    }

    // Check nested in embedded
    let embeddedValue: any = embedded;
    for (const k of keys) {
      if (embeddedValue && typeof embeddedValue === "object" && k in embeddedValue) {
        embeddedValue = embeddedValue[k];
      } else {
        embeddedValue = undefined;
        break;
      }
    }

    if (embeddedValue && typeof embeddedValue === "object" && "label" in embeddedValue) {
      return embeddedValue.label;
    }

    if (embeddedValue && typeof embeddedValue === "string") {
      return embeddedValue;
    }

    // Return key if no translation found
    return key;
  };

  // Format dates in French
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "PPP", { locale: fr });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Embedded fallback translations
const embeddedTranslations = {
  fr: {
    home: "Accueil",
    "nav.home": "Accueil",
    "nav.work": "Travail",
    "nav.portfolio": "Portfolio",
    "nav.projects": "Projets",
    "nav.content": "Contenu",
    "nav.blog": "Blog",
    "nav.journal": "Journal",
    "nav.now": "Maintenant",
    "nav.resources": "Ressources",
    "nav.tools": "Outils",
    "nav.guides": "Guides",
    "nav.downloads": "Téléchargements",
    "nav.about": "À propos",
    "nav.resume": "CV",
    "nav.contact": "Contact",
    portfolio: "Portfolio",
    blog: "Blog",
    journal: "Journal",
    now: "Maintenant",
    resources: "Ressources",
    tools: "Outils",
    guides: "Guides",
    downloads: "Téléchargements",
    "common.comingSoon": "Bientôt disponible",
    "common.comingSoonDescription": "Cette fonctionnalité est en cours de développement.",
    "footer.description": "Expert en données et technologies — Création d'expériences numériques.",
    "footer.quickLinks": "Liens rapides",
    "footer.stayUpdated": "Restez informé",
    "footer.allRightsReserved": "Tous droits réservés.",
  },
};
