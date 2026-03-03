import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Loader2, TrendingUp, Check, X, Trash2, ArrowRight, RefreshCw,
  Instagram, Linkedin, MessageCircle, FileText
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

const platformIcons: Record<string, React.ReactNode> = {
  blog: <FileText className="h-3 w-3" />,
  instagram: <Instagram className="h-3 w-3" />,
  linkedin: <Linkedin className="h-3 w-3" />,
  whatsapp: <MessageCircle className="h-3 w-3" />,
};

const ContentAgentPage = () => {
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState("5");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["content_suggestions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("content_suggestions")
        .select("*")
        .order("relevance_score", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ContentSuggestion[];
    },
  });

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
    onError: (error: any) => {
      toast.error(error.message || "Failed to discover topics");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("content_suggestions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content_suggestions"] });
    },
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

  const handleCreateBlogPost = (suggestion: ContentSuggestion) => {
    // Navigate to blog form with pre-filled title
    navigate(`/dashboard/blog/new?title=${encodeURIComponent(suggestion.topic)}&tags=${encodeURIComponent(suggestion.tags?.join(",") || "")}`);
    updateStatusMutation.mutate({ id: suggestion.id, status: "used" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary">Rejected</Badge>;
      case "used":
        return <Badge variant="outline">Used</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
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
          AI-powered topic discovery to educate your followers across all platforms
        </p>
      </div>

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
            <Button
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              className="gap-2"
            >
              {discoverMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Discover
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Suggestions ({suggestions.length})</h2>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No suggestions yet</h3>
            <p className="text-muted-foreground mt-1">
              Click "Discover" to generate AI-powered topic suggestions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Score */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${getScoreColor(suggestion.relevance_score)}`}>
                    {suggestion.relevance_score}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{suggestion.topic}</h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{suggestion.description}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {suggestion.category && (
                        <Badge variant="outline">{suggestion.category}</Badge>
                      )}
                      {suggestion.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Platforms:</span>
                      {suggestion.target_platforms?.map((platform) => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted"
                        >
                          {platformIcons[platform]}
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {suggestion.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-green-600 hover:text-green-700"
                          onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: "approved" })}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 hover:text-red-700"
                          onClick={() => updateStatusMutation.mutate({ id: suggestion.id, status: "rejected" })}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {(suggestion.status === "approved" || suggestion.status === "pending") && (
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1"
                        onClick={() => handleCreateBlogPost(suggestion)}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        Create Post
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(suggestion.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentAgentPage;
