
import { Badge } from "@/components/ui/badge";

interface ProjectHeaderProps {
  title: string;
  category?: string;
}

const ProjectHeader = ({ title, category }: ProjectHeaderProps) => (
  <div className="mb-6">
    <h1 className="text-4xl font-bold">{title}</h1>
    {category && <Badge className="mt-2">{category}</Badge>}
  </div>
);

export default ProjectHeader;
