
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { projects } from "@/data/projects";

const FeaturedProjects = () => {
  // Get only featured projects (limit to 3)
  const featuredProjects = projects
    .filter(project => project.featured)
    .slice(0, 3);

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="Featured Projects"
          subtitle="Showcasing some of my best work and achievements"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div 
              key={project.id} 
              className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button asChild variant="secondary">
                    <Link to={`/portfolio/${project.id}`}>View Project</Link>
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  {project.categories.slice(0, 2).map((category) => (
                    <span 
                      key={category} 
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">{project.summary}</p>
                <Link 
                  to={`/portfolio/${project.id}`}
                  className="text-primary font-medium inline-flex items-center hover:underline"
                >
                  Read Case Study
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">View All Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
