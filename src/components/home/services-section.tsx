
import { SectionHeader } from "@/components/ui/section-header";

const services = [
  {
    id: 1,
    title: "Data Analytics",
    description: "Transform complex data into actionable insights to drive strategic business decisions."
  },
  {
    id: 2,
    title: "Web Development",
    description: "Create modern, responsive, and user-friendly web applications with cutting-edge technologies."
  },
  {
    id: 3,
    title: "SaaS Solutions",
    description: "Design and build scalable software-as-a-service solutions tailored to your business needs."
  },
  {
    id: 4,
    title: "Fintech Integration",
    description: "Implement secure and efficient financial technology solutions for modern business requirements."
  }
];

const ServicesSection = () => {
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
