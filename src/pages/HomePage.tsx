
import { useState, useEffect } from "react";
import HeroSection from "@/components/home/hero-section";
import ServicesSection from "@/components/home/services-section";
import FeaturedProjects from "@/components/home/featured-projects";
import TestimonialsSection from "@/components/home/testimonials";
import LatestPosts from "@/components/home/latest-posts";
import { migrateDataToSupabase } from "@/utils/dataMigration";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HomePage = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    if (isMigrating) return;
    
    setIsMigrating(true);
    toast.info("Starting data migration...");
    
    try {
      const result = await migrateDataToSupabase();
      if (result.success) {
        toast.success("Data migration completed successfully!");
      } else {
        toast.error("Data migration failed. See console for details.");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Data migration failed. See console for details.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedProjects />
      <TestimonialsSection />
      <LatestPosts />
      
      {process.env.NODE_ENV === 'development' && (
        <div className="container my-8 py-4 border-t">
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleMigration} 
              disabled={isMigrating}
            >
              {isMigrating ? "Migrating data..." : "Migrate Local Data to Supabase"}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            This button is only visible in development mode. It will copy local data to Supabase.
          </p>
        </div>
      )}
    </>
  );
};

export default HomePage;
