
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

const HeroSection = () => {
  const { lang = 'fr' } = useParams();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const buttonSize = isMobile ? "default" : "lg";
  const titleSize = isMobile ? "text-4xl" : isTablet ? "text-5xl" : "text-6xl lg:text-7xl";
  const subtitleSize = isMobile ? "text-lg" : isTablet ? "text-xl" : "text-2xl lg:text-3xl";
  const descriptionSize = isMobile ? "text-base" : "text-lg lg:text-xl";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10">
        <div className="absolute inset-0 bg-gradient-accent opacity-5 animate-gradient bg-[length:200%_200%]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>
      
      <ResponsiveContainer className="relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Greeting Badge */}
            <motion.div
              className="inline-flex items-center px-4 py-2 mb-8 glass-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-glow" />
              <span className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground font-medium`}>
                {t('hero.greeting')}
              </span>
            </motion.div>
            
            {/* Main Title */}
            <motion.h1 
              className={`${titleSize} font-bold mb-6 leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="text-gradient animate-gradient bg-[length:200%_200%]">
                Yves Janvier
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.h2 
              className={`${subtitleSize} font-semibold mb-6 text-foreground/90 leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span className="relative">
                {t('hero.title')}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-primary rounded-full transform scale-x-0 animate-scale-in" style={{ animationDelay: '1.2s' }} />
              </span>
            </motion.h2>
            
            {/* Description */}
            <motion.p 
              className={`${descriptionSize} text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {t('hero.subtitle')}
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col sm:flex-row'} gap-4 justify-center items-center mb-16`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Button 
                asChild 
                size={buttonSize} 
                className="group w-full sm:w-auto min-h-[44px] px-8 bg-gradient-primary hover:shadow-primary hover-lift"
              >
                <Link to={`/${lang}/work/portfolio`}>
                  {t('hero.cta.portfolio')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size={buttonSize} 
                className="group w-full sm:w-auto min-h-[44px] px-8 glass-card hover-lift border-primary/20"
              >
                <Link to={`/${lang}/contact`}>
                  {t('hero.cta.contact')}
                  <Download className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* Stats or Features */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {[
                { number: "50+", label: t('hero.stats.projectsCompleted') },
                { number: "5+", label: t('hero.stats.yearsExperience') },
                { number: "100%", label: t('hero.stats.clientSatisfaction') }
              ].map((stat, index) => (
                <div key={index} className="text-center glass-card p-4 hover-scale">
                  <div className="text-2xl font-bold text-gradient-accent mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </ResponsiveContainer>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{t('hero.stats.scrollDown')}</span>
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
