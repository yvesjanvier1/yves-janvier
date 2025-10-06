import { Card } from "@/components/ui/card";
import ProjectHeader from "./ProjectHeader";
import ProjectGallery from "./ProjectGallery";
import ProjectLinks from "./ProjectLinks";
import TechStack from "./TechStack";
import ProjectContent from "./ProjectContent";
import ProjectSocialShare from "../project-social-share";

export interface ProjectLink {
  title: string;
  url: string;
}

export interface ProjectDetailProps {
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
  // Get current page URL safely
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <Card className="p-6 flex flex-col gap-6">
      {/* Project title and category */}
      <ProjectHeader
        title={project.title}
        category={project.category ?? "Uncategorized"}
      />

      {/* Project images */}
      {project.images && project.images.length > 0 && (
        <ProjectGallery images={project.images} />
      )}

      {/* Project links */}
      {project.links && project.links.length > 0 && (
        <ProjectLinks links={project.links} />
      )}

      {/* Tech stack */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <TechStack technologies={project.tech_stack} />
      )}

      {/* Project description */}
      <ProjectContent description={project.description} />

      {/* Social sharing */}
      <ProjectSocialShare
        title={project.title}
        url={currentUrl}
        description={project.description}
      />
    </Card>
  );
};

export default ProjectDetail;
