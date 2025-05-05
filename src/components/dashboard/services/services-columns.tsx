
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  created_at: string;
}

interface ServicesColumnsProps {
  onDeleteClick: (id: string) => void;
}

export const getServicesColumns = ({ onDeleteClick }: ServicesColumnsProps): ColumnDef<Service>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/services/edit/${row.original.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDeleteClick(row.original.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    ),
  },
];
