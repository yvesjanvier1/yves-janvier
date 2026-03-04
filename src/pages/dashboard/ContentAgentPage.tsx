import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Loader2, TrendingUp, Check, X, Trash2, ArrowRight,
  Instagram, Linkedin, MessageCircle, FileText, Image, Download,
  Quote, BarChart3, Layers, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // Preview state
  const [previewItem, setPreviewItem] = useState<ContentQueueItem | null>(null);

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
      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: {
          action: "generate-visual",
          suggestionId: selectedSuggestion?.id || null,
          topic: selectedSuggestion?.topic || genTopic,
          description: selectedSuggestion?.description || "",
          contentType: genContentType,
          platform: genPlatform,
          tags: selectedSuggestion?.tags || [],
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Visual content generated!");
      setGenerateDialog(false);
      setSelectedSuggestion(null);
      setGenTopic("");
      queryClient.invalidateQueries({ queryKey: ["content_queue"] });
      queryClient.invalidateQueries({ queryKey: ["content_suggestions"] });
      if (data?.content) setPreviewItem(data.content);
    },
    onError: (error: any) => toast.error(error.message || "Failed to generate visual"),
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

  // ─── Handlers ───
  const handleCreateBlogPost = (suggestion: ContentSuggestion) => {
    navigate(`/dashboard/blog/new?title=${encodeURIComponent(suggestion.topic)}&tags=${encodeURIComponent(suggestion.tags?.join(",") || "")}`);
    updateStatusMutation.mutate({ id: suggestion.id, status: "used" });
  };

  const openGenerateDialog = (suggestion?: ContentSuggestion) => {
    setSelectedSuggestion(suggestion || null);
    setGenTopic(suggestion?.topic || "");
    setGenerateDialog(true);
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

  const contentTypeLabel: Record<string, string> = {
    quote_card: "Quote Card",
    infographic: "Infographic",
    carousel: "Carousel Slide",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Content Agent
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered topic discovery and visual content generation for all platforms
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discover" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="visuals" className="gap-2">
            <Image className="h-4 w-4" />
            Visual Content ({contentQueue.length})
          </TabsTrigger>
        </TabsList>

        {/* ═══ DISCOVER TAB ═══ */}
        <TabsContent value="discover" className="space-y-6">
          {/* Discovery Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Discover Topics
              </CardTitle>
              <CardDescription>
                Let AI find the most relevant and trending topics for your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter a niche or leave empty for general topics..."
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="flex-1"
                />
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 topics</SelectItem>
                    <SelectItem value="5">5 topics</SelectItem>
                    <SelectItem value="8">8 topics</SelectItem>
                    <SelectItem value="10">10 topics</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending} className="gap-2">
                  {discoverMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Discovering...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Discover</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter & Results */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Suggestions ({suggestions.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => openGenerateDialog()}>
                <Image className="h-4 w-4" />
                Generate from custom topic
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No suggestions yet</h3>
                <p className="text-muted-foreground mt-1">Click "Discover" to generate AI-powered topic suggestions</p>
              </CardContent>
            </Card>
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
                          {suggestion.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
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
            <h2 className="text-xl font-semibold">Generated Visual Content</h2>
            <Button className="gap-2" onClick={() => openGenerateDialog()}>
              <Image className="h-4 w-4" />
              Generate New Visual
            </Button>
          </div>

          {isQueueLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : contentQueue.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No visual content yet</h3>
                <p className="text-muted-foreground mt-1">
                  Generate quote cards, infographics, or carousel slides from your topic suggestions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentQueue.map((item) => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs gap-1">
                        {platformIcons[item.platform]}{item.platform}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {contentTypeLabel[item.content_type] || item.content_type}
                      </Badge>
                    </div>
                    {item.caption && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>
                    )}
                    <div className="flex items-center gap-1 pt-1">
                      <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={() => setPreviewItem(item)}>
                        <Eye className="h-3.5 w-3.5" />Preview
                      </Button>
                      {item.image_url && (
                        <Button size="sm" variant="outline" className="gap-1" asChild>
                          <a href={item.image_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => deleteQueueItemMutation.mutate(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══ GENERATE VISUAL DIALOG ═══ */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generate Visual Content
            </DialogTitle>
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
                <Input
                  placeholder="Enter a topic for visual content..."
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select value={genContentType} onValueChange={setGenContentType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote_card">
                    <span className="flex items-center gap-2"><Quote className="h-4 w-4" />Quote Card</span>
                  </SelectItem>
                  <SelectItem value="infographic">
                    <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Infographic</span>
                  </SelectItem>
                  <SelectItem value="carousel">
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4" />Carousel Slide</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select value={genPlatform} onValueChange={setGenPlatform}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <span className="flex items-center gap-2"><Instagram className="h-4 w-4" />Instagram</span>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <span className="flex items-center gap-2"><Linkedin className="h-4 w-4" />LinkedIn</span>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />WhatsApp</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => generateVisualMutation.mutate()}
              disabled={generateVisualMutation.isPending || (!selectedSuggestion && !genTopic.trim())}
            >
              {generateVisualMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Generating (~30s)...</>
              ) : (
                <><Sparkles className="h-4 w-4" />Generate Visual</>
              )}
            </Button>
          </div>
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
              {previewItem.image_url && (
                <img src={previewItem.image_url} alt={previewItem.title} className="w-full rounded-lg" />
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  {platformIcons[previewItem.platform]}{previewItem.platform}
                </Badge>
                <Badge variant="secondary">
                  {contentTypeLabel[previewItem.content_type] || previewItem.content_type}
                </Badge>
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
              <div className="flex gap-2">
                {previewItem.image_url && (
                  <Button variant="outline" className="gap-2 flex-1" asChild>
                    <a href={previewItem.image_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />Download Image
                    </a>
                  </Button>
                )}
                {previewItem.caption && (
                  <Button
                    variant="outline"
                    className="gap-2 flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${previewItem.caption}\n\n${previewItem.hashtags?.join(" ") || ""}`
                      );
                      toast.success("Caption copied to clipboard!");
                    }}
                  >
                    Copy Caption
                  </Button>
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
