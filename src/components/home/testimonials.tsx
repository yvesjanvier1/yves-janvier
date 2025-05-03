
import { SectionHeader } from "@/components/ui/section-header";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "CTO, TechVision Inc.",
    testimonial: "Working with Yves was an absolute game changer for our data strategy. His expertise and innovative approach helped us uncover insights that transformed our business.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfDF8MHx8fDA%3D"
  },
  {
    id: 2,
    name: "David Chen",
    position: "Product Manager, DataFlow",
    testimonial: "Yves delivered exactly what we needed and more. His technical knowledge combined with business acumen resulted in a solution that exceeded our expectations.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2ZpbGV8ZW58MHwxfDB8fHww"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="section bg-secondary/40">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="Client Testimonials"
          subtitle="What people are saying about working with me"
          centered
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-card rounded-lg p-6 shadow-sm border"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                </div>
              </div>
              <blockquote className="text-muted-foreground italic">
                "{testimonial.testimonial}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
