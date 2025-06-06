
import { useState, useEffect } from "react";
import { Calendar, Tag, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  activity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  project: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
  learning: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  achievement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  milestone: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

export const JournalActivities = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEntries();
  }, []);

  const fetchFeaturedEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("status", "published")
        .eq("featured", true)
        .order("date", { ascending: false })
        .limit(6);

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
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Activities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with my latest projects, learnings, and achievements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Activities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with my latest projects, learnings, and achievements
          </p>
        </div>
        
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured activities yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={entryTypeColors[entry.entry_type]}>
                      {entry.entry_type}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(entry.date)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                    {entry.title}
                  </h3>
                  
                  {entry.content && (
                    <p className="text-muted-foreground mb-4 flex-grow line-clamp-3">
                      {entry.content}
                    </p>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {entry.external_link && (
                    <div className="mt-auto">
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={entry.external_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
