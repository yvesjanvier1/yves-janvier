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

type LayoutProps = {
  translations?: Record<string, any>;
  children?: React.ReactNode;
};

export const Layout = ({ translations = {}, children }: LayoutProps) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <SecurityProvider>
          <SEOInternational />
          <SkipNavigation />

          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header role="banner" aria-label="Main navigation">
              {/* Pass translations to Navbar */}
              <Navbar translations={translations.navbar} />
            </header>

            <main
              className="flex-1"
              id="main-content"
              aria-label="Page content"
            >
              {children || <Outlet context={{ translations }} />}
            </main>

            <footer role="contentinfo" aria-label="Site footer">
              {/* Pass translations to Footer */}
              <Footer translations={translations.footer} />
            </footer>
          </div>

          {/* Announcements */}
          <div role="status" aria-live="polite">
            <Toaster />
          </div>

          {/* Consent Banner */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookieConsentTitle"
            aria-describedby="cookieConsentDesc"
          >
            <CookieConsentBanner onConsent={() => {}} />
          </div>
          <h2 id="cookieConsentTitle" className="sr-only">
            Cookie Consent
          </h2>
          <p id="cookieConsentDesc" className="sr-only">
            This website uses cookies to improve your experience. Accept or
            manage preferences.
          </p>

          {/* Exit Intent Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exitIntentTitle"
            aria-describedby="exitIntentDesc"
          >
            <ExitIntentModal isOpen={false} onClose={() => {}} />
          </div>
          <h2 id="exitIntentTitle" className="sr-only">
            Before you leave
          </h2>
          <p id="exitIntentDesc" className="sr-only">
            Are you sure you want to exit? You might miss important updates.
          </p>

          {/* Invisible tracking/analytics */}
          <PageViewTracker aria-hidden="true" />
          <PerformanceTracker aria-hidden="true" />
        </SecurityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
