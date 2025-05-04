
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormHeaderProps {
  isEditing: boolean;
}

export function FormHeader({ isEditing }: FormHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={() => navigate("/dashboard/portfolio")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      <h1 className="text-3xl font-bold">{isEditing ? "Edit" : "Create"} Portfolio Project</h1>
    </div>
  );
}
