
import HeroSection from "@/components/home/hero-section";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { JournalActivities } from "@/components/home/journal-activities";
import ServicesSection from "@/components/home/services-section";
import Testimonials from "@/components/home/testimonials";
import LatestPosts from "@/components/home/latest-posts";
import { NewsletterSection } from "@/components/home/newsletter-section";
import SEOHead from "@/components/seo/SEOHead";
import { ExitIntentModal } from "@/components/modals/ExitIntentModal";
import { useExitIntentModal } from "@/hooks/useExitIntentModal";

const HomePage = () => {
  const { isModalOpen, closeModal, handleSubscribe } = useExitIntentModal();

  return (
    <>
      <SEOHead 
        title="Yves Janvier - Full Stack Developer & Data Engineer | Portfolio"
        description="Experienced full-stack developer and data engineer specializing in web development, machine learning, data analytics, and process automation. View my portfolio of innovative digital solutions."
        tags={["Yves Janvier", "full stack developer", "data engineer", "portfolio", "web development", "machine learning", "React", "Python", "JavaScript", "data analytics"]}
        author="Yves Janvier"
        type="website"
      />
      <HeroSection />
      <FeaturedProjects />
      <JournalActivities />
      <ServicesSection />
      <Testimonials />
      <LatestPosts />
      <NewsletterSection />
      
      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubscribe={handleSubscribe}
      />
    </>
  );
};

export default HomePage;
