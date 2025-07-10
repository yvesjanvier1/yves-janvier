import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ResourcesList } from "@/components/dashboard/resources/ResourcesList";

export default function ResourcesManagePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredResources = resources?.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources Management</h1>
          <p className="text-muted-foreground">
            Manage your downloadable resources and documents
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/resources/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ResourcesList 
        resources={filteredResources || []} 
        isLoading={isLoading}
        onRefetch={refetch}
      />
    </div>
  );
}