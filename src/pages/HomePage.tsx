
import HeroSection from "@/components/home/hero-section";
import ServicesSection from "@/components/home/services-section";
import FeaturedProjects from "@/components/home/featured-projects";
import TestimonialsSection from "@/components/home/testimonials";
import LatestPosts from "@/components/home/latest-posts";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedProjects />
      <TestimonialsSection />
      <LatestPosts />
    </>
  );
};

export default HomePage;
