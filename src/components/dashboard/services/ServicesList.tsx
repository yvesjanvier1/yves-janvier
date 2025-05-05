
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { ServicesListHeader } from "./services-list-header";
import { getServicesColumns, Service } from "./services-columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceToDelete);
        
      if (error) throw error;
      
      setServices(prevServices => 
        prevServices.filter(service => service.id !== serviceToDelete)
      );
      toast.success("Service deleted successfully");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setServiceToDelete(null);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
  };

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = getServicesColumns({ onDeleteClick: handleDeleteClick });

  return (
    <div className="space-y-6">
      <ServicesListHeader 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

      <DataTable 
        columns={columns} 
        data={filteredServices} 
        isLoading={isLoading} 
        emptyMessage={searchQuery ? "No services match your search" : "No services found. Create your first service!"}
      />

      <ConfirmDialog
        open={!!serviceToDelete}
        onOpenChange={(isOpen) => !isOpen && setServiceToDelete(null)}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteService}
        destructive
      />
    </div>
  );
}
