import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextToSpeechPlayerProps {
  title: string;
  content: string;
  locale?: string;
  className?: string;
}

// Map locale codes to Web Speech API language codes
const getLanguageCode = (locale?: string): string => {
  const langMap: Record<string, string> = {
    en: "en-US",
    fr: "fr-FR",
    ht: "fr-HT", // Haitian Creole - fallback to French-Haiti variant
  };
  return langMap[locale || "en"] || "en-US";
};

// Strip HTML tags and decode entities for clean text
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export function TextToSpeechPlayer({
  title,
  content,
  locale,
  className,
}: TextToSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>("");

  // Check browser support
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Prepare text content
  useEffect(() => {
    const cleanContent = stripHtml(content);
    textRef.current = `${title}. ${cleanContent}`;
  }, [title, content]);

  const handlePlay = useCallback(() => {
    if (!isSupported) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }

    const synth = window.speechSynthesis;

    // If paused, resume
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any existing speech
    synth.cancel();
    setIsLoading(true);

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(textRef.current);
    utterance.lang = getLanguageCode(locale);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to find a voice for the language
    const voices = synth.getVoices();
    const langCode = getLanguageCode(locale);
    const matchingVoice = voices.find(
      (voice) =>
        voice.lang.startsWith(langCode.split("-")[0]) && voice.localService
    );
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setProgress(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    };

    utterance.onerror = (event) => {
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);
      
      if (event.error !== "canceled") {
        toast.error("Failed to play audio. Please try again.");
        console.error("Speech synthesis error:", event.error);
      }
    };

    // Approximate progress tracking
    const totalLength = textRef.current.length;
    utterance.onboundary = (event) => {
      if (event.charIndex) {
        setProgress(Math.min((event.charIndex / totalLength) * 100, 99));
      }
    };

    utteranceRef.current = utterance;

    // Small delay to ensure voices are loaded
    setTimeout(() => {
      synth.speak(utterance);
    }, 100);
  }, [isSupported, isPaused, locale]);

  const handlePause = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  const isActive = isPlaying || isPaused;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border bg-card transition-all duration-200",
        isActive && "ring-2 ring-primary/20",
        className
      )}
    >
      <Volume2 className="h-5 w-5 text-muted-foreground shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Listen to Article
          </span>
          {isLoading && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isLoading ? (
          <Button variant="ghost" size="icon" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
          </Button>
        ) : isPlaying ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePause}
            aria-label="Pause"
          >
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlay}
            aria-label={isPaused ? "Resume" : "Play"}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
