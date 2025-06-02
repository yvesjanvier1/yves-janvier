
import { AnimatedSection } from "@/components/ui/animated-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, Code, BarChart3, Zap, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <section className="section bg-muted/30">
      <div className="container px-4 mx-auto">
        <AnimatedSection>
          <SectionHeader
            title={t('services.title')}
            subtitle={t('services.subtitle')}
            centered
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimatedSection
              key={service.title}
              delay={index * 0.1}
              className="h-full"
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
