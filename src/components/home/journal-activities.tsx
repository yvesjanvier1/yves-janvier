
import { useState, useEffect } from "react";
import { Calendar, ExternalLink, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
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
}

const entryTypeColors = {
  activity: "bg-blue-100 text-blue-800",
  project: "bg-green-100 text-green-800", 
  learning: "bg-purple-100 text-purple-800",
  achievement: "bg-yellow-100 text-yellow-800",
  milestone: "bg-red-100 text-red-800"
};

export const JournalActivities = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("status", "published")
          .order("date", { ascending: false })
          .limit(6);

        if (error) throw error;

        if (data) {
          setEntries(data);
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        setError("Failed to load activities");
        toast.error("Failed to load activities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (error) {
    return (
      <section className="section">
        <div className="container px-4 mx-auto">
          <SectionHeader
            title="Recent Activities"
            subtitle="Latest updates and milestones"
            centered
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container px-4 mx-auto">
        <SectionHeader
          title="Recent Activities"
          subtitle="Latest updates, achievements, and milestones"
          centered
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden border shadow-sm">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {entry.image_url && (
                  <div className="relative">
                    <LazyImage
                      src={entry.image_url}
                      alt={entry.title}
                      aspectRatio="video"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge 
                      className={`absolute top-3 left-3 ${entryTypeColors[entry.entry_type]}`}
                    >
                      {entry.entry_type}
                    </Badge>
                  </div>
                )}
                
                <div className="p-5">
                  {!entry.image_url && (
                    <Badge 
                      className={`mb-3 ${entryTypeColors[entry.entry_type]}`}
                    >
                      {entry.entry_type}
                    </Badge>
                  )}
                  
                  <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                  
                  {entry.content && (
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {entry.content}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(entry.date), 'MMM dd, yyyy')}
                  </div>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
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
                    <div className="flex justify-end">
                      <a
                        href={entry.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors inline-flex items-center text-sm"
                      >
                        View More
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No activities found</p>
            <p className="text-sm text-muted-foreground">Check back later for new updates.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/activities">View All Activities</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
