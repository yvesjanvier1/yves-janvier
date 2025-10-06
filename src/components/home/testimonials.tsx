import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeError, secureLog } from "@/lib/security";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Testimonial {
  id: string;
  name: string;
  position: string;
  testimonial: string;
  image: string | null;
}

const TestimonialsSection = () => {
  const { t } = useTranslation(["common", "testimonials"]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          secureLog.error("Error fetching testimonials", fetchError);
          throw fetchError;
        }

        setTestimonials(data || []);
        secureLog.info("Testimonials loaded successfully");
      } catch (err) {
        const errorMessage = sanitizeError(err);
        setError(errorMessage);
        secureLog.error("Error fetching testimonials", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section className="section bg-secondary/40">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title={t("testimonials:title", "Client Testimonials")}
            subtitle={t("testimonials:subtitle", "What people are saying about working with me")}
            centered
          />
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-center text-muted-foreground">{t("common:loading", "Loading testimonials...")}</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    secureLog.warn("Failed to load testimonials", error);
    return (
      <section className="section bg-secondary/40">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title={t("testimonials:title", "Client Testimonials")}
            subtitle={t("testimonials:subtitle", "What people are saying about working with me")}
            centered
          />
          <div className="text-center py-12 text-destructive">
            {t("common:error", "Failed to load testimonials. Please try again later.")}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="section bg-secondary/40">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title={t("testimonials:title", "Client Testimonials")}
          subtitle={t("testimonials:subtitle", "What people are saying about working with me")}
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-card rounded-lg p-6 shadow-sm border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted mr-4" />
                )}
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                </div>
              </div>
              <blockquote className="text-muted-foreground italic leading-relaxed">
                "{testimonial.testimonial}"
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
