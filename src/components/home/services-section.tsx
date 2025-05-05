
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
}

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (isLoading) {
    return (
      <section className="section bg-secondary/40">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title="What I Offer"
            subtitle="Expert services at the intersection of data and technology"
            centered
          />
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-center">Loading services...</div>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="section bg-secondary/40">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="What I Offer"
          subtitle="Expert services at the intersection of data and technology"
          centered
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all border"
            >
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
