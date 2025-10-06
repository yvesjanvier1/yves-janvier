
import { Card } from "@/components/ui/card";
import ProjectHeader from "./ProjectHeader";
import ProjectGallery from "./ProjectGallery";
import ProjectLinks from "./ProjectLinks";
import TechStack from "./TechStack";
import ProjectContent from "./ProjectContent";
import ProjectSocialShare from "../project-social-share";

interface ProjectLink {
  title: string;
  url: string;
}

interface ProjectDetailProps {
  project: {
    id: string;
    title: string;
    description: string;
    category?: string;
    tech_stack?: string[];
    created_at: string;
    images?: string[];
    links?: ProjectLink[];
  };
}

const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Card className="p-6">
      <ProjectHeader title={project.title} category={project.category} />
      <ProjectGallery images={project.images} />
      <ProjectLinks links={project.links} />
      <TechStack technologies={project.tech_stack} />
      <ProjectContent description={project.description} />
      <ProjectSocialShare 
        title={project.title}
        url={currentUrl}
        description={project.description}
      />
    </Card>
  );
};

export default ProjectDetail;
