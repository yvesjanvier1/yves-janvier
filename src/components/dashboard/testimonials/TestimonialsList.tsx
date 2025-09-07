
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { TestimonialsListHeader } from "./testimonials-list-header";
import { getTestimonialsColumns, Testimonial } from "./testimonials-columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function TestimonialsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  
  const { data: testimonials = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Testimonial[];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const handleDeleteTestimonial = async () => {
    if (!testimonialToDelete) return;
    
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialToDelete);
        
      if (error) throw error;
      
      await refetch();
      toast.success("Testimonial deleted successfully");
    } catch (error) {
      toast.error("Failed to delete testimonial");
    } finally {
      setTestimonialToDelete(null);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteClick = (id: string) => {
    setTestimonialToDelete(id);
  };

  const filteredTestimonials = testimonials.filter(testimonial => 
    testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.testimonial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = getTestimonialsColumns({ onDeleteClick: handleDeleteClick });

  return (
    <div className="space-y-6">
      <TestimonialsListHeader 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

      <DataTable 
        columns={columns} 
        data={filteredTestimonials} 
        isLoading={isLoading} 
        emptyMessage={searchQuery ? "No testimonials match your search" : "No testimonials found. Create your first testimonial!"}
      />

      <ConfirmDialog
        open={!!testimonialToDelete}
        onOpenChange={(isOpen) => !isOpen && setTestimonialToDelete(null)}
        title="Delete Testimonial"
        description="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteTestimonial}
        destructive
      />
    </div>
  );
};
