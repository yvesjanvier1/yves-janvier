
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  created_at: string;
}

interface ColumnConfig {
  key: string;
  header: string;
  cell: (service: Service) => React.ReactNode;
}

interface ServicesColumnsProps {
  onDeleteClick: (id: string) => void;
}

export function getServicesColumns({ onDeleteClick }: ServicesColumnsProps): ColumnConfig[] {
  return [
    {
      key: "title",
      header: "Title",
      cell: (service: Service) => <span className="font-medium">{service.title}</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (service: Service) => (
        <div className="truncate max-w-md">
          {service.description}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (service: Service) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/services/edit/${service.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(service.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }
  ];
}
