
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

interface ProjectLink {
  title: string;
  url: string;
}

interface ProjectLinksProps {
  links?: ProjectLink[];
}

const ProjectLinks = ({ links }: ProjectLinksProps) => {
  if (!links || links.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {links.map((link, index) => (
        <Button key={index} variant="outline" size="sm" asChild>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="mr-2 h-4 w-4" />
            {link.title}
          </a>
        </Button>
      ))}
    </div>
  );
};

export default ProjectLinks;
