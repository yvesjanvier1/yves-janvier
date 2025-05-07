
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ProjectNotFound = () => {
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
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/portfolio")}>
          Return to Portfolio
        </Button>
      </div>
    </div>
  );
};

export default ProjectNotFound;
