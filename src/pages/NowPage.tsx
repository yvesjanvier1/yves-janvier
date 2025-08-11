
import { useEffect } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Headphones, Code, BookOpen } from "lucide-react";
import { useNowPage } from "@/hooks/useNowPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

const NowPage = () => {
  const { data, isLoading, error } = useNowPage();
  const { t, formatDate } = useLanguage();

  useEffect(() => {
    document.title = `${t('now.title')} – Yves Janvier`;
  }, [t]);

  const sections = [
    {
      title: t('now.workingOn'),
      icon: Code,
      gradient: "from-[#6C4DFF] to-[#4A90E2]",
      delay: 0,
      items: data?.workingOn || []
    },
    {
      title: t('now.currentlyLearning'),
      icon: BookOpen,
      gradient: "from-[#4A90E2] to-[#FF6B6B]",
      delay: 0.2,
      items: data?.currentlyLearning || []
    },
    {
      title: t('now.usingRightNow'),
      icon: Calendar,
      gradient: "from-[#FF6B6B] to-[#6C4DFF]",
      delay: 0.4,
      items: data?.usingRightNow || []
    },
    {
      title: t('now.listeningTo'),
      icon: Headphones,
      gradient: "from-[#6C4DFF] to-[#FF6B6B]",
      delay: 0.6,
      items: data?.listeningTo || []
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">{t('common.error')}</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${t('now.title')} – Yves Janvier`}
        description={t('now.subtitle')}
        url={`${window.location.origin}/now`}
        type="website"
      />

      <ResponsiveContainer className="py-8 lg:py-16">
        <AnimatedSection>
          <SectionHeader
            title={t('now.title')}
            subtitle={`${t('now.subtitle')} ${data?.lastUpdated ? `${t('now.lastUpdated')}: ${formatDate(data.lastUpdated)}` : ''}`}
            centered
          />
        </AnimatedSection>

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
                      {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                            <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ))
                      ) : (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Inspiration Quote */}
        <AnimatedSection delay={0.8} className="mt-16">
          <Card className="glass-card border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <blockquote className="text-lg italic text-foreground/80 mb-4">
                "{t('now.inspirationQuote')}"
              </blockquote>
              <cite className="text-sm text-muted-foreground">– {t('now.quoteAuthor')}</cite>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Last Updated */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            {t('now.monthlyUpdate')}
          </p>
          {data?.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('now.lastUpdated')}: {formatDate(data.lastUpdated)}
            </p>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default NowPage;
