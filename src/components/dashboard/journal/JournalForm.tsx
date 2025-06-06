
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const journalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  entry_type: z.enum(["activity", "project", "learning", "achievement", "milestone"]),
  date: z.string().min(1, "Date is required"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  image_url: z.string().url().optional().or(z.literal("")),
  external_link: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

type JournalFormData = z.infer<typeof journalSchema>;

export const JournalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      entry_type: "activity",
      date: new Date().toISOString().split('T')[0],
      featured: false,
      tags: [],
      image_url: "",
      external_link: "",
      status: "published",
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchEntry();
    }
  }, [id, isEditing]);

  const fetchEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          title: data.title,
          content: data.content || "",
          entry_type: data.entry_type,
          date: data.date,
          featured: data.featured,
          tags: data.tags || [],
          image_url: data.image_url || "",
          external_link: data.external_link || "",
          status: data.status,
        });
      }
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      toast.error("Failed to load journal entry");
      navigate("/dashboard/journal");
    }
  };

  const onSubmit = async (data: JournalFormData) => {
    try {
      setIsLoading(true);

      const entryData = {
        ...data,
        image_url: data.image_url || null,
        external_link: data.external_link || null,
        content: data.content || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("journal_entries")
          .update(entryData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Journal entry updated successfully");
      } else {
        const { error } = await supabase
          .from("journal_entries")
          .insert([entryData]);

        if (error) throw error;
        toast.success("Journal entry created successfully");
      }

      navigate("/dashboard/journal");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Journal Entry" : "Create New Journal Entry"}
          </CardTitle>
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
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entry_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entry type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activity">Activity</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="achievement">Achievement</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter content (optional)" 
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add tags..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="external_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Entry</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Mark this entry as featured to highlight it
                      </div>
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEditing ? "Update Entry" : "Create Entry"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/journal")}
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
};
