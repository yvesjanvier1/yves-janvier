
import { useEffect } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Headphones, Code, BookOpen } from "lucide-react";
import { useNowPage } from "@/hooks/useNowPage";
import { NowPageSkeleton } from "@/components/ui/loading-skeletons";

const NowPage = () => {
  const { data, isLoading, error } = useNowPage();

  useEffect(() => {
    document.title = "Now – Yves Janvier";
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const sections = [
    {
      title: "I'm Working On",
      icon: Code,
      gradient: "from-[#6C4DFF] to-[#4A90E2]",
      delay: 0,
      items: data?.workingOn || []
    },
    {
      title: "Currently Learning",
      icon: BookOpen,
      gradient: "from-[#4A90E2] to-[#FF6B6B]",
      delay: 0.2,
      items: data?.currentlyLearning || []
    },
    {
      title: "Using Right Now",
      icon: Calendar,
      gradient: "from-[#FF6B6B] to-[#6C4DFF]",
      delay: 0.4,
      items: data?.usingRightNow || []
    },
    {
      title: "Listening To",
      icon: Headphones,
      gradient: "from-[#6C4DFF] to-[#FF6B6B]",
      delay: 0.6,
      items: data?.listeningTo || []
    }
  ];

  if (error) {
    return (
      <ResponsiveContainer className="py-16">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Page</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Now – Yves Janvier"
        description="What I'm working on, learning, and loving this month. A personal status update from Yves Janvier."
        url={`${window.location.origin}/content/now`}
        type="website"
      />

      <ResponsiveContainer className="py-8 lg:py-16">
        <AnimatedSection>
          <SectionHeader
            title="What I'm Up To Right Now"
            subtitle={`A glimpse into my current projects, interests, and daily life. ${data?.lastUpdated ? `Last updated: ${formatDate(data.lastUpdated)}` : ''}`}
            centered
          />
        </AnimatedSection>

        {isLoading ? (
          <NowPageSkeleton />
        ) : (
          <div className="grid gap-8 md:gap-12 max-w-4xl mx-auto">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <AnimatedSection
                  key={section.title}
                  delay={section.delay}
                  className="group"
                >
                  <Card className="glass-card hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${section.gradient} shadow-lg`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h2 className={`text-2xl font-bold bg-gradient-to-r ${section.gradient} text-transparent bg-clip-text`}>
                          {section.title}
                        </h2>
                      </div>
                      
                      <div className="space-y-4">
                        {section.items.length > 0 ? (
                          section.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-border transition-colors duration-300"
                            >
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary mt-2 flex-shrink-0"></div>
                              <p className="text-foreground/90 leading-relaxed">
                                {item}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <p>Nothing to show here yet.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        )}

        {/* Inspiration Quote */}
        <AnimatedSection delay={0.8} className="mt-16">
          <Card className="glass-card border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <blockquote className="text-lg italic text-foreground/80 mb-4">
                "The best time to plant a tree was 20 years ago. The second best time is now."
              </blockquote>
              <cite className="text-sm text-muted-foreground">– Chinese Proverb</cite>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Last Updated */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            This page is updated monthly to reflect my current focus and interests.
          </p>
          {data?.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {formatDate(data.lastUpdated)}
            </p>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default NowPage;
