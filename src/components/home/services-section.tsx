
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Brain, Code, BarChart3, Zap, Shield, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const services = [
  {
    icon: Database,
    title: "Data Engineering",
    description: "Building robust data pipelines and infrastructure for scalable data processing and analytics.",
  },
  {
    icon: Brain,
    title: "Machine Learning",
    description: "Developing intelligent solutions using advanced ML algorithms and AI technologies.",
  },
  {
    icon: Code,
    title: "Web Development",
    description: "Creating modern, responsive web applications with cutting-edge technologies.",
  },
  {
    icon: BarChart3,
    title: "Data Analytics",
    description: "Transforming raw data into actionable insights through advanced analytics and visualization.",
  },
  {
    icon: Zap,
    title: "Process Automation",
    description: "Streamlining workflows and automating repetitive tasks to improve efficiency.",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Implementing robust security measures to protect sensitive data and ensure compliance.",
  },
];

const ServicesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="section relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-gradient-surface" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="container px-4 mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center px-4 py-2 mb-6 glass-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('services.title')}
              </span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-gradient-primary">
                What I Do Best
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {t('services.subtitle')}
            </motion.p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimatedSection
              key={service.title}
              delay={index * 0.1}
              className="h-full"
            >
              <Card className="h-full glass-card hover-lift group border-primary/10 relative overflow-hidden hover:bg-gradient-surface">
                {/* Enhanced shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-secondary opacity-20 animate-shimmer" />
                </div>
                
                <CardHeader className="relative z-10">
                  <div className="mb-4 p-4 bg-gradient-primary rounded-2xl w-fit group-hover:shadow-glow group-hover:bg-gradient-secondary transition-all duration-300">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {service.description}
                  </CardDescription>
                  
                  {/* Hover arrow */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-primary font-medium text-sm">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
        
        {/* Call to action */}
        <AnimatedSection delay={0.8}>
          <div className="text-center mt-16">
            <motion.div
              className="glass-card p-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gradient-hero">
                Ready to Transform Your Ideas?
              </h3>
              <p className="text-muted-foreground mb-6">
                Let's discuss how I can help bring your vision to life with cutting-edge technology and innovative solutions.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-primary hover:bg-gradient-secondary hover:shadow-primary hover-lift px-8"
              >
                <Link to="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ServicesSection;
