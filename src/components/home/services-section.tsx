import { AnimatedSection } from "@/components/ui/animated-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Brain, Code, BarChart3, Zap, Shield, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const services = [
  { icon: Database, titleKey: "dataEngineering", descriptionKey: "dataEngineeringDesc" },
  { icon: Brain, titleKey: "machineLearning", descriptionKey: "machineLearningDesc" },
  { icon: Code, titleKey: "webDevelopment", descriptionKey: "webDevelopmentDesc" },
  { icon: BarChart3, titleKey: "dataAnalytics", descriptionKey: "dataAnalyticsDesc" },
  { icon: Zap, titleKey: "processAutomation", descriptionKey: "processAutomationDesc" },
  { icon: Shield, titleKey: "dataSecurity", descriptionKey: "dataSecurityDesc" },
];

const ServicesSection = () => {
  const { t } = useTranslation("services");

  return (
    <section className="section relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container px-4 mx-auto relative z-10">
        {/* Header */}
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
                {t("title")}
              </span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-gradient">{t("heading")}</span>
            </motion.h2>

            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {t("subtitle")}
            </motion.p>
          </div>
        </AnimatedSection>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimatedSection key={service.titleKey} delay={index * 0.1} className="h-full">
              <Card className="h-full glass-card hover-lift group border-primary/10 relative overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                </div>

                <CardHeader className="relative z-10">
                  <div className="mb-4 p-4 bg-gradient-primary rounded-2xl w-fit group-hover:shadow-glow transition-all duration-300">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t(service.titleKey)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {t(service.descriptionKey)}
                  </CardDescription>

                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-primary font-medium text-sm">
                      {t("learnMore")}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Call to Action */}
        <AnimatedSection delay={0.8}>
          <div className="text-center mt-16">
            <motion.div
              className="glass-card p-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gradient">
                {t("ctaTitle")}
              </h3>
              <p className="text-muted-foreground mb-6">{t("ctaDescription")}</p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary hover:shadow-primary hover-lift px-8"
              >
                <Link to="/contact">
                  {t("ctaButton")}
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
