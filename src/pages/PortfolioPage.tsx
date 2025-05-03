
import { useState } from "react";
import { projectCategories, projects } from "@/data/projects";
import { SectionHeader } from "@/components/ui/section-header";
import ProjectCard from "@/components/portfolio/project-card";
import ProjectFilters from "@/components/portfolio/project-filters";

const PortfolioPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(project => project.categories.includes(activeCategory));

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto">
      <SectionHeader
        title="My Portfolio"
        subtitle="Explore my recent projects and case studies"
        centered
      />
      
      <ProjectFilters 
        categories={projectCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default PortfolioPage;
