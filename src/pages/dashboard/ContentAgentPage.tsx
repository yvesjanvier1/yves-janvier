import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Sparkles, Loader2, TrendingUp, Check, X, Trash2, ArrowRight,
  Instagram, Linkedin, MessageCircle, FileText, Image, Download,
  Quote, BarChart3, Layers, Eye, CalendarIcon, Clock, Share2,
  Copy, ExternalLink, Zap, RefreshCw, PieChart, Activity,
  ChevronLeft, ChevronRight, Send, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ContentSuggestion {
  id: string;
  topic: string;
  description: string | null;
  relevance_score: number;
  category: string | null;
  target_platforms: string[];
  status: string;
  tags: string[];
  source_context: string | null;
  created_at: string;
}

interface ContentQueueItem {
  id: string;
  suggestion_id: string | null;
  title: string;
  content_type: string;
  platform: string;
  image_url: string | null;
  text_content: string | null;
  caption: string | null;
  hashtags: string[];
  status: string;
  created_at: string;
  scheduled_at: string | null;
  published_at: string | null;
  slide_number: number | null;
  carousel_group_id: string | null;
}

const platformIcons: Record<string, React.ReactNode> = {
  blog: <FileText className="h-3 w-3" />,
  instagram: <Instagram className="h-3 w-3" />,
  linkedin: <Linkedin className="h-3 w-3" />,
  whatsapp: <MessageCircle className="h-3 w-3" />,
};

const contentTypeIcons: Record<string, React.ReactNode> = {
  quote_card: <Quote className="h-4 w-4" />,
  infographic: <BarChart3 className="h-4 w-4" />,
  carousel: <Layers className="h-4 w-4" />,
};

const contentTypeLabel: Record<string, string> = {
  quote_card: "Quote Card",
  infographic: "Infographic",
  carousel: "Carousel",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "hsl(340, 75%, 54%)",
  linkedin: "hsl(210, 80%, 45%)",
  whatsapp: "hsl(142, 70%, 45%)",
  blog: "hsl(250, 60%, 55%)",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "hsl(220, 15%, 55%)",
  scheduled: "hsl(40, 90%, 50%)",
  published: "hsl(142, 70%, 45%)",
};

