import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: "fr",                  // default language
    fallbackLng: "fr",          // fallback if translation is missing
    ns: ["hero", "navbar", "footer", "resources", "blog", "portfolio"], // 🧠 all namespaces you use
    defaultNS: "hero",          // default if you don't specify
    interpolation: {
      escapeValue: false,       // React already escapes values
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // 👈 load each namespace file
    },
    react: {
      useSuspense: false,       // avoids Suspense issues in React
    },
  });

export default i18n;
