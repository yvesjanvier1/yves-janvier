import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Calendar, Tag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  content: string | null;
  entry_type: 'activity' | 'project' | 'learning' | 'achievement' | 'milestone';
  date: string;
  featured: boolean;
  tags: string[];
  image_url: string | null;
  external_link: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

const entryTypeColors = {
  activity: "bg-blue-100 text-blue-800",
  project: "bg-green-100 text-green-800", 
  learning: "bg-purple-100 text-purple-800",
  achievement: "bg-yellow-100 text-yellow-800",
  milestone: "bg-red-100 text-red-800"
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-orange-100 text-orange-800"
};

export const JournalList = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      if (data) {
        const typedData = data.map(entry => ({
          ...entry,
          entry_type: entry.entry_type as 'activity' | 'project' | 'learning' | 'achievement' | 'milestone',
          status: entry.status as 'draft' | 'published' | 'archived'
        }));
        setEntries(typedData);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to load journal entries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== id));
      toast.success("Journal entry deleted successfully");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Failed to delete journal entry");
    }
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Journal Entries</h1>
        <Button asChild>
          <Link to="/dashboard/journal/new">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No journal entries found</p>
            <Button asChild>
              <Link to="/dashboard/journal/new">Create your first entry</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={entryTypeColors[entry.entry_type]}>
                      {entry.entry_type}
                    </Badge>
                    <Badge className={statusColors[entry.status]}>
                      {entry.status}
                    </Badge>
                    {entry.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/journal/edit/${entry.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                
                {entry.content && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {entry.content}
                  </p>
                )}

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(entry.date), 'MMM dd, yyyy')}
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {entry.external_link && (
                  <div className="flex items-center text-sm text-primary">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <a 
                      href={entry.external_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      External Link
                    </a>
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-4">
                  Created: {format(new Date(entry.created_at), 'MMM dd, yyyy')} | 
                  Updated: {format(new Date(entry.updated_at), 'MMM dd, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Journal Entry"
        description="Are you sure you want to delete this journal entry? This action cannot be undone."
      />
    </div>
  );
};
