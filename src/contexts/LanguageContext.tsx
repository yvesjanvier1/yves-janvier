import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'fr' | 'en' | 'ht';

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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Browser language detection helper
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr'; // Default for SSR
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ht')) return 'ht';
  return 'fr'; // Default to French
};

// Validate language function
const validateLanguage = (lang: any): Language => {
  return ['fr', 'en', 'ht'].includes(lang) ? lang : 'fr';
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract language from URL
  const urlLang = location.pathname.split('/')[1] as Language;
  const isValidLang = ['en', 'fr', 'ht'].includes(urlLang);
  
  const [language, setLanguage] = useState<Language>(isValidLang ? urlLang : 'fr');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    // Load translations from all namespace files
    const loadTranslations = async () => {
      try {
        const namespaces = ['navbar', 'hero', 'portfolio', 'blog', 'footer', 'resources', 'services', 'about', 'contact', 'common'];
        const languages = ['en', 'fr', 'ht'];
        
        const translationPromises = languages.map(async (lang) => {
          const langTranslations: Record<string, any> = {};
          
          // Load each namespace file
          await Promise.all(
            namespaces.map(async (ns) => {
              try {
                const data = await fetch(`/locales/${lang}/${ns}.json`).then(r => r.json());
                // Prefix all keys with namespace
                Object.keys(data).forEach(key => {
                  const prefixedKey = `${ns}.${key}`;
                  langTranslations[prefixedKey] = data[key];
                  
                  // Also handle nested objects for descriptions
                  if (typeof data[key] === 'object' && data[key] !== null) {
                    if ('label' in data[key]) {
                      langTranslations[prefixedKey] = data[key].label;
                    }
                    if ('description' in data[key]) {
                      langTranslations[`${prefixedKey}.description`] = data[key].description;
                    }
                    // Handle nested structures like resources.tools.title
                    Object.keys(data[key]).forEach(subKey => {
                      if (typeof data[key][subKey] === 'object') {
                        Object.keys(data[key][subKey]).forEach(deepKey => {
                          langTranslations[`${prefixedKey}.${subKey}.${deepKey}`] = data[key][subKey][deepKey];
                        });
                      } else {
                        langTranslations[`${prefixedKey}.${subKey}`] = data[key][subKey];
                      }
                    });
                  }
                });
              } catch (error) {
                console.warn(`Failed to load ${lang}/${ns}.json:`, error);
              }
            })
          );
          
          return langTranslations;
        });

        const [enTrans, frTrans, htTrans] = await Promise.all(translationPromises);
        
        setTranslations({
          en: enTrans,
          fr: frTrans,
          ht: htTrans
        });
      } catch (error) {
        console.warn('Failed to load translations:', error);
        // Fallback to embedded translations
        setTranslations(embeddedTranslations);
      }
    };

    loadTranslations();

    // Sync language with URL - only redirect if missing valid language
    if (isValidLang && urlLang !== language) {
      setLanguage(urlLang);
      document.documentElement.lang = urlLang;
      localStorage.setItem('language', urlLang);
      // Set locale in Supabase for RLS filtering
      try {
        supabase.rpc('set_current_locale', { _locale: urlLang });
      } catch (error) {
        console.warn('Failed to set locale:', error);
      }
    } else if (!isValidLang && location.pathname !== '/') {
      // Only redirect if on a path without valid language
      const browserLang = detectBrowserLanguage();
      const savedLang = localStorage.getItem('language') as Language;
      const initialLang = validateLanguage(savedLang) || browserLang;
      
      setLanguage(initialLang);
      document.documentElement.lang = initialLang;
      
      // Redirect to add language prefix
      const newPath = `/${initialLang}${location.pathname}`;
      navigate(newPath, { replace: true });
      
      // Set locale in Supabase for RLS filtering  
      try {
        supabase.rpc('set_current_locale', { _locale: initialLang });
      } catch (error) {
        console.warn('Failed to set locale:', error);
      }
    }
  }, [location.pathname, urlLang, isValidLang, language, navigate]);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update document language
    document.documentElement.lang = newLanguage;
    
    // Set locale in Supabase for RLS filtering
    try {
      supabase.rpc('set_current_locale', { _locale: newLanguage });
    } catch (error) {
      console.warn('Failed to set locale:', error);
    }
    
    // Preserve the full path after the language prefix
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Remove current language if present
    if (pathSegments.length > 0 && ['en', 'fr', 'ht'].includes(pathSegments[0])) {
      pathSegments.shift();
    }
    
    // Build new path with new language
    const newPath = `/${newLanguage}${pathSegments.length > 0 ? '/' + pathSegments.join('/') : ''}`;
    navigate(newPath, { replace: true });
  };

  const t = (key: string): string => {
    // Handle both dot notation (nav.home) and direct keys (home)
    const currentTranslations = translations[language] || embeddedTranslations[language] || {};
    const frenchTranslations = translations.fr || embeddedTranslations.fr || {};
    const englishTranslations = translations.en || embeddedTranslations.en || {};
    
    let translation = currentTranslations[key] || 
                     frenchTranslations[key] || 
                     englishTranslations[key];
    
    // If not found, try without namespace prefix (for backward compatibility)
    if (!translation && key.includes('.')) {
      const withoutNamespace = key.split('.').slice(1).join('.');
      translation = currentTranslations[withoutNamespace] || 
                   frenchTranslations[withoutNamespace] || 
                   englishTranslations[withoutNamespace];
    }
    
    // Return translation or key as fallback
    translation = translation || key;
    
    // Log missing translations in development
    if (process.env.NODE_ENV === 'development' && !currentTranslations[key]) {
      console.warn(`Missing translation for key "${key}" in language "${language}"`);
    }
    
    return translation;
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const locales = {
      fr: 'fr-FR',
      en: 'en-US',
      ht: 'fr-FR' // Using French formatting for Haitian Creole
    };

    return new Intl.DateTimeFormat(locales[language], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Embedded fallback translations (in case external files fail to load)
const embeddedTranslations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.portfolio': 'Portfolio',
    'nav.blog': 'Blog',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.work': 'Travail',
    'nav.content': 'Contenu',
    'nav.resources': 'Ressources',
    'nav.journal': 'Journal',
    'nav.now': 'Maintenant',
    'nav.projects': 'Projets',
    'nav.resume': 'CV',
    'nav.descriptions.portfolio': 'Voir mon portfolio complet',
    'nav.descriptions.blog': 'Derniers articles et insights',
    'nav.descriptions.aboutMe': 'En savoir plus sur moi',
    'nav.descriptions.getInTouch': 'Prendre contact',
    'nav.descriptions.projects': 'Projets en vedette et études de cas',
    'nav.descriptions.journal': 'Mises à jour et activités de projet',
    'nav.descriptions.now': 'Ce sur quoi je travaille actuellement',
    'nav.descriptions.resume': 'Voir mon CV',
    
    // Hero Section
    'hero.greeting': 'Bonjour, je suis',
    'hero.title': 'Expert Data & Tech',
    'hero.subtitle': 'Spécialisé dans la transformation de données complexes en insights exploitables et la création de solutions technologiques innovantes.',
    'hero.cta.portfolio': 'Voir mon travail',
    'hero.cta.contact': 'Me contacter',
    'hero.stats.projectsCompleted': 'Projets Réalisés',
    'hero.stats.yearsExperience': 'Années d\'Expérience',
    'hero.stats.clientSatisfaction': 'Satisfaction Client',
    'hero.stats.scrollDown': 'Défiler vers le bas',
    
    // Resources
    'resources.tools.title': 'Outils',
    'resources.tools.description': 'Outils de développement utiles',
    'resources.guides.title': 'Guides',
    'resources.guides.description': 'Tutoriels étape par étape',
    'resources.downloads.title': 'Téléchargements',
    'resources.downloads.description': 'Ressources et modèles gratuits',
    
    // Footer
    'footer.description': 'Développeur Full Stack et Ingénieur Data créant des solutions digitales innovantes.',
    'footer.quickLinks': 'Liens rapides',
    'footer.stayUpdated': 'Restez informé',
    'footer.allRightsReserved': 'Tous droits réservés.',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.comingSoon': 'Bientôt disponible',
    'common.comingSoonDescription': 'Cette fonctionnalité est en cours de développement.',
    'common.changeLanguage': 'Changer de langue',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.portfolio': 'Portfolio',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.work': 'Work',
    'nav.content': 'Content',
    'nav.resources': 'Resources',
    'nav.journal': 'Journal',
    'nav.now': 'Now',
    'nav.projects': 'Projects',
    'nav.resume': 'Resume',
    'nav.descriptions.portfolio': 'View my complete portfolio',
    'nav.descriptions.blog': 'Latest articles and insights',
    'nav.descriptions.aboutMe': 'Learn more about me',
    'nav.descriptions.getInTouch': 'Get in touch',
    'nav.descriptions.projects': 'Featured projects and case studies',
    'nav.descriptions.journal': 'Project updates and activities',
    'nav.descriptions.now': 'What I\'m currently working on',
    'nav.descriptions.resume': 'View my resume',
    
    // Hero Section
    'hero.greeting': 'Hello, I\'m',
    'hero.title': 'Data & Tech Expert',
    'hero.subtitle': 'Specializing in transforming complex data into actionable insights and building innovative tech solutions.',
    'hero.cta.portfolio': 'View My Work',
    'hero.cta.contact': 'Get In Touch',
    'hero.stats.projectsCompleted': 'Projects Completed',
    'hero.stats.yearsExperience': 'Years of Experience',
    'hero.stats.clientSatisfaction': 'Client Satisfaction',
    'hero.stats.scrollDown': 'Scroll Down',
    
    // Resources
    'resources.tools.title': 'Tools',
    'resources.tools.description': 'Useful development tools',
    'resources.guides.title': 'Guides',
    'resources.guides.description': 'Step-by-step tutorials',
    'resources.downloads.title': 'Downloads',
    'resources.downloads.description': 'Free resources and templates',
    
    // Footer
    'footer.description': 'Full Stack Developer & Data Engineer creating innovative digital solutions.',
    'footer.quickLinks': 'Quick Links',
    'footer.stayUpdated': 'Stay Updated',
    'footer.allRightsReserved': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.comingSoon': 'Coming Soon!',
    'common.comingSoonDescription': 'This feature is under development.',
    'common.changeLanguage': 'Change language',
  },
  ht: {
    // Navigation
    'nav.home': 'Lakay',
    'nav.portfolio': 'Travay yo',
    'nav.blog': 'Blog',
    'nav.about': 'Konsènan',
    'nav.contact': 'Kontak',
    'nav.work': 'Travay',
    'nav.content': 'Kontni',
    'nav.resources': 'Resous yo',
    'nav.journal': 'Jounal',
    'nav.now': 'Kounye a',
    'nav.projects': 'Pwojè yo',
    'nav.resume': 'CV',
    'nav.descriptions.portfolio': 'Gade travay konplè mwen',
    'nav.descriptions.blog': 'Dènye atik ak konesans yo',
    'nav.descriptions.aboutMe': 'Aprann plis sou mwen',
    'nav.descriptions.getInTouch': 'Kontakte mwen',
    'nav.descriptions.projects': 'Pwojè yo ki nan tèt la ak etid ka yo',
    'nav.descriptions.journal': 'Mizajou pwojè ak aktivite yo',
    'nav.descriptions.now': 'Sa mwen ap travay sou kounye a',
    'nav.descriptions.resume': 'Gade CV mwen',
    
    // Hero Section
    'hero.greeting': 'Bonjou, mwen se',
    'hero.title': 'Ekspè nan Done ak Teknoloji',
    'hero.subtitle': 'Mwen spesyaliste nan transfòme done konplèks yo nan ensèt ki ka itilize ak kreye solisyon teknolojik inovatè yo.',
    'hero.cta.portfolio': 'Gade travay mwen',
    'hero.cta.contact': 'Kontakte mwen',
    'hero.stats.projectsCompleted': 'Pwojè yo Fini',
    'hero.stats.yearsExperience': 'Ane Ekspèyans',
    'hero.stats.clientSatisfaction': 'Satisfaksyon Kliyan',
    'hero.stats.scrollDown': 'Desann',
    
    // Resources
    'resources.tools.title': 'Zouti yo',
    'resources.tools.description': 'Zouti devlopman itil yo',
    'resources.guides.title': 'Gid yo',
    'resources.guides.description': 'Tutorial etap pa etap yo',
    'resources.downloads.title': 'Telechajman yo',
    'resources.downloads.description': 'Resous ak modèl gratis yo',
    
    // Footer
    'footer.description': 'Devlopè Full Stack ak Enjenyè Done k ap kreye solisyon dijital inovatè yo.',
    'footer.quickLinks': 'Lyen rapid yo',
    'footer.stayUpdated': 'Rete enfòme',
    'footer.allRightsReserved': 'Tout dwa rezève.',
    
    // Common
    'common.loading': 'Ap chaje...',
    'common.error': 'Erè',
    'common.retry': 'Eseye ankò',
    'common.comingSoon': 'Ap vini byento!',
    'common.comingSoonDescription': 'Fonksyon sa a nan devlopman.',
    'common.changeLanguage': 'Chanje lang',
  }
};