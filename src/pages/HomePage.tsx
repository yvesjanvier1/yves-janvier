
import HeroSection from "@/components/home/hero-section";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { JournalActivities } from "@/components/home/journal-activities";
import ServicesSection from "@/components/home/services-section";
import Testimonials from "@/components/home/testimonials";
import LatestPosts from "@/components/home/latest-posts";
import SEOHead from "@/components/seo/SEOHead";

const HomePage = () => {
  return (
    <>
      <SEOHead 
        title="Professional Portfolio - Developer & Designer"
        description="Welcome to my professional portfolio showcasing projects, skills, and experience in web development and design."
      />
      <HeroSection />
      <FeaturedProjects />
      <JournalActivities />
      <ServicesSection />
      <Testimonials />
      <LatestPosts />
    </>
  );
};

export default HomePage;
