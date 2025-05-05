
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  testimonial: string;
  image: string | null;
  created_at: string;
}

interface ColumnConfig {
  key: string;
  header: string;
  cell: (testimonial: Testimonial) => React.ReactNode;
}

interface TestimonialsColumnsProps {
  onDeleteClick: (id: string) => void;
}

export function getTestimonialsColumns({ onDeleteClick }: TestimonialsColumnsProps): ColumnConfig[] {
  return [
    {
      key: "name",
      header: "Name",
      cell: (testimonial: Testimonial) => (
        <div className="flex items-center gap-3">
          {testimonial.image && (
            <img 
              src={testimonial.image} 
              alt={testimonial.name} 
              className="w-8 h-8 rounded-full object-cover" 
            />
          )}
          <span className="font-medium">{testimonial.name}</span>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      cell: (testimonial: Testimonial) => testimonial.position,
    },
    {
      key: "testimonial",
      header: "Testimonial",
      cell: (testimonial: Testimonial) => (
        <div className="truncate max-w-xs">
          {testimonial.testimonial}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (testimonial: Testimonial) => new Date(testimonial.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (testimonial: Testimonial) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/testimonials/edit/${testimonial.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(testimonial.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }
  ];
}