const ContentAgentPage = () => {
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState("5");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("discover");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Visual generation state
  const [generateDialog, setGenerateDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  const [genContentType, setGenContentType] = useState("quote_card");
  const [genPlatform, setGenPlatform] = useState("instagram");
  const [genTopic, setGenTopic] = useState("");
  const [genSlideCount, setGenSlideCount] = useState("4");
  const [genScheduledDate, setGenScheduledDate] = useState<Date | undefined>();
  const [genScheduledTime, setGenScheduledTime] = useState("09:00");

  // Preview & share state
  const [previewItem, setPreviewItem] = useState<ContentQueueItem | null>(null);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareItem, setShareItem] = useState<ContentQueueItem | null>(null);
  const [publishSteps, setPublishSteps] = useState<Record<string, "pending" | "done" | "active">>({});
  const [isPublishing, setIsPublishing] = useState(false);

  // Schedule edit state
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<ContentQueueItem | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("09:00");

  // Automation state
  const [pipelineNiche, setPipelineNiche] = useState("");
  const [pipelineContentType, setPipelineContentType] = useState("quote_card");
  const [pipelinePlatforms, setPipelinePlatforms] = useState<string[]>(["instagram", "linkedin"]);
  const [pipelineAutoSchedule, setPipelineAutoSchedule] = useState(true);

  // Republish state
  const [republishDialog, setRepublishDialog] = useState(false);
  const [republishItem, setRepublishItem] = useState<ContentQueueItem | null>(null);
  const [republishPlatform, setRepublishPlatform] = useState("linkedin");
  const [republishContentType, setRepublishContentType] = useState("quote_card");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // ─── Queries ───
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["content_suggestions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("content_suggestions")
        .select("*")
        .order("relevance_score", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ContentSuggestion[];
    },
  });

  const { data: contentQueue = [], isLoading: isQueueLoading } = useQuery({
    queryKey: ["content_queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_queue")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ContentQueueItem[];
    },
  });

  // Group carousels
  const groupedContent = useMemo(() => {
    const groups: Record<string, ContentQueueItem[]> = {};
    const singles: ContentQueueItem[] = [];
    contentQueue.forEach((item) => {
      if (item.carousel_group_id) {
        if (!groups[item.carousel_group_id]) groups[item.carousel_group_id] = [];
        groups[item.carousel_group_id].push(item);
      } else {
        singles.push(item);
      }
    });
    Object.values(groups).forEach((g) => g.sort((a, b) => (a.slide_number || 0) - (b.slide_number || 0)));
    return { groups, singles };
  }, [contentQueue]);

  // ─── Analytics data ───
  const analytics = useMemo(() => {
    const byPlatform: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byWeek: Record<string, number> = {};

    contentQueue.forEach((item) => {
      byPlatform[item.platform] = (byPlatform[item.platform] || 0) + 1;
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byType[item.content_type] = (byType[item.content_type] || 0) + 1;

      const week = format(new Date(item.created_at), "MMM d");
      byWeek[week] = (byWeek[week] || 0) + 1;
    });

    const platformData = Object.entries(byPlatform).map(([name, value]) => ({
      name, value, color: PLATFORM_COLORS[name] || "hsl(0,0%,50%)",
    }));
    const statusData = Object.entries(byStatus).map(([name, value]) => ({
      name, value, color: STATUS_COLORS[name] || "hsl(0,0%,50%)",
    }));
    const typeData = Object.entries(byType).map(([name, value]) => ({
      name: contentTypeLabel[name] || name, value,
    }));
    const weeklyData = Object.entries(byWeek).map(([name, value]) => ({ name, count: value }));

    // Find top-performing content (published content that could be republished)
    const publishedContent = contentQueue.filter((i) => i.status === "published");
    // Content that exists on only one platform is a republish candidate
    const topicMap: Record<string, ContentQueueItem[]> = {};
    contentQueue.forEach((item) => {
      const topic = item.title.replace(/ - Slide \d+$/, "");
      if (!topicMap[topic]) topicMap[topic] = [];
      topicMap[topic].push(item);
    });

    const republishCandidates = Object.entries(topicMap)
      .filter(([, items]) => {
        const platforms = new Set(items.map((i) => i.platform));
        return items.some((i) => i.status === "published") && platforms.size < 3;
      })
      .map(([topic, items]) => ({
        topic,
        currentPlatforms: [...new Set(items.map((i) => i.platform))],
        missingPlatforms: ["instagram", "linkedin", "whatsapp"].filter(
          (p) => !items.some((i) => i.platform === p)
        ),
        bestItem: items.find((i) => i.status === "published") || items[0],
      }));

    return {
      total: contentQueue.length,
      published: contentQueue.filter((i) => i.status === "published").length,
      scheduled: contentQueue.filter((i) => i.status === "scheduled").length,
      drafts: contentQueue.filter((i) => i.status === "draft").length,
      platformData,
      statusData,
      typeData,
      weeklyData,
      republishCandidates,
      publishedContent,
      suggestionsTotal: suggestions.length,
      suggestionsApproved: suggestions.filter((s) => s.status === "approved").length,
      suggestionsUsed: suggestions.filter((s) => s.status === "used").length,
    };
  }, [contentQueue, suggestions]);

  // ─── Mutations ───
  const discoverMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: { action: "discover", niche: niche.trim() || undefined, count: parseInt(count) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.suggestions?.length || 0} topic suggestions generated!`);
      queryClient.invalidateQueries({ queryKey: ["content_suggestions"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to discover topics"),
  });

  const generateVisualMutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = genScheduledDate
        ? new Date(`${format(genScheduledDate, "yyyy-MM-dd")}T${genScheduledTime}:00`).toISOString()
        : null;

      const isCarouselMulti = genContentType === "carousel_multi";
      const action = isCarouselMulti ? "generate-carousel" : "generate-visual";
      const contentType = isCarouselMulti ? "carousel" : genContentType;

      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: {
          action,
          suggestionId: selectedSuggestion?.id || null,
          topic: selectedSuggestion?.topic || genTopic,
          description: selectedSuggestion?.description || "",
          contentType,
          platform: genPlatform,
          tags: selectedSuggestion?.tags || [],
          slideCount: isCarouselMulti ? parseInt(genSlideCount) : undefined,
          scheduledAt,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.slides ? `${data.slides.length}-slide carousel generated!` : "Visual content generated!");
      setGenerateDialog(false);
      setSelectedSuggestion(null);
      setGenTopic("");
      setGenScheduledDate(undefined);
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
      queryClient.invalidateQueries({ queryKey: ["content_suggestions"] });
      if (data?.content) setPreviewItem(data.content);
    },
    onError: (error: any) => toast.error(error.message || "Failed to generate visual"),
  });

  const pipelineMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: {
          action: "auto-pipeline",
          niche: pipelineNiche.trim() || undefined,
          contentType: pipelineContentType,
          platforms: pipelinePlatforms,
          autoSchedule: pipelineAutoSchedule,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      const summary = data.pipelineSummary;
      toast.success(`Pipeline complete! Topic: "${summary.selectedTopic}" → ${summary.contentGenerated} visuals generated`);
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
      queryClient.invalidateQueries({ queryKey: ["content_suggestions"] });
    },
    onError: (error: any) => toast.error(error.message || "Pipeline failed"),
  });

  const republishMutation = useMutation({
    mutationFn: async () => {
      if (!republishItem) throw new Error("No content selected");
      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: {
          action: "republish",
          contentId: republishItem.id,
          targetPlatform: republishPlatform,
          targetContentType: republishContentType,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Content republished to ${republishPlatform}!`);
      setRepublishDialog(false);
      setRepublishItem(null);
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
      if (data?.republished) setPreviewItem(data.republished);
    },
    onError: (error: any) => toast.error(error.message || "Republish failed"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("content_suggestions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content_suggestions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_suggestions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Suggestion deleted");
      queryClient.invalidateQueries({ queryKey: ["content_suggestions"] });
    },
  });

  const deleteQueueItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_queue").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Content deleted");
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
    },
  });

  const deleteCarouselGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from("content_queue").delete().eq("carousel_group_id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Carousel deleted");
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
    },
  });

  const scheduleItemMutation = useMutation({
    mutationFn: async ({ id, scheduledAt, groupId }: { id: string; scheduledAt: string; groupId?: string | null }) => {
      if (groupId) {
        const { error } = await supabase
          .from("content_queue")
          .update({ scheduled_at: scheduledAt, status: "scheduled" })
          .eq("carousel_group_id", groupId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_queue")
          .update({ scheduled_at: scheduledAt, status: "scheduled" })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Content scheduled!");
      setScheduleDialog(false);
      setScheduleItem(null);
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
    },
  });

  const markPublishedMutation = useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId?: string | null }) => {
      if (groupId) {
        const { error } = await supabase
          .from("content_queue")
          .update({ published_at: new Date().toISOString(), status: "published" })
          .eq("carousel_group_id", groupId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_queue")
          .update({ published_at: new Date().toISOString(), status: "published" })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Marked as published!");
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
    },
  });

  // ─── Handlers ───
  const handleCreateBlogPost = (suggestion: ContentSuggestion) => {
    navigate(`/dashboard/blog/new?title=${encodeURIComponent(suggestion.topic)}&tags=${encodeURIComponent(suggestion.tags?.join(",") || "")}`);
    updateStatusMutation.mutate({ id: suggestion.id, status: "used" });
  };

  const openGenerateDialog = (suggestion?: ContentSuggestion) => {
    setSelectedSuggestion(suggestion || null);
    setGenTopic(suggestion?.topic || "");
    setGenScheduledDate(undefined);
    setGenerateDialog(true);
  };

  const openScheduleDialog = (item: ContentQueueItem) => {
    setScheduleItem(item);
    setScheduleDate(item.scheduled_at ? new Date(item.scheduled_at) : undefined);
    setScheduleTime(item.scheduled_at ? format(new Date(item.scheduled_at), "HH:mm") : "09:00");
    setScheduleDialog(true);
  };

  const handleScheduleSave = () => {
    if (!scheduleDate || !scheduleItem) return;
    const scheduledAt = new Date(`${format(scheduleDate, "yyyy-MM-dd")}T${scheduleTime}:00`).toISOString();
    scheduleItemMutation.mutate({ id: scheduleItem.id, scheduledAt, groupId: scheduleItem.carousel_group_id });
  };

  const buildShareUrl = (item: ContentQueueItem, platform: string) => {
    const text = `${item.caption || item.title}\n\n${item.hashtags?.join(" ") || ""}`;
    const encodedText = encodeURIComponent(text);
    const imageUrl = encodeURIComponent(item.image_url || "");

    switch (platform) {
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${imageUrl}&summary=${encodedText}`;
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${encodedText}%0A%0A${imageUrl}`;
      case "instagram":
        return null;
      default:
        return null;
    }
  };

  const openShareDialog = (item: ContentQueueItem) => {
    setShareItem(item);
    setShareDialog(true);
  };

  const handleUnifiedPublish = async (item: ContentQueueItem) => {
    setIsPublishing(true);
    setPublishSteps({ instagram: "pending", linkedin: "pending", whatsapp: "pending" });

    // Step 1: Instagram — download image + copy caption
    setPublishSteps(prev => ({ ...prev, instagram: "active" }));
    if (item.image_url) {
      const a = document.createElement("a");
      a.href = item.image_url;
      a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    await navigator.clipboard.writeText(`${item.caption || ""}\n\n${item.hashtags?.join(" ") || ""}`);
    toast.success("📸 Instagram : image téléchargée + légende copiée !");
    setPublishSteps(prev => ({ ...prev, instagram: "done" }));

    // Step 2: LinkedIn — open deep-link
    await new Promise(r => setTimeout(r, 1200));
    setPublishSteps(prev => ({ ...prev, linkedin: "active" }));
    const linkedinUrl = buildShareUrl(item, "linkedin");
    if (linkedinUrl) {
      window.open(linkedinUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
    toast.success("💼 LinkedIn : fenêtre de partage ouverte !");
    setPublishSteps(prev => ({ ...prev, linkedin: "done" }));

    // Step 3: WhatsApp — open deep-link
    await new Promise(r => setTimeout(r, 1500));
    setPublishSteps(prev => ({ ...prev, whatsapp: "active" }));
    const whatsappUrl = buildShareUrl(item, "whatsapp");
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    }
    toast.success("💬 WhatsApp : fenêtre de partage ouverte !");
    setPublishSteps(prev => ({ ...prev, whatsapp: "done" }));

    // Mark as published
    await new Promise(r => setTimeout(r, 800));
    markPublishedMutation.mutate({ id: item.id, groupId: item.carousel_group_id });
    setIsPublishing(false);
  };

  const openRepublishDialog = (item: ContentQueueItem) => {
    setRepublishItem(item);
    const otherPlatforms = ["instagram", "linkedin", "whatsapp"].filter((p) => p !== item.platform);
    setRepublishPlatform(otherPlatforms[0] || "linkedin");
    setRepublishContentType(item.content_type === "carousel" ? "quote_card" : item.content_type);
    setRepublishDialog(true);
  };

  const copyFullCaption = (item: ContentQueueItem) => {
    navigator.clipboard.writeText(`${item.caption || ""}\n\n${item.hashtags?.join(" ") || ""}`);
    toast.success("Caption & hashtags copied!");
  };

  const togglePipelinePlatform = (platform: string) => {
    setPipelinePlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case "rejected": return <Badge variant="secondary">Rejected</Badge>;
      case "used": return <Badge variant="outline">Used</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getQueueStatusBadge = (item: ContentQueueItem) => {
    if (item.status === "published") return <Badge className="bg-green-600 text-xs">Published</Badge>;
    if (item.status === "scheduled" && item.scheduled_at) {
      return (
        <Badge variant="outline" className="text-xs gap-1">
          <Clock className="h-3 w-3" />
          {format(new Date(item.scheduled_at), "MMM d, HH:mm")}
        </Badge>
      );
    }
    return <Badge variant="secondary" className="text-xs">Draft</Badge>;
  };

  const scheduledCount = contentQueue.filter((i) => i.status === "scheduled").length;
  const publishedCount = contentQueue.filter((i) => i.status === "published").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Content Agent
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered topic discovery, visual content generation, automation & analytics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="discover" className="gap-2">
            <TrendingUp className="h-4 w-4" />Discover
          </TabsTrigger>
          <TabsTrigger value="visuals" className="gap-2">
            <Image className="h-4 w-4" />Content ({contentQueue.length})
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <CalendarIcon className="h-4 w-4" />Schedule ({scheduledCount})
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />Automation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <PieChart className="h-4 w-4" />Analytics
          </TabsTrigger>
        </TabsList>

        {/* ═══ DISCOVER TAB ═══ */}
        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />Discover Topics
              </CardTitle>
              <CardDescription>Let AI find the most relevant and trending topics for your audience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Enter a niche or leave empty for general topics..." value={niche} onChange={(e) => setNiche(e.target.value)} className="flex-1" />
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 topics</SelectItem>
                    <SelectItem value="5">5 topics</SelectItem>
                    <SelectItem value="8">8 topics</SelectItem>
                    <SelectItem value="10">10 topics</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending} className="gap-2">
                  {discoverMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Discovering...</> : <><Sparkles className="h-4 w-4" />Discover</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Suggestions ({suggestions.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => openGenerateDialog()}>
                <Image className="h-4 w-4" />Generate from custom topic
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : suggestions.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No suggestions yet</h3>
              <p className="text-muted-foreground mt-1">Click "Discover" to generate AI-powered topic suggestions</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${getScoreColor(suggestion.relevance_score)}`}>
                        {suggestion.relevance_score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{suggestion.topic}</h3>
                          {getStatusBadge(suggestion.status)}
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">{suggestion.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {suggestion.category && <Badge variant="outline">{suggestion.category}</Badge>}
                          {suggestion.tags?.map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Platforms:</span>
                          {suggestion.target_platforms?.map((platform) => (
                            <span key={platform} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted">
                              {platformIcons[platform]}{platform}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                        {suggestion.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: "approved" })}>
                              <Check className="h-3.5 w-3.5" />Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700" onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: "rejected" })}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {(suggestion.status === "approved" || suggestion.status === "pending") && (
                          <>
                            <Button size="sm" variant="default" className="gap-1" onClick={() => handleCreateBlogPost(suggestion)}>
                              <ArrowRight className="h-3.5 w-3.5" />Blog Post
                            </Button>
                            <Button size="sm" variant="secondary" className="gap-1" onClick={() => openGenerateDialog(suggestion)}>
                              <Image className="h-3.5 w-3.5" />Visual
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(suggestion.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ VISUAL CONTENT TAB ═══ */}
        <TabsContent value="visuals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generated Content</h2>
            <Button className="gap-2" onClick={() => openGenerateDialog()}>
              <Image className="h-4 w-4" />Generate New
            </Button>
          </div>

          {isQueueLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : contentQueue.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No visual content yet</h3>
              <p className="text-muted-foreground mt-1">Generate quote cards, infographics, or carousel slides</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-6">
              {/* Carousel groups */}
              {Object.entries(groupedContent.groups).map(([groupId, slides]) => (
                <Card key={groupId} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        {slides[0]?.title?.replace(/ - Slide \d+$/, "")} ({slides.length} slides)
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getQueueStatusBadge(slides[0])}
                        <Badge variant="outline" className="text-xs gap-1">{platformIcons[slides[0]?.platform]}{slides[0]?.platform}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {slides.map((slide) => (
                        <div key={slide.id} className="flex-shrink-0 w-40 cursor-pointer" onClick={() => setPreviewItem(slide)}>
                          {slide.image_url && <img src={slide.image_url} alt={slide.title} className="w-40 h-40 object-cover rounded-lg border" />}
                          <p className="text-xs text-muted-foreground mt-1 truncate">Slide {slide.slide_number}</p>
                        </div>
                      ))}
                    </div>
                    {slides[0]?.caption && <p className="text-sm text-muted-foreground line-clamp-2">{slides[0].caption}</p>}
                    <div className="flex items-center gap-1 flex-wrap">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => openShareDialog(slides[0])}><Share2 className="h-3.5 w-3.5" />Share</Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => openScheduleDialog(slides[0])}><CalendarIcon className="h-3.5 w-3.5" />Schedule</Button>
                      {slides[0].status === "published" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openRepublishDialog(slides[0])}><RefreshCw className="h-3.5 w-3.5" />Republish</Button>
                      )}
                      {slides[0].status !== "published" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => markPublishedMutation.mutate({ id: slides[0].id, groupId })}><Check className="h-3.5 w-3.5" />Published</Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive ml-auto" onClick={() => deleteCarouselGroupMutation.mutate(groupId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Single items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContent.singles.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {item.image_url && (
                      <div className="aspect-square relative group cursor-pointer" onClick={() => setPreviewItem(item)}>
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {contentTypeIcons[item.content_type]}
                        <span className="font-medium text-sm truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs gap-1">{platformIcons[item.platform]}{item.platform}</Badge>
                        <Badge variant="secondary" className="text-xs">{contentTypeLabel[item.content_type] || item.content_type}</Badge>
                        {getQueueStatusBadge(item)}
                      </div>
                      {item.caption && <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>}
                      <div className="flex items-center gap-1 pt-1 flex-wrap">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openShareDialog(item)}><Share2 className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openScheduleDialog(item)}><CalendarIcon className="h-3.5 w-3.5" /></Button>
                        {item.status === "published" && (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => openRepublishDialog(item)}><RefreshCw className="h-3.5 w-3.5" /></Button>
                        )}
                        {item.status !== "published" && (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => markPublishedMutation.mutate({ id: item.id })}><Check className="h-3.5 w-3.5" /></Button>
                        )}
                        {item.image_url && (
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <a href={item.image_url} download target="_blank" rel="noopener noreferrer"><Download className="h-3.5 w-3.5" /></a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive ml-auto" onClick={() => deleteQueueItemMutation.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ═══ SCHEDULE TAB — VISUAL CALENDAR ═══ */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{contentQueue.length}</p>
              <p className="text-sm text-muted-foreground">Total Content</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{scheduledCount}</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent></Card>
          </div>

          {/* Calendar Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg">{format(calendarMonth, "MMMM yyyy", { locale: fr })}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const monthStart = startOfMonth(calendarMonth);
                const monthEnd = endOfMonth(calendarMonth);
                const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const startDayOfWeek = monthStart.getDay(); // 0=Sun
                const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

                // Build map: dateString -> items
                const itemsByDate: Record<string, ContentQueueItem[]> = {};
                contentQueue.forEach((item) => {
                  const dateStr = item.scheduled_at
                    ? format(new Date(item.scheduled_at), "yyyy-MM-dd")
                    : item.published_at
                    ? format(new Date(item.published_at), "yyyy-MM-dd")
                    : null;
                  if (dateStr) {
                    if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
                    itemsByDate[dateStr].push(item);
                  }
                });

                return (
                  <div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {dayNames.map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells before month start */}
                      {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[90px] rounded-lg" />
                      ))}
                      {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const dayItems = itemsByDate[dateStr] || [];
                        const today = isToday(day);
                        return (
                          <div
                            key={dateStr}
                            className={cn(
                              "min-h-[90px] rounded-lg border p-1 transition-colors",
                              today && "border-primary bg-primary/5",
                              !today && "border-border bg-card hover:bg-accent/30"
                            )}
                          >
                            <div className={cn(
                              "text-xs font-medium mb-0.5 px-1",
                              today && "text-primary",
                              !today && "text-muted-foreground"
                            )}>
                              {format(day, "d")}
                            </div>
                            <div className="space-y-0.5 overflow-hidden max-h-[68px]">
                              {dayItems.slice(0, 3).map((item) => (
                                <div
                                  key={item.id}
                                  className={cn(
                                    "text-[10px] leading-tight px-1 py-0.5 rounded truncate cursor-pointer transition-colors",
                                    item.status === "published"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                      : item.status === "scheduled"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                  title={`${item.title} (${item.platform})`}
                                  onClick={() => setPreviewItem(item)}
                                >
                                  <span className="inline-flex items-center gap-0.5">
                                    {platformIcons[item.platform]}
                                    {item.title.length > 18 ? item.title.slice(0, 18) + "…" : item.title}
                                  </span>
                                </div>
                              ))}
                              {dayItems.length > 3 && (
                                <div className="text-[10px] text-muted-foreground px-1">+{dayItems.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Upcoming list below calendar */}
          <h2 className="text-xl font-semibold">Upcoming Schedule</h2>
          {(() => {
            const scheduled = contentQueue
              .filter((i) => i.scheduled_at && i.status === "scheduled")
              .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

            if (scheduled.length === 0) {
              return (
                <Card><CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No scheduled content yet</p>
                </CardContent></Card>
              );
            }

            return (
              <div className="space-y-3">
                {scheduled.map((item) => (
                  <Card key={item.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs gap-1">{platformIcons[item.platform]}{item.platform}</Badge>
                          <Badge variant="secondary" className="text-xs">{contentTypeLabel[item.content_type] || item.content_type}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{format(new Date(item.scheduled_at!), "d MMM yyyy", { locale: fr })}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.scheduled_at!), "HH:mm")}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openShareDialog(item)}><Share2 className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="default" className="gap-1" onClick={() => openShareDialog(item)}><Send className="h-3.5 w-3.5" />Tout Publier</Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => markPublishedMutation.mutate({ id: item.id, groupId: item.carousel_group_id })}><Check className="h-3.5 w-3.5" />Done</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* ═══ AUTOMATION TAB ═══ */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />Automated Pipeline
              </CardTitle>
              <CardDescription>
                One click: Discover trending topics → Pick the best → Generate visuals for each platform → Auto-schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Niche (optional)</label>
                <Input placeholder="e.g., AI, Marketing, Design..." value={pipelineNiche} onChange={(e) => setPipelineNiche(e.target.value)} className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select value={pipelineContentType} onValueChange={setPipelineContentType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quote_card">Quote Card</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="carousel">Carousel (1 slide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Platforms</label>
                <div className="flex gap-3">
                  {["instagram", "linkedin", "whatsapp"].map((p) => (
                    <Button
                      key={p}
                      variant={pipelinePlatforms.includes(p) ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => togglePipelinePlatform(p)}
                    >
                      {platformIcons[p]}{p}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto-schedule</label>
                  <p className="text-xs text-muted-foreground">Schedule 1 post/day starting tomorrow at 9:00 AM</p>
                </div>
                <Switch checked={pipelineAutoSchedule} onCheckedChange={setPipelineAutoSchedule} />
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => pipelineMutation.mutate()}
                disabled={pipelineMutation.isPending || pipelinePlatforms.length === 0}
              >
                {pipelineMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Running pipeline (~2 min)...</>
                ) : (
                  <><Zap className="h-4 w-4" />Run Full Pipeline</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Republish Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />Smart Republication
              </CardTitle>
              <CardDescription>
                Published content that can be adapted and republished to other platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.republishCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No republish candidates yet. Publish content on one platform first.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.republishCandidates.map((candidate) => (
                    <div key={candidate.topic} className="flex items-center gap-4 p-3 rounded-lg border">
                      {candidate.bestItem.image_url && (
                        <img src={candidate.bestItem.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{candidate.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">On:</span>
                          {candidate.currentPlatforms.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {platformIcons[p]}{p}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">Missing:</span>
                          {candidate.missingPlatforms.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted">
                              {platformIcons[p]}{p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="default" className="gap-1" onClick={() => openRepublishDialog(candidate.bestItem)}>
                        <RefreshCw className="h-3.5 w-3.5" />Republish
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ANALYTICS TAB ═══ */}
        <TabsContent value="analytics" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <Activity className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{analytics.total}</p>
              <p className="text-xs text-muted-foreground">Total Content</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <Check className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-600">{analytics.published}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold text-yellow-600">{analytics.scheduled}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <Sparkles className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{analytics.suggestionsTotal}</p>
              <p className="text-xs text-muted-foreground">Topics Discovered</p>
            </CardContent></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie data={analytics.platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                        {analytics.platformData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie data={analytics.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                        {analytics.statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Content Type Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.typeData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content Creation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.weeklyData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pipeline Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <div className="flex-1 text-center p-4 rounded-lg bg-muted min-w-[120px]">
                  <p className="text-2xl font-bold">{analytics.suggestionsTotal}</p>
                  <p className="text-xs text-muted-foreground">Discovered</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 text-center p-4 rounded-lg bg-muted min-w-[120px]">
                  <p className="text-2xl font-bold">{analytics.suggestionsApproved + analytics.suggestionsUsed}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 text-center p-4 rounded-lg bg-muted min-w-[120px]">
                  <p className="text-2xl font-bold">{analytics.total}</p>
                  <p className="text-xs text-muted-foreground">Generated</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 text-center p-4 rounded-lg bg-muted min-w-[120px]">
                  <p className="text-2xl font-bold">{analytics.scheduled}</p>
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 min-w-[120px]">
                  <p className="text-2xl font-bold text-green-600">{analytics.published}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ GENERATE DIALOG ═══ */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Image className="h-5 w-5" />Generate Visual Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSuggestion ? (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">{selectedSuggestion.topic}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedSuggestion.description}</p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Topic</label>
                <Input placeholder="Enter a topic..." value={genTopic} onChange={(e) => setGenTopic(e.target.value)} className="mt-1" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select value={genContentType} onValueChange={setGenContentType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote_card"><span className="flex items-center gap-2"><Quote className="h-4 w-4" />Quote Card</span></SelectItem>
                  <SelectItem value="infographic"><span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Infographic</span></SelectItem>
                  <SelectItem value="carousel"><span className="flex items-center gap-2"><Layers className="h-4 w-4" />Carousel (1 slide)</span></SelectItem>
                  <SelectItem value="carousel_multi"><span className="flex items-center gap-2"><Layers className="h-4 w-4" />Carousel (multi-slide)</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {genContentType === "carousel_multi" && (
              <div>
                <label className="text-sm font-medium">Number of slides</label>
                <Select value={genSlideCount} onValueChange={setGenSlideCount}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 slides</SelectItem>
                    <SelectItem value="4">4 slides</SelectItem>
                    <SelectItem value="5">5 slides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select value={genPlatform} onValueChange={setGenPlatform}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram"><span className="flex items-center gap-2"><Instagram className="h-4 w-4" />Instagram</span></SelectItem>
                  <SelectItem value="linkedin"><span className="flex items-center gap-2"><Linkedin className="h-4 w-4" />LinkedIn</span></SelectItem>
                  <SelectItem value="whatsapp"><span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />WhatsApp</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Schedule (optional)</label>
              <div className="flex gap-2 mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !genScheduledDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {genScheduledDate ? format(genScheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="top" sideOffset={4}>
                    <Calendar mode="single" selected={genScheduledDate} onSelect={setGenScheduledDate} disabled={(date) => date < new Date()} className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <Input type="time" value={genScheduledTime} onChange={(e) => setGenScheduledTime(e.target.value)} className="w-[110px]" />
              </div>
            </div>

            <Button className="w-full gap-2" onClick={() => generateVisualMutation.mutate()} disabled={generateVisualMutation.isPending || (!selectedSuggestion && !genTopic.trim())}>
              {generateVisualMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{genContentType === "carousel_multi" ? "Generating slides..." : "Generating (~30s)..."}</>
              ) : (
                <><Sparkles className="h-4 w-4" />Generate{genContentType === "carousel_multi" ? ` ${genSlideCount} Slides` : ""}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ SCHEDULE DIALOG ═══ */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" />Schedule Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} disabled={(date) => date < new Date()} className={cn("p-3 pointer-events-auto mx-auto")} />
            <div>
              <label className="text-sm font-medium">Time</label>
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-1" />
            </div>
            <Button className="w-full gap-2" onClick={handleScheduleSave} disabled={!scheduleDate || scheduleItemMutation.isPending}>
              {scheduleItemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ SHARE DIALOG ═══ */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Share Content</DialogTitle>
          </DialogHeader>
          {shareItem && (
            <div className="space-y-4">
              {shareItem.image_url && <img src={shareItem.image_url} alt={shareItem.title} className="w-full rounded-lg max-h-60 object-cover" />}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => copyFullCaption(shareItem)}>
                  <Copy className="h-4 w-4" />Copy Caption + Hashtags
                </Button>
                {shareItem.image_url && (
                  <Button variant="outline" className="w-full justify-start gap-3" asChild>
                    <a href={shareItem.image_url} download target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" />Download Image</a>
                  </Button>
                )}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-sm font-medium">Share to platform</p>
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => { copyFullCaption(shareItem); toast.info("Caption copied! Open Instagram and paste it."); }}>
                    <Instagram className="h-4 w-4" />Instagram (copy caption first)
                  </Button>
                  {buildShareUrl(shareItem, "linkedin") && (
                    <Button variant="outline" className="w-full justify-start gap-3" asChild>
                      <a href={buildShareUrl(shareItem, "linkedin")!} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" />Share on LinkedIn<ExternalLink className="h-3 w-3 ml-auto" /></a>
                    </Button>
                  )}
                  {buildShareUrl(shareItem, "whatsapp") && (
                    <Button variant="outline" className="w-full justify-start gap-3" asChild>
                      <a href={buildShareUrl(shareItem, "whatsapp")!} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Share on WhatsApp<ExternalLink className="h-3 w-3 ml-auto" /></a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ REPUBLISH DIALOG ═══ */}
      <Dialog open={republishDialog} onOpenChange={setRepublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5" />Republish Content</DialogTitle>
          </DialogHeader>
          {republishItem && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm">{republishItem.title}</p>
                <p className="text-xs text-muted-foreground mt-1">Originally on {republishItem.platform}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Target Platform</label>
                <Select value={republishPlatform} onValueChange={setRepublishPlatform}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["instagram", "linkedin", "whatsapp"]
                      .filter((p) => p !== republishItem.platform)
                      .map((p) => (
                        <SelectItem key={p} value={p}>
                          <span className="flex items-center gap-2">{platformIcons[p]}{p}</span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select value={republishContentType} onValueChange={setRepublishContentType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quote_card">Quote Card</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="carousel">Carousel (1 slide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => republishMutation.mutate()}
                disabled={republishMutation.isPending}
              >
                {republishMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Republishing (~30s)...</>
                ) : (
                  <><RefreshCw className="h-4 w-4" />Republish to {republishPlatform}</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ PREVIEW DIALOG ═══ */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewItem && contentTypeIcons[previewItem.content_type]}
              {previewItem?.title}
            </DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              {previewItem.image_url && <img src={previewItem.image_url} alt={previewItem.title} className="w-full rounded-lg" />}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1">{platformIcons[previewItem.platform]}{previewItem.platform}</Badge>
                <Badge variant="secondary">{contentTypeLabel[previewItem.content_type] || previewItem.content_type}</Badge>
                {getQueueStatusBadge(previewItem)}
              </div>
              {previewItem.caption && (
                <div>
                  <label className="text-sm font-medium">Caption</label>
                  <Textarea readOnly value={previewItem.caption} className="mt-1 resize-none" rows={4} />
                </div>
              )}
              {previewItem.hashtags?.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Hashtags</label>
                  <p className="text-sm text-primary mt-1">{previewItem.hashtags.join(" ")}</p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="gap-2" onClick={() => { openShareDialog(previewItem); setPreviewItem(null); }}><Share2 className="h-4 w-4" />Share</Button>
                {previewItem.image_url && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={previewItem.image_url} download target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" />Download</a>
                  </Button>
                )}
                <Button variant="outline" className="gap-2" onClick={() => copyFullCaption(previewItem)}><Copy className="h-4 w-4" />Copy Caption</Button>
                {previewItem.status === "published" && (
                  <Button variant="outline" className="gap-2" onClick={() => { openRepublishDialog(previewItem); setPreviewItem(null); }}><RefreshCw className="h-4 w-4" />Republish</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentAgentPage;
