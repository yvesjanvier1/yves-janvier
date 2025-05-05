
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="container px-4 py-16 md:py-24 mx-auto">
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">Loading profile data...</div>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="container px-4 py-16 md:py-24 mx-auto">
        <div className="text-center">
          <h2 className="text-xl">About page data not available.</h2>
        </div>
      </div>
    );
  }

  const bioLines = aboutData.bio.split('\n\n');

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2">
          <SectionHeader 
            title="About Me"
            subtitle="Learn more about my background, skills, and expertise"
          />
          
          <div className="space-y-6 text-lg">
            {bioLines.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {aboutData.resume_url && (
            <div className="mt-8">
              <Button className="flex items-center" asChild>
                <a href={aboutData.resume_url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <div>
          {aboutData.profile_image && (
            <div className="aspect-square rounded-lg overflow-hidden mb-6">
              <img 
                src={aboutData.profile_image} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-4">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              GitHub
            </a>
            <a 
              href="mailto:contact@yvesjanvier.com" 
              className="text-center py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              Email Me
            </a>
          </div>
        </div>
      </div>
      
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8">Technical Skills & Expertise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup) => (
            <div 
              key={skillGroup.id} 
              className="bg-card border rounded-lg p-6"
            >
              <h3 className="font-semibold text-lg mb-3">{skillGroup.category}</h3>
              <ul className="space-y-2">
                {skillGroup.items.map((skill, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-8">Professional Journey</h2>
        
        <div className="space-y-8">
          {timeline.map((item) => (
            <div key={item.id} className="relative pl-8 pb-8 border-l border-border">
              <div className="absolute left-0 top-0 w-4 h-4 bg-primary rounded-full -translate-x-2"></div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">{item.year_range}</div>
              <h3 className="text-lg font-semibold">{item.role}</h3>
              <div className="text-primary font-medium mb-2">{item.company}</div>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
