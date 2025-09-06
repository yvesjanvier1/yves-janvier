
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

export const SEOInternational = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const baseUrl = 'https://yvesjanvier.com';
  
  // Extract clean path without language prefix for canonical URL construction
  const pathSegments = location.pathname.split('/');
  const hasLangPrefix = ['en', 'fr', 'ht'].includes(pathSegments[1]);
  const cleanPath = hasLangPrefix ? pathSegments.slice(2).join('/') : pathSegments.slice(1).join('/');
  const basePath = cleanPath ? `/${cleanPath}` : '';

  const alternates = [
    { lang: 'en', href: `${baseUrl}/en${basePath}` },
    { lang: 'fr', href: `${baseUrl}/fr${basePath}` },
    { lang: 'ht', href: `${baseUrl}/ht${basePath}` }
  ];

  return (
    <Helmet>
      {alternates.map(({ lang, href }) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={href}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/fr${basePath}`} />
      <link rel="canonical" href={`${baseUrl}/${language}${basePath}`} />
      <meta name="language" content={language} />
    </Helmet>
  );
};
