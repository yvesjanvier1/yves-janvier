import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    // First check localStorage, then browser language, then default
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['fr', 'en', 'ht'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      const detectedLanguage = detectBrowserLanguage();
      setLanguage(detectedLanguage);
      localStorage.setItem('language', detectedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document language attribute for accessibility and SEO
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key] || translations.fr[key] || key;
    
    // Log missing translations in development
    if (process.env.NODE_ENV === 'development' && !translations[language]?.[key]) {
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

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.portfolio': 'Portfolio',
    'nav.blog': 'Blog',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.greeting': 'Bonjour, je suis',
    'hero.title': 'Expert Data & Tech',
    'hero.subtitle': 'Spécialisé dans la transformation de données complexes en insights exploitables et la création de solutions technologiques innovantes.',
    'hero.cta.portfolio': 'Voir mon travail',
    'hero.cta.contact': 'Me contacter',
    
    // Services
    'services.title': 'Services',
    'services.subtitle': 'Solutions complètes de données et de technologie',
    
    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.subtitle': 'Présentation de mes derniers travaux et projets',
    'portfolio.featuredProjects': 'Projets en vedette',
    'portfolio.featuredProjectsSubtitle': 'Découvrez mes derniers projets et réalisations',
    'portfolio.viewProject': 'Voir le projet',
    'portfolio.readMore': 'Lire plus',
    'portfolio.viewAll': 'Voir tous les projets',
    'portfolio.noProjectsFound': 'Aucun projet trouvé',
    'portfolio.noProjectsMessage': 'Essayez d\'ajuster votre recherche ou filtre pour trouver ce que vous cherchez.',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Aperçus sur les données, la technologie et l\'innovation',
    'blog.readMore': 'Lire plus',
    'blog.viewAll': 'Voir tous les articles',
    'blog.latestPosts': 'Derniers articles du Blog',
    'blog.latestPostsSubtitle': 'Aperçus, tutoriels et réflexions sur les données et la tech',
    'blog.noPostsFound': 'Aucun article trouvé',
    'blog.noPostsMessage': 'Essayez d\'ajuster votre recherche ou filtre pour trouver ce que vous cherchez.',
    'blog.searchPlaceholder': 'Rechercher des articles...',
    
    // Contact
    'contact.title': 'Me contacter',
    'contact.subtitle': 'Contactez-moi pour des collaborations, consultations ou simplement pour dire bonjour',
    'contact.letsConnect': 'Connectons-nous',
    'contact.description': 'Que vous recherchiez une expertise en données et technologie, ayez une question sur mon travail, ou souhaitiez simplement vous connecter, j\'aimerais avoir de vos nouvelles.',
    'contact.form.name': 'Nom',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Sujet',
    'contact.form.message': 'Message',
    'contact.form.send': 'Envoyer le message',
    'contact.form.sending': 'Envoi en cours...',
    'contact.form.namePlaceholder': 'Votre nom',
    'contact.form.emailPlaceholder': 'votre.email@exemple.com',
    'contact.form.subjectPlaceholder': 'De quoi s\'agit-il ?',
    'contact.form.messagePlaceholder': 'Votre message...',
    'contact.success.title': 'Message envoyé',
    'contact.success.description': 'Merci pour votre message. Je vous répondrai bientôt !',
    'contact.error.title': 'Erreur',
    'contact.error.description': 'Il y a eu un problème lors de l\'envoi de votre message. Veuillez réessayer.',
    
    // Footer
    'footer.quickLinks': 'Liens rapides',
    'footer.connect': 'Se connecter',
    'footer.socialMedia': 'Réseaux sociaux',
    'footer.copyright': 'Tous droits réservés.',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.backTo': 'Retour à',
    'common.publishedOn': 'Publié le',
    'common.updated': 'Mis à jour',
    'common.all': 'Tout',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.previous': 'Précédent',
    'common.next': 'Suivant',
    'common.page': 'Page',
    'common.of': 'sur',
    
    // 404 Page
    '404.title': 'Page non trouvée',
    '404.description': 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    '404.backHome': 'Retour à l\'accueil',
    '404.searchPlaceholder': 'Rechercher...',
    
    // Testimonials
    'testimonials.title': 'Témoignages',
    'testimonials.subtitle': 'Ce que disent mes clients et partenaires'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.portfolio': 'Portfolio',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.greeting': 'Hello, I\'m',
    'hero.title': 'Data & Tech Expert',
    'hero.subtitle': 'Specializing in transforming complex data into actionable insights and building innovative tech solutions.',
    'hero.cta.portfolio': 'View My Work',
    'hero.cta.contact': 'Get In Touch',
    
    // Services
    'services.title': 'Services',
    'services.subtitle': 'Comprehensive data and technology solutions',
    
    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.subtitle': 'Showcasing my latest work and projects',
    'portfolio.featuredProjects': 'Featured Projects',
    'portfolio.featuredProjectsSubtitle': 'Discover my latest projects and achievements',
    'portfolio.viewProject': 'View Project',
    'portfolio.readMore': 'Read More',
    'portfolio.viewAll': 'View All Projects',
    'portfolio.noProjectsFound': 'No projects found',
    'portfolio.noProjectsMessage': 'Try adjusting your search or filter to find what you\'re looking for.',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Insights on data, technology, and innovation',
    'blog.readMore': 'Read More',
    'blog.viewAll': 'View All Posts',
    'blog.latestPosts': 'Latest from the Blog',
    'blog.latestPostsSubtitle': 'Insights, tutorials, and thoughts on data and tech',
    'blog.noPostsFound': 'No posts found',
    'blog.noPostsMessage': 'Try adjusting your search or filter to find what you\'re looking for.',
    'blog.searchPlaceholder': 'Search posts...',
    
    // Contact
    'contact.title': 'Contact Me',
    'contact.subtitle': 'Get in touch for collaborations, consultations, or just to say hello',
    'contact.letsConnect': 'Let\'s Connect',
    'contact.description': 'Whether you\'re looking for data and technology expertise, have a question about my work, or just want to connect, I\'d love to hear from you.',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.namePlaceholder': 'Your name',
    'contact.form.emailPlaceholder': 'your.email@example.com',
    'contact.form.subjectPlaceholder': 'What is this regarding?',
    'contact.form.messagePlaceholder': 'Your message...',
    'contact.success.title': 'Message Sent',
    'contact.success.description': 'Thank you for your message. I\'ll get back to you soon!',
    'contact.error.title': 'Error',
    'contact.error.description': 'There was a problem sending your message. Please try again.',
    
    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.connect': 'Connect',
    'footer.socialMedia': 'Social Media',
    'footer.copyright': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.backTo': 'Back to',
    'common.publishedOn': 'Published on',
    'common.updated': 'Updated',
    'common.all': 'All',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.previous': 'Previous',
    'common.next': 'Next',
    'common.page': 'Page',
    'common.of': 'of',
    
    // 404 Page
    '404.title': 'Page Not Found',
    '404.description': 'The page you\'re looking for doesn\'t exist or has been moved.',
    '404.backHome': 'Back to Home',
    '404.searchPlaceholder': 'Search...',
    
    // Testimonials
    'testimonials.title': 'Testimonials',
    'testimonials.subtitle': 'What my clients and partners say'
  },
  ht: {
    // Navigation
    'nav.home': 'Lakay',
    'nav.portfolio': 'Travay yo',
    'nav.blog': 'Blog',
    'nav.about': 'Konsènan',
    'nav.contact': 'Kontak',
    
    // Hero Section
    'hero.greeting': 'Bonjou, mwen se',
    'hero.title': 'Ekspè nan Done ak Teknoloji',
    'hero.subtitle': 'Mwen spesyaliste nan transfòme done konplèks yo nan ensèt ki ka itilize ak kreye solisyon teknolojik inovatè yo.',
    'hero.cta.portfolio': 'Gade travay mwen',
    'hero.cta.contact': 'Kontakte mwen',
    
    // Services
    'services.title': 'Sèvis yo',
    'services.subtitle': 'Solisyon done ak teknoloji konplè',
    
    // Portfolio
    'portfolio.title': 'Travay yo',
    'portfolio.subtitle': 'Montre dènye travay ak pwojè mwen yo',
    'portfolio.featuredProjects': 'Pwojè yo ki nan tèt la',
    'portfolio.featuredProjectsSubtitle': 'Dekouvri dènye pwojè ak reyalizasyon mwen yo',
    'portfolio.viewProject': 'Gade pwojè a',
    'portfolio.readMore': 'Li plis',
    'portfolio.viewAll': 'Gade tout pwojè yo',
    'portfolio.noProjectsFound': 'Pa gen pwojè yo jwenn',
    'portfolio.noProjectsMessage': 'Eseye ajiste rechèch ou a oswa filtè a pou jwenn sa w ap chèche a.',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Konesans sou done, teknoloji, ak inovasyon',
    'blog.readMore': 'Li plis',
    'blog.viewAll': 'Gade tout atik yo',
    'blog.latestPosts': 'Dènye atik yo nan Blog la',
    'blog.latestPostsSubtitle': 'Konesans, tutorial, ak reflexyon sou done ak teknoloji',
    'blog.noPostsFound': 'Pa gen atik yo jwenn',
    'blog.noPostsMessage': 'Eseye ajiste rechèch ou a oswa filtè a pou jwenn sa w ap chèche a.',
    'blog.searchPlaceholder': 'Chèche atik yo...',
    
    // Contact
    'contact.title': 'Kontakte mwen',
    'contact.subtitle': 'Kontakte mwen pou kolaborasyon, konsèy, oswa jis pou di bonjou',
    'contact.letsConnect': 'Ann konekte',
    'contact.description': 'Kit ou ap chèche ekspètiz nan done ak teknoloji, gen yon kesyon sou travay mwen, oswa ou jis vle konekte, mwen ta renmen tande nan men ou.',
    'contact.form.name': 'Non',
    'contact.form.email': 'Imel',
    'contact.form.subject': 'Sijè',
    'contact.form.message': 'Mesaj',
    'contact.form.send': 'Voye mesaj',
    'contact.form.sending': 'Ap voye...',
    'contact.form.namePlaceholder': 'Non ou',
    'contact.form.emailPlaceholder': 'imel.ou@egzanp.com',
    'contact.form.subjectPlaceholder': 'Sa ki konsènen?',
    'contact.form.messagePlaceholder': 'Mesaj ou...',
    'contact.success.title': 'Mesaj voye',
    'contact.success.description': 'Mèsi pou mesaj ou. Mwen pral reponn ou byento!',
    'contact.error.title': 'Erè',
    'contact.error.description': 'Te gen yon pwoblèm nan voye mesaj ou. Tanpri eseye ankò.',
    
    // Footer
    'footer.quickLinks': 'Lyen rapid yo',
    'footer.connect': 'Konekte',
    'footer.socialMedia': 'Rezo sosyal yo',
    'footer.copyright': 'Tout dwa rezève.',
    
    // Common
    'common.loading': 'Ap chaje...',
    'common.error': 'Erè',
    'common.retry': 'Eseye ankò',
    'common.backTo': 'Retounen nan',
    'common.publishedOn': 'Pibliye nan',
    'common.updated': 'Mizajou',
    'common.all': 'Tout',
    'common.search': 'Chèche',
    'common.filter': 'Filtè',
    'common.previous': 'Anvan',
    'common.next': 'Pwochen',
    'common.page': 'Paj',
    'common.of': 'sou',
    
    // 404 Page
    '404.title': 'Paj la pa jwenn',
    '404.description': 'Paj w ap chèche a pa egziste oswa yo deplase li.',
    '404.backHome': 'Retounen lakay',
    '404.searchPlaceholder': 'Chèche...',
    
    // Testimonials
    'testimonials.title': 'Temwayaj yo',
    'testimonials.subtitle': 'Sa kliyan ak patnè mwen yo di'
  }
};
