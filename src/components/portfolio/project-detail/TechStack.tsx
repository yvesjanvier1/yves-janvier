
import { Badge } from "@/components/ui/badge";

interface TechStackProps {
  technologies?: string[];
}

const TechStack = ({ technologies }: TechStackProps) => {
  if (!technologies || technologies.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-3">Technologies</h3>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <Badge key={index} variant="secondary">{tech}</Badge>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
