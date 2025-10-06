// src/components/layout/Layout.tsx
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

// Remove the translations prop — it's no longer needed
export const Layout = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <SecurityProvider>
          <SEOInternational />
          <SkipNavigation />

          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header role="banner" aria-label="Main navigation">
              {/* ✅ No props needed — uses t() from context */}
              <Navbar />
            </header>

            <main
              className="flex-1"
              id="main-content"
              aria-label="Page content"
            >
              <Outlet />
            </main>

            <footer role="contentinfo" aria-label="Site footer">
              {/* ✅ Same for Footer — should also use t() internally */}
              <Footer />
            </footer>
          </div>

          {/* Announcements */}
          <div role="status" aria-live="polite">
            <Toaster />
          </div>

          {/* Cookie Consent */}
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

          {/* Tracking */}
          <PageViewTracker aria-hidden="true" />
          <PerformanceTracker aria-hidden="true" />
        </SecurityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};