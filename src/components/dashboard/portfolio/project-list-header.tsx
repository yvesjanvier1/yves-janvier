
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface ProjectListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProjectListHeader({ 
  searchQuery, 
  onSearchChange 
}: ProjectListHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Projects</h1>
        <Button asChild>
          <Link to="/dashboard/portfolio/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title, category or technology..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
