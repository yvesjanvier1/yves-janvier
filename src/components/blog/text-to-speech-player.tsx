import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Volume2, Loader2, AlertCircle } from "lucide-react";
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

// Constants
const VOICE_LOAD_TIMEOUT = 3000; // 3 seconds timeout for voice loading

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
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>("");
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check browser support and load voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        voicesRef.current = availableVoices;
        if (isMountedRef.current) {
          setVoicesLoaded(true);
        }
      }
    };

    // Try to load voices immediately (works in some browsers)
    loadVoices();

    // Listen for voices to be loaded (required for Chrome and others)
    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Abort speech when page visibility changes (respects performance preferences)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (isPlaying || isPaused)) {
        handleStop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, isPaused]);

  // Prepare text content
  useEffect(() => {
    const cleanContent = stripHtml(content);
    textRef.current = `${title}. ${cleanContent}`;
  }, [title, content]);

  // Find the best matching voice for the language
  const findVoiceForLanguage = useCallback((langCode: string): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (voices.length === 0) return null;

    const langPrefix = langCode.split("-")[0]; // Get base language code (e.g., 'en' from 'en-US')

    // Priority 1: Exact match with local service preferred
    let voice = voices.find(
      (v) => v.lang === langCode && v.localService
    );

    // Priority 2: Exact match (any)
    if (!voice) {
      voice = voices.find((v) => v.lang === langCode);
    }

    // Priority 3: Prefix match with local service preferred
    if (!voice) {
      voice = voices.find(
        (v) => v.lang.startsWith(langPrefix) && v.localService
      );
    }

    // Priority 4: Any prefix match
    if (!voice) {
      voice = voices.find((v) => v.lang.startsWith(langPrefix));
    }

    // Fallback: First available voice
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }

    return voice || null;
  }, []);

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
    setHasError(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Function to start speech synthesis
    const startSpeech = () => {
      if (!isMountedRef.current) return;

      const langCode = getLanguageCode(locale);
      const selectedVoice = findVoiceForLanguage(langCode);

      if (!selectedVoice) {
        setIsLoading(false);
        setHasError(true);
        toast.error("No suitable voice found for the selected language");
        return;
      }

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(textRef.current);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      // Event handlers
      utterance.onstart = () => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsPlaying(true);
          setProgress(0);
          setHasError(false);
        }
      };

      utterance.onend = () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          setIsPaused(false);
          setProgress(100);
          setTimeout(() => {
            if (isMountedRef.current) setProgress(0);
          }, 1000);
        }
      };

      utterance.onerror = (event) => {
        // Ignore "interrupted" errors - these are expected when stopping/canceling
        if (event.error === "interrupted" || event.error === "canceled") {
          return;
        }

        if (isMountedRef.current) {
          setIsLoading(false);
          setIsPlaying(false);
          setIsPaused(false);
          setHasError(true);
          toast.error("Failed to play audio. Please try again.");
          console.error("Speech synthesis error:", event.error);
        }
      };

      // Approximate progress tracking
      const totalLength = textRef.current.length;
      utterance.onboundary = (event) => {
        if (event.charIndex && isMountedRef.current) {
          setProgress(Math.min((event.charIndex / totalLength) * 100, 99));
        }
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    };

    // If voices are already loaded, start immediately
    if (voicesLoaded && voicesRef.current.length > 0) {
      startSpeech();
    } else {
      // Wait for voices with timeout
      const checkVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          voicesRef.current = voices;
          setVoicesLoaded(true);
          startSpeech();
        }
      };

      // Check immediately
      checkVoices();

      // If still no voices, set up timeout
      if (voicesRef.current.length === 0) {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            if (voicesRef.current.length === 0) {
              setIsLoading(false);
              setHasError(true);
              toast.error("Speech synthesis voices failed to load. Please try again.");
            }
          }
        }, VOICE_LOAD_TIMEOUT);
      }
    }
  }, [isSupported, isPaused, locale, voicesLoaded, findVoiceForLanguage]);

  const handlePause = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setProgress(0);
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
        hasError && "border-destructive/50",
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
            <span className="text-xs text-muted-foreground">Loading voices...</span>
          )}
          {hasError && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Error
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              hasError ? "bg-destructive" : "bg-primary"
            )}
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
            className={hasError ? "text-destructive hover:text-destructive" : ""}
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
