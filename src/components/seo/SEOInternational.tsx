
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const SEOInternational = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const baseUrl = 'https://yvesjanvier.com'; // Replace with actual domain
  const path = location.pathname;

  const alternates = [
    { lang: 'en', href: `${baseUrl}/en${path}` },
    { lang: 'fr', href: `${baseUrl}/fr${path}` },
    { lang: 'ht', href: `${baseUrl}/ht${path}` }
  ];

  return (
    <>
      {alternates.map(({ lang, href }) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={href}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/fr${path}`} />
      <meta name="language" content={language} />
    </>
  );
};
