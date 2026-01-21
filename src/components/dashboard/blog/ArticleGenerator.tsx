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
import { Sparkles, Loader2, Globe } from "lucide-react";
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

export function ArticleGenerator({ onArticleGenerated }: ArticleGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("random");
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [customTopic, setCustomTopic] = useState("");

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
        onArticleGenerated(data.article);
        toast.success("Article generated successfully!");
        setIsOpen(false);
        setCustomTopic("");
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
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
      </DialogContent>
    </Dialog>
  );
}
