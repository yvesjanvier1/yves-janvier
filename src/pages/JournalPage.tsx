
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Tag, ExternalLink, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { VideoEmbed } from "@/components/home/video-embed";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOInternational } from "@/components/seo/SEOInternational";

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
  video_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  locale?: string;
}

const entryTypeColors = {
  activity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  project: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
  learning: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  achievement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  milestone: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const JournalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, formatDate, language } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const selectedTag = searchParams.get("tag") || "all";
  const selectedType = searchParams.get("type") || "all";
  const sortBy = searchParams.get("sort") || "date";
  const searchTerm = searchParams.get("search") || "";

  useEffect(() => {
    fetchEntries();
  }, [selectedTag, selectedType, sortBy, searchTerm, language]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("journal_entries")
        .select("*")
        .eq("status", "published")
        .or(`locale.eq.${language},locale.is.null`);

      // Apply filters
      if (selectedTag !== "all") {
        query = query.contains("tags", [selectedTag]);
      }

      if (selectedType !== "all") {
        query = query.eq("entry_type", selectedType);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      if (sortBy === "date") {
        query = query.order("date", { ascending: false });
      } else if (sortBy === "title") {
        query = query.order("title", { ascending: true });
      } else if (sortBy === "created") {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const typedData = data.map(entry => ({
          ...entry,
          entry_type: entry.entry_type as 'activity' | 'project' | 'learning' | 'achievement' | 'milestone',
          status: entry.status as 'draft' | 'published' | 'archived',
          video_url: entry.video_url || null
        }));
        setEntries(typedData);

        // Extract unique tags from all entries
        const { data: allEntries } = await supabase
          .from("journal_entries")
          .select("tags")
          .eq("status", "published")
          .or(`locale.eq.${language},locale.is.null`);
        
        if (allEntries) {
          const tags = Array.from(new Set(allEntries.flatMap(entry => entry.tags || [])));
          setAvailableTags(tags);
        }
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  return (
    <>
      <SEOInternational />
      <div className="container px-4 py-16 md:py-24 mx-auto">
        <SectionHeader
          title={t('dashboard.journal')}
          subtitle={t('blog.subtitle')}
          centered
        />

        {/* Filters and Search */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => updateSearchParams("search", e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedType} onValueChange={(value) => updateSearchParams("type", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={(value) => updateSearchParams("tag", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')} Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => updateSearchParams("sort", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('common.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('portfolio.byDate')}</SelectItem>
                <SelectItem value="title">{t('portfolio.byTitle')}</SelectItem>
                <SelectItem value="created">By Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
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
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">{t('blog.noPostsFound')}</h3>
            <p className="text-muted-foreground">
              {t('blog.noPostsMessage')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  
                  {entry.video_url && (
                    <div className="mb-4">
                      <VideoEmbed url={entry.video_url} title={entry.title} />
                    </div>
                  )}
                  
                  {entry.content && (
                    <p className="text-muted-foreground mb-4 flex-grow line-clamp-3">
                      {entry.content}
                    </p>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => updateSearchParams("tag", tag)}
                        >
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
                          {t('portfolio.viewProject')}
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
    </>
  );
};

export default JournalPage;
