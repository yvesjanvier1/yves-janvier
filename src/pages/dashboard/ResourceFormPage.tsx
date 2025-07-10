import { useParams } from "react-router-dom";
import { ResourceForm } from "@/components/dashboard/resources/ResourceForm";

export default function ResourceFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Resource" : "Add New Resource"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Update the resource information and settings" 
            : "Create a new downloadable resource for your audience"
          }
        </p>
      </div>

      <ResourceForm resourceId={id} />
    </div>
  );
}