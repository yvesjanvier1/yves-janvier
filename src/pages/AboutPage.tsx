import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";

interface AboutData {
  id: string;
  bio: string;
  profile_image: string | null;
  resume_url: string | null;
}

interface Skill {
  id: string;
  category: string;
  items: string[];
}

interface Experience {
  id: string;
  year_range: string;
  role: string;
  company: string;
  description: string;
}

const AboutPage = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // Fetch about page data
        const { data: aboutResult, error: aboutError } = await supabase
          .from("about_page")
          .select("*")
          .single();

        if (aboutError) throw aboutError;

        // Fetch skills
        const { data: skillsResult, error: skillsError } = await supabase
          .from("skills")
          .select("*")
          .order("created_at", { ascending: true });

        if (skillsError) throw skillsError;

        // Fetch experience
        const { data: experienceResult, error: experienceError } = await supabase
          .from("experience")
          .select("*")
          .order("year_range", { ascending: false });

        if (experienceError) throw experienceError;

        setAboutData(aboutResult);
        setSkills(skillsResult || []);
        setTimeline(experienceResult || []);
      } catch (error) {
        console.error("Error fetching about page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (isLoading) {
    return (
      <ResponsiveContainer className="py-16 md:py-24">
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">Loading profile data...</div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (!aboutData) {
    return (
      <ResponsiveContainer className="py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-xl">About page data not available.</h2>
        </div>
      </ResponsiveContainer>
    );
  }

  const bioLines = aboutData.bio.split('\n\n');

  return (
    <ResponsiveContainer className="py-16 md:py-24">
      {/* Main content grid */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 lg:grid-cols-3 gap-12'} mb-16`}>
        <div className="lg:col-span-2">
          <SectionHeader 
            title="About Me"
            subtitle="Learn more about my background, skills, and expertise"
          />
          
          <div className="space-y-6 text-lg">
            {bioLines.map((paragraph, index) => (
              <p key={index} className="leading-relaxed">{paragraph}</p>
            ))}
          </div>
          
          {aboutData.resume_url && (
            <div className="mt-8">
              <Button className="flex items-center w-full sm:w-auto" asChild>
                <a href={aboutData.resume_url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {aboutData.profile_image && (
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={aboutData.profile_image} 
                alt="Profile"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-4">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-3 border border-input rounded-md hover:bg-secondary transition-colors min-h-[44px] flex items-center justify-center"
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-3 border border-input rounded-md hover:bg-secondary transition-colors min-h-[44px] flex items-center justify-center"
            >
              GitHub
            </a>
            <a 
              href="mailto:contact@yvesjanvier.com" 
              className="text-center py-3 border border-input rounded-md hover:bg-secondary transition-colors min-h-[44px] flex items-center justify-center"
            >
              Email Me
            </a>
          </div>
        </div>
      </div>
      
      {/* Skills section */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8">Technical Skills & Expertise</h2>
        
        <ResponsiveGrid 
          cols={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="md"
        >
          {skills.map((skillGroup) => (
            <div 
              key={skillGroup.id} 
              className="bg-card border rounded-lg p-6 h-full"
            >
              <h3 className="font-semibold text-lg mb-3">{skillGroup.category}</h3>
              <ul className="space-y-2">
                {skillGroup.items.map((skill, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                    <span className="text-sm sm:text-base">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ResponsiveGrid>
      </div>
      
      {/* Timeline section */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Professional Journey</h2>
        
        <div className="space-y-8">
          {timeline.map((item) => (
            <div key={item.id} className="relative pl-8 pb-8 border-l border-border">
              <div className="absolute left-0 top-0 w-4 h-4 bg-primary rounded-full -translate-x-2"></div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">{item.year_range}</div>
              <h3 className="text-lg font-semibold">{item.role}</h3>
              <div className="text-primary font-medium mb-2">{item.company}</div>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default AboutPage;
