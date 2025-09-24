import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Layout } from "./Layout";

const SUPPORTED_LANGUAGES: Language[] = ["en", "fr", "ht"];
const DEFAULT_LANGUAGE: Language = "fr";

export const LocalizedLayout = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { setLanguage } = useLanguage();

  // Update language when the URL param changes
  useEffect(() => {
    if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
      setLanguage(lang as Language);
    }
  }, [lang, setLanguage]);

  // Redirect invalid language codes to default
  if (lang && !SUPPORTED_LANGUAGES.includes(lang as Language)) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  return <Layout />;
};
