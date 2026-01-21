import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Globe, Eye, ArrowLeft, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
}

interface ArticleGeneratorProps {
  onArticleGenerated: (article: GeneratedArticle) => void;
}

const TOPIC_OPTIONS = [
  { value: "ai-ml", label: "Artificial Intelligence & Machine Learning" },
  { value: "web-dev", label: "Web Development Trends" },
  { value: "cloud", label: "Cloud Computing & DevOps" },
  { value: "security", label: "Cybersecurity Best Practices" },
  { value: "mobile", label: "Mobile App Development" },
  { value: "blockchain", label: "Blockchain & Web3" },
  { value: "data", label: "Data Science & Analytics" },
  { value: "architecture", label: "Software Architecture" },
  { value: "languages", label: "Programming Languages" },
  { value: "random", label: "Surprise Me! (Random Topic)" },
];

const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "ht", label: "Kreyòl Ayisyen", flag: "🇭🇹" },
];

type ViewMode = "form" | "preview";

export function ArticleGenerator({ onArticleGenerated }: ArticleGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("random");
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [customTopic, setCustomTopic] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const topicMap: Record<string, string> = {
        "ai-ml": "artificial intelligence and machine learning in 2026",
        "web-dev": "modern web development trends and frameworks",
        "cloud": "cloud computing and DevOps best practices",
        "security": "cybersecurity threats and protection strategies",
        "mobile": "mobile app development with modern frameworks",
        "blockchain": "blockchain technology and Web3 applications",
        "data": "data science and business analytics",
        "architecture": "software architecture patterns and microservices",
        "languages": "programming language trends and updates",
        "random": "",
      };

      const topic = customTopic || topicMap[selectedTopic] || "";

      const { data, error } = await supabase.functions.invoke('generate-blog-article', {
        body: { 
          topic: topic || undefined,
          customTopic: customTopic || undefined,
          language: selectedLanguage
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.article) {
        setGeneratedArticle(data.article);
        setViewMode("preview");
        toast.success("Article generated! Review it before applying.");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error: any) {
      console.error("Error generating article:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("credits")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate article. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedArticle) {
      onArticleGenerated(generatedArticle);
      toast.success("Article applied to the form!");
      handleClose();
    }
  };

  const handleDiscard = () => {
    setGeneratedArticle(null);
    setViewMode("form");
  };

  const handleClose = () => {
    setIsOpen(false);
    setViewMode("form");
    setGeneratedArticle(null);
    setCustomTopic("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className={viewMode === "preview" ? "sm:max-w-[700px]" : "sm:max-w-[425px]"}>
        {viewMode === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Tech Article
              </DialogTitle>
              <DialogDescription>
                Use AI to generate a blog article on popular technology topics. You can select a category or enter a custom topic.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language / Langue
                </Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.flag}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Select Topic Category</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customTopic">Or Enter Custom Topic</Label>
                <Input
                  id="customTopic"
                  name="customTopic"
                  placeholder="e.g., How AI is transforming healthcare"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the selected category above
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Article
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Preview Generated Article
              </DialogTitle>
              <DialogDescription>
                Review the generated content before applying it to your blog post.
              </DialogDescription>
            </DialogHeader>

            {generatedArticle && (
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 py-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Title</Label>
                    <h2 className="text-xl font-bold">{generatedArticle.title}</h2>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Excerpt</Label>
                    <p className="text-muted-foreground italic">{generatedArticle.excerpt}</p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedArticle.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Content Preview</Label>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg border bg-muted/30"
                      dangerouslySetInnerHTML={{ __html: generatedArticle.content }}
                    />
                  </div>
                </div>
              </ScrollArea>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleDiscard} 
                className="gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Generate Another
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="destructive" 
                  onClick={handleClose} 
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <X className="h-4 w-4" />
                  Discard
                </Button>
                <Button 
                  onClick={handleApply} 
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Check className="h-4 w-4" />
                  Apply to Form
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
