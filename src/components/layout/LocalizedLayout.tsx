import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Layout } from './Layout';

export const LocalizedLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const { setLanguage } = useLanguage();

  // Validate and set language from URL
  useEffect(() => {
    if (lang && ['en', 'fr', 'ht'].includes(lang)) {
      setLanguage(lang as Language);
    }
  }, [lang, setLanguage]);

  // Redirect invalid language codes
  if (lang && !['en', 'fr', 'ht'].includes(lang)) {
    return <Navigate to="/fr" replace />;
  }

  return <Layout />;
};