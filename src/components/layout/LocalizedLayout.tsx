import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Layout } from "./Layout";

// Supported languages
const SUPPORTED_LANGUAGES: Language[] = ["en", "fr", "ht"];
const DEFAULT_LANGUAGE: Language = "fr";

// Type for JSON translation files
type Translations = {
  navbar?: Record<string, any>;
  footer?: Record<string, any>;
  about?: Record<string, any>;
  blog?: Record<string, any>;
  contact?: Record<string, any>;
  hero?: Record<string, any>;
  portfolio?: Record<string, any>;
  resources?: Record<string, any>;
  services?: Record<string, any>;
};

export const LocalizedLayout = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { setLanguage } = useLanguage();

  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  const currentLang =
    lang && SUPPORTED_LANGUAGES.includes(lang as Language)
      ? (lang as Language)
      : null;

  // Redirect invalid language codes
  if (lang && !currentLang) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  // Update language in context
  useEffect(() => {
    if (currentLang) {
      setLanguage(currentLang);
    }
  }, [currentLang, setLanguage]);

  // Dynamically load all translation JSONs
  useEffect(() => {
    if (!currentLang) return;

    const loadTranslations = async () => {
      setLoading(true);
      try {
        const files: (keyof Translations)[] = [
          "navbar",
          "footer",
          "about",
          "blog",
          "contact",
          "hero",
          "portfolio",
          "resources",
          "services",
        ];

        const loaded: Translations = {};

        await Promise.all(
          files.map(async (file) => {
            const module = await import(
              /* @vite-ignore */ `/locales/${currentLang}/${file}.json`
            );
            loaded[file] = module.default;
          })
        );

        setTranslations(loaded);
      } catch (err) {
        console.error("Error loading translations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [currentLang]);

  // Loading fallback
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Render the Layout with translations (Layout already renders <Outlet />)
  return <Layout translations={translations} />;
};
