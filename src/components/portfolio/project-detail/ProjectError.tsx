
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ProjectErrorProps {
  error: string;
}

const ProjectError = ({ error }: ProjectErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-16 mx-auto">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/portfolio">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolio
        </Link>
      </Button>
      
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate("/portfolio")}>
          Return to Portfolio
        </Button>
      </div>
    </div>
  );
};

export default ProjectError;
