import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMultilingualData } from "@/hooks/useMultilingualData";
import SEOHead from "@/components/seo/SEOHead";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  locale: string;
}

const ServicesPage = () => {
  const { lang = 'fr' } = useParams();
  const { t } = useLanguage();
  
  const { data: services = [], isLoading } = useMultilingualData<Service>({
    table: 'services',
    orderBy: { column: 'created_at', ascending: false }
  });

  return (
    <>
      <SEOHead
        title={`${t('services.title')} - Yves Janvier`}
        description={t('services.subtitle')}
      />
      
      <ResponsiveContainer className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('services.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="h-full hover-lift">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {service.icon && (
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <span className="text-2xl">{service.icon}</span>
                      </div>
                    )}
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <Badge variant="outline" className="mt-4">
                    {service.locale?.toUpperCase() || lang.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">{t('common.comingSoon')}</h3>
            <p className="text-muted-foreground">
              {t('common.comingSoonDescription')}
            </p>
          </div>
        )}
      </ResponsiveContainer>
    </>
  );
};

export default ServicesPage;