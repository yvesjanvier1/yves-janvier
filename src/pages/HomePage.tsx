
import HeroSection from "@/components/home/hero-section";
import { LazyComponent } from "@/components/ui/lazy-component";
import SEOHead from "@/components/seo/SEOHead";
import { ExitIntentModal } from "@/components/modals/ExitIntentModal";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";
import { useExitIntentModal } from "@/hooks/useExitIntentModal";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Suspense, lazy } from "react";

// Lazy load non-critical sections
const FeaturedProjects = lazy(() => import("@/components/home/featured-projects").then(module => ({ default: module.FeaturedProjects })));
const JournalActivities = lazy(() => import("@/components/home/journal-activities").then(module => ({ default: module.JournalActivities })));
const ServicesSection = lazy(() => import("@/components/home/services-section"));
const Testimonials = lazy(() => import("@/components/home/testimonials"));
const LatestPosts = lazy(() => import("@/components/home/latest-posts"));
const NewsletterSection = lazy(() => import("@/components/home/newsletter-section").then(module => ({ default: module.NewsletterSection })));

const HomePage = () => {
  const { isModalOpen, closeModal, handleSubscribe } = useExitIntentModal();
  const { shouldShowBanner, handleConsent } = useCookieConsent();

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
      <div className="h-32 bg-muted animate-pulse rounded w-full" />
    </div>
  );

  return (
    <>
      <SEOHead 
        title="Yves Janvier - Full Stack Developer & Data Engineer | Portfolio"
        description="Experienced full-stack developer and data engineer specializing in web development, machine learning, data analytics, and process automation. View my portfolio of innovative digital solutions."
        tags={["Yves Janvier", "full stack developer", "data engineer", "portfolio", "web development", "machine learning", "React", "Python", "JavaScript", "data analytics"]}
        author="Yves Janvier"
        type="website"
      />
      
      {/* Critical above-the-fold content */}
      <HeroSection />
      
      {/* Lazy load below-the-fold sections */}
      <LazyComponent fallback={<LoadingSkeleton />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <FeaturedProjects />
        </Suspense>
      </LazyComponent>

      <LazyComponent fallback={<LoadingSkeleton />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <JournalActivities />
        </Suspense>
      </LazyComponent>

      <LazyComponent fallback={<LoadingSkeleton />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <ServicesSection />
        </Suspense>
      </LazyComponent>

      <LazyComponent fallback={<LoadingSkeleton />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <Testimonials />
        </Suspense>
      </LazyComponent>

      <LazyComponent fallback={<LoadingSkeleton />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <LatestPosts />
        </Suspense>
      </LazyComponent>

      <LazyComponent fallback={<LoadingSkeleton />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <NewsletterSection />
        </Suspense>
      </LazyComponent>
      
      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubscribe={handleSubscribe}
      />

      {/* Cookie Consent Banner */}
      {shouldShowBanner && (
        <CookieConsentBanner onConsent={handleConsent} />
      )}
    </>
  );
};

export default HomePage;
