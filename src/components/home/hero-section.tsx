
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

const HeroSection = () => {
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const buttonSize = isMobile ? "default" : "lg";
  const titleSize = isMobile ? "text-4xl" : isTablet ? "text-5xl" : "text-6xl lg:text-7xl";
  const subtitleSize = isMobile ? "text-lg" : isTablet ? "text-xl" : "text-2xl lg:text-3xl";
  const descriptionSize = isMobile ? "text-base" : "text-lg lg:text-xl";

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 py-16 lg:py-0">
      <ResponsiveContainer>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.p 
              className={`${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground mb-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {t('hero.greeting')}
            </motion.p>
            
            <motion.h1 
              className={`${titleSize} font-bold mb-6 text-gradient leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Yves Janvier
            </motion.h1>
            
            <motion.h2 
              className={`${subtitleSize} font-semibold mb-6 text-foreground/90 leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {t('hero.title')}
            </motion.h2>
            
            <motion.p 
              className={`${descriptionSize} text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {t('hero.subtitle')}
            </motion.p>
            
            <motion.div 
              className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col sm:flex-row'} gap-4 justify-center items-center`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Button 
                asChild 
                size={buttonSize} 
                className="group w-full sm:w-auto min-h-[44px] px-6"
              >
                <Link to="/portfolio">
                  {t('hero.cta.portfolio')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size={buttonSize} 
                className="group w-full sm:w-auto min-h-[44px] px-6"
              >
                <Link to="/contact">
                  {t('hero.cta.contact')}
                  <Download className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default HeroSection;
