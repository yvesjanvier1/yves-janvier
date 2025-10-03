import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";
import { ExitIntentModal } from "@/components/modals/ExitIntentModal";
import { PageViewTracker } from "@/components/PageViewTracker";
import { PerformanceTracker } from "@/components/analytics/PerformanceTracker";
import SkipNavigation from "@/components/accessibility/SkipNavigation";
import { SEOInternational } from "@/components/seo/SEOInternational";

type TranslationFiles = {
  navbar?: Record<string, any>;
  footer?: Record<string, any>;
  [key: string]: Record<string, any> | undefined;
};

type LayoutProps = {
  translations?: TranslationFiles;
};

export const Layout = ({ translations = {} }: LayoutProps) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <SecurityProvider>
          <SEOInternational />
          <SkipNavigation />

          <div className="min-h-screen flex flex-col bg-background text-foreground">
            {/* Navbar with translations */}
            <header role="banner" aria-label="Main navigation">
              <Navbar translations={translations.navbar} />
            </header>

            {/* Main content */}
            <main className="flex-1" id="main-content" aria-label="Page content">
              {/* Pass translations to all nested pages via Outlet context */}
              <Outlet context={{ translations }} />
            </main>

            {/* Footer with translations */}
            <footer role="contentinfo" aria-label="Site footer">
              <Footer translations={translations.footer} />
            </footer>
          </div>

          {/* Global notifications */}
          <div role="status" aria-live="polite">
            <Toaster />
          </div>

          {/* Cookie consent banner */}
          <div role="dialog" aria-modal="true" aria-labelledby="cookieConsentTitle" aria-describedby="cookieConsentDesc">
            <CookieConsentBanner onConsent={() => {}} />
          </div>
          <h2 id="cookieConsentTitle" className="sr-only">Cookie Consent</h2>
          <p id="cookieConsentDesc" className="sr-only">
            This website uses cookies to improve your experience. Accept or manage preferences.
          </p>

          {/* Exit intent modal */}
          <div role="dialog" aria-modal="true" aria-labelledby="exitIntentTitle" aria-describedby="exitIntentDesc">
            <ExitIntentModal isOpen={false} onClose={() => {}} />
          </div>
          <h2 id="exitIntentTitle" className="sr-only">Before you leave</h2>
          <p id="exitIntentDesc" className="sr-only">
            Are you sure you want to exit? You might miss important updates.
          </p>

          {/* Tracking & performance */}
          <PageViewTracker aria-hidden="true" />
          <PerformanceTracker aria-hidden="true" />
        </SecurityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
