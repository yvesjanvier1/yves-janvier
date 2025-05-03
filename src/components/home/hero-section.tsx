
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
            <span className="text-gradient">Yves Janvier</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-medium mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Data & Tech Expert
          </h2>
          <p className="max-w-2xl text-xl text-muted-foreground mb-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Transforming complex data into actionable insights and building innovative technology solutions that drive business success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Button asChild size="lg">
              <Link to="/portfolio">
                Explore My Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Me</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
