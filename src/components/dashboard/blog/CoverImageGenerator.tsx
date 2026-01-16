import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoverImageGeneratorProps {
  title: string;
  onImageGenerated: (imageUrl: string) => void;
}

export function CoverImageGenerator({ title, onImageGenerated }: CoverImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title first to generate a relevant cover image.");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-image', {
        body: { 
          title: title.trim()
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.imageUrl) {
        onImageGenerated(data.imageUrl);
        toast.success("Cover image generated successfully!");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error: any) {
      console.error("Error generating cover image:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("credits")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate cover image. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      size="sm"
      onClick={handleGenerate} 
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  );
}
