import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'fr' | 'ht';

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      portfolio: 'Portfolio',
      blog: 'Blog',
      about: 'À propos',
      contact: 'Contact',
      work: 'Travail',
      content: 'Contenu',
      resources: 'Ressources',
    },
    hero: {
      greeting: 'Salut, je suis',
      title: 'Développeur Full-Stack & Expert UX/UI',
      subtitle: 'Je crée des expériences numériques exceptionnelles qui combinent design élégant et code propre.',
      cta: 'Voir mon travail',
      secondary: 'Me contacter',
    },
    home: {
      featuredProjects: 'Projets en vedette',
      viewAllProjects: 'Voir tous les projets',
      latestPosts: 'Derniers articles',
      viewAllPosts: 'Voir tous les articles',
      journalActivities: 'Activités du journal',
      viewAllEntries: 'Voir toutes les entrées',
      services: 'Services',
      whatIOffer: 'Ce que j\'offre',
      testimonials: 'Témoignages',
      whatClientsSay: 'Ce que disent mes clients',
      newsletter: 'Newsletter',
      stayUpdated: 'Restez informé',
      newsletterDescription: 'Recevez les dernières mises à jour sur mes projets et articles.',
    },
    now: {
      title: 'Ce que je fais maintenant',
      subtitle: 'Mes activités et projets actuels',
      workingOn: 'Je travaille sur',
      currentlyLearning: 'J\'apprends actuellement',
      usingRightNow: 'J\'utilise en ce moment',
      listeningTo: 'J\'écoute',
      lastUpdated: 'Dernière mise à jour',
    },
    footer: {
      description: 'Développeur Full-Stack passionné par la création d\'expériences numériques exceptionnelles.',
      quickLinks: 'Liens rapides',
      connect: 'Se connecter',
      newsletter: 'Newsletter',
      allRightsReserved: 'Tous droits réservés.',
    },
  },
  en: {
    nav: {
      home: 'Home',
      portfolio: 'Portfolio',
      blog: 'Blog',
      about: 'About',
      contact: 'Contact',
      work: 'Work',
      content: 'Content',
      resources: 'Resources',
    },
    hero: {
      greeting: 'Hi, I\'m',
      title: 'Full-Stack Developer & UX/UI Expert',
      subtitle: 'I create exceptional digital experiences that combine elegant design with clean code.',
      cta: 'View my work',
      secondary: 'Get in touch',
    },
    home: {
      featuredProjects: 'Featured Projects',
      viewAllProjects: 'View all projects',
      latestPosts: 'Latest Posts',
      viewAllPosts: 'View all posts',
      journalActivities: 'Journal Activities',
      viewAllEntries: 'View all entries',
      services: 'Services',
      whatIOffer: 'What I offer',
      testimonials: 'Testimonials',
      whatClientsSay: 'What clients say',
      newsletter: 'Newsletter',
      stayUpdated: 'Stay updated',
      newsletterDescription: 'Get the latest updates on my projects and posts.',
    },
    now: {
      title: 'What I\'m doing now',
      subtitle: 'My current activities and projects',
      workingOn: 'I\'m working on',
      currentlyLearning: 'Currently learning',
      usingRightNow: 'Using right now',
      listeningTo: 'Listening to',
      lastUpdated: 'Last updated',
    },
    footer: {
      description: 'Full-Stack Developer passionate about creating exceptional digital experiences.',
      quickLinks: 'Quick Links',
      connect: 'Connect',
      newsletter: 'Newsletter',
      allRightsReserved: 'All rights reserved.',
    },
  },
  ht: {
    nav: {
      home: 'Lakay',
      portfolio: 'Pòtfòy',
      blog: 'Blog',
      about: 'Sou mwen',
      contact: 'Kontak',
      work: 'Travay',
      content: 'Kontni',
      resources: 'Resous',
    },
    hero: {
      greeting: 'Bonjou, mwen se',
      title: 'Depo Full-Stack ak Ekspè UX/UI',
      subtitle: 'Mwen kreye eksperyans dijital eksepsyonèl ki konbine yon bèl design ak kòd pwòp.',
      cta: 'Gade travay mwen',
      secondary: 'Kontakte mwen',
    },
    home: {
      featuredProjects: 'Pwojè ki gen valè',
      viewAllProjects: 'Gade tout pwojè yo',
      latestPosts: 'Dènye atik yo',
      viewAllPosts: 'Gade tout atik yo',
      journalActivities: 'Aktivite jounal yo',
      viewAllEntries: 'Gade tout antre yo',
      services: 'Sèvis yo',
      whatIOffer: 'Sa m ofri',
      testimonials: 'Temwayaj',
      whatClientsSay: 'Sa kliyan yo di',
      newsletter: 'Biletèn',
      stayUpdated: 'Rete enfòme',
      newsletterDescription: 'Resevwa dènye mizajou yo sou pwojè ak atik mwen yo.',
    },
    now: {
      title: 'Sa m ap fè kounye a',
      subtitle: 'Aktivite ak pwojè aktyèl mwen yo',
      workingOn: 'M ap travay sou',
      currentlyLearning: 'M ap aprann kounye a',
      usingRightNow: 'M ap itilize kounye a',
      listeningTo: 'M ap koute',
      lastUpdated: 'Dènye mizajou',
    },
    footer: {
      description: 'Yon depo Full-Stack ki gen pasyon pou kreye eksperyans dijital eksepsyonèl.',
      quickLinks: 'Lyen rapid',
      connect: 'Konekte',
      newsletter: 'Biletèn',
      allRightsReserved: 'Tout dwa yo rezève.',
    },
  },
} as const;

interface TranslationFn {
  (key: string): string;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: any = translations[language];
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k as keyof typeof value];
        } else {
          console.warn(`Translation not found for key: ${key} in language: ${language}`);
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
