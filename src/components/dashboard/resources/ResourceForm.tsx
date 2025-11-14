import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file_url: z.string().url("Please enter a valid URL"),
  file_type: z.string().min(1, "File type is required"),
  file_size: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface ResourceFormProps {
  resourceId?: string;
}

export function ResourceForm({ resourceId }: ResourceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      file_url: "",
      file_type: "",
      file_size: 0,
      category: "",
      tags: [],
      featured: false,
    },
  });

  // Fetch resource data if editing
  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", resourceId],
    queryFn: async () => {
      if (!resourceId) return null;
      
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!resourceId,
  });

  // Update form when resource data is loaded
  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description || "",
        file_url: resource.file_url,
        file_type: resource.file_type,
        file_size: resource.file_size || 0,
        category: resource.category || "",
        tags: resource.tags || [],
        featured: resource.featured || false,
      });
    }
  }, [resource, form]);

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const { formatResourceData, supabaseInsert } = await import("@/lib/supabase-helpers");
      return supabaseInsert("resources", data, formatResourceData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-resources"] });
      navigate("/dashboard/resources");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const { formatResourceData, supabaseUpdate } = await import("@/lib/supabase-helpers");
      return supabaseUpdate("resources", resourceId!, data, formatResourceData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource", resourceId] });
      navigate("/dashboard/resources");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update resource",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResourceFormData) => {
    if (resourceId) {
      updateResourceMutation.mutate(data);
    } else {
      createResourceMutation.mutate(data);
    }
  };

  const isSubmitting = createResourceMutation.isPending || updateResourceMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/resources")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Information</CardTitle>
          <CardDescription>
            Fill in the details for your downloadable resource
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Resource title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select file type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">Word Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="book">Book/eBook</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the resource"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="file_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/file.pdf" 
                          type="url"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Direct link to the downloadable file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="videos">Videos</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="presentations">Presentations</SelectItem>
                          <SelectItem value="templates">Templates</SelectItem>
                          <SelectItem value="guides">Guides</SelectItem>
                          <SelectItem value="tools">Tools</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="file_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Size (bytes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: File size in bytes for display purposes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <TagInput
                      tags={field.value || []}
                      onAddTag={(tag) => field.onChange([...field.value, tag])}
                      onRemoveTag={(tag) => field.onChange(field.value.filter((t: string) => t !== tag))}
                      placeholder="Add tags..."
                    />
                    <FormDescription>
                      Press Enter to add tags
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Resource</FormLabel>
                      <FormDescription>
                        Featured resources appear at the top of the list
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {resourceId ? "Update Resource" : "Create Resource"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/resources")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}