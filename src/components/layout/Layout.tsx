
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

export const Layout = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <SecurityProvider>
          <SEOInternational />
          <SkipNavigation />
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1" id="main-content">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster />
          <CookieConsentBanner onConsent={() => {}} />
          <ExitIntentModal isOpen={false} onClose={() => {}} />
          <PageViewTracker />
          <PerformanceTracker />
        </SecurityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
