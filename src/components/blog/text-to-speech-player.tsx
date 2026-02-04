import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Square, Volume2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

interface TextToSpeechPlayerProps {
  title: string;
  content: string;
  locale?: string;
  className?: string;
}

// Map locale codes to Web Speech API language codes
const getLanguageCode = (locale?: string): string => {
  const langMap: Record<string, string> = {
    en: "en",
    fr: "fr",
    ht: "fr", // Haitian Creole - fallback to French
  };
  return langMap[locale || "en"] || "en";
};

// Strip HTML tags and decode entities for clean text
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

// Constants
const VOICE_LOAD_TIMEOUT = 3000; // 3 seconds timeout for voice loading

// Preferred voice names for each language (high-quality voices)
const PREFERRED_VOICES: Record<string, string[]> = {
  fr: [
    "Thomas", "Amelie", "Audrey", "Aurelie", "Denise", "Thomas (Enhanced)", 
    "Microsoft Paul", "Microsoft Julie", "Google français",
    "Léa", "Lucien", "Mathieu", "Céline"
  ],
  en: [
    "Samantha", "Daniel", "Karen", "Moira", "Alex", "Google US English",
    "Microsoft David", "Microsoft Zira", "Google UK English Female"
  ],
};

// Format voice name for display
const formatVoiceName = (voice: SpeechSynthesisVoice): string => {
  // Remove common prefixes and clean up the name
  let name = voice.name
    .replace(/^Microsoft\s+/i, "")
    .replace(/^Google\s+/i, "")
    .replace(/\s+Online\s*\(Natural\)/i, "")
    .replace(/\s+-\s+.+$/, ""); // Remove language suffix like " - English (United States)"
  
  // Add a language indicator with region if available
  const langParts = voice.lang.split("-");
  const langCode = langParts[0].toUpperCase();
  const region = langParts[1] ? ` ${langParts[1].toUpperCase()}` : "";
  
  return `${name} (${langCode}${region})`;
};

// Score a voice for quality (higher is better)
const scoreVoice = (voice: SpeechSynthesisVoice, langPrefix: string): number => {
  let score = 0;
  
  // Exact language match gets priority
  if (voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase())) {
    score += 100;
  }
  
  // Prefer local/offline voices (usually higher quality)
  if (voice.localService) {
    score += 50;
  }
  
  // Check if it's a preferred voice
  const preferredList = PREFERRED_VOICES[langPrefix] || [];
  const voiceNameLower = voice.name.toLowerCase();
  preferredList.forEach((pref, index) => {
    if (voiceNameLower.includes(pref.toLowerCase())) {
      score += 30 - index; // Earlier in the list = higher score
    }
  });
  
  // Prefer "Enhanced" or "Natural" voices
  if (voiceNameLower.includes("enhanced") || voiceNameLower.includes("natural")) {
    score += 20;
  }
  
  // Prefer voices from the same region (fr-FR over fr-CA for French default)
  if (langPrefix === "fr" && voice.lang.toLowerCase() === "fr-fr") {
    score += 10;
  }
  
  return score;
};

export function TextToSpeechPlayer({
  title,
  content,
  locale: propLocale,
  className,
}: TextToSpeechPlayerProps) {
  const { language: contextLanguage } = useLanguage();
  const { t } = useTranslation();
  
  // Use prop locale if provided, otherwise fall back to context language
  const locale = propLocale || contextLanguage;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  
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
      const voices = synth.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        
        // Filter voices for the current language
        const langPrefix = getLanguageCode(locale);
        const matchingVoices = voices.filter((v) =>
          v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
        );
        
        // Sort voices by quality score (best first)
        const sortedVoices = [...matchingVoices].sort((a, b) => 
          scoreVoice(b, langPrefix) - scoreVoice(a, langPrefix)
        );
        
        // If no matching voices, show all voices sorted by score
        const voicesToShow = sortedVoices.length > 0 
          ? sortedVoices 
          : [...voices].sort((a, b) => scoreVoice(b, langPrefix) - scoreVoice(a, langPrefix));
        
        if (isMountedRef.current) {
          setAvailableVoices(voicesToShow);
          setVoicesLoaded(true);
          
          // Auto-select the best voice (first in sorted list)
          if (!selectedVoiceUri && voicesToShow.length > 0) {
            setSelectedVoiceUri(voicesToShow[0].voiceURI);
          }
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
  }, [locale, selectedVoiceUri]);

  // Update available voices when language changes
  useEffect(() => {
    if (voicesRef.current.length > 0) {
      const langPrefix = getLanguageCode(locale);
      const matchingVoices = voicesRef.current.filter((v) =>
        v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
      );
      
      // Sort by quality score
      const sortedVoices = [...matchingVoices].sort((a, b) => 
        scoreVoice(b, langPrefix) - scoreVoice(a, langPrefix)
      );
      
      const voicesToShow = sortedVoices.length > 0 
        ? sortedVoices 
        : [...voicesRef.current].sort((a, b) => scoreVoice(b, langPrefix) - scoreVoice(a, langPrefix));
      
      setAvailableVoices(voicesToShow);
      
      // Reset selected voice if it's not in the new list, pick the best one
      const currentVoiceStillValid = voicesToShow.some(
        (v) => v.voiceURI === selectedVoiceUri
      );
      if (!currentVoiceStillValid && voicesToShow.length > 0) {
        setSelectedVoiceUri(voicesToShow[0].voiceURI);
      }
    }
  }, [locale]);

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

  // Find the selected voice
  const getSelectedVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (selectedVoiceUri) {
      const voice = voicesRef.current.find((v) => v.voiceURI === selectedVoiceUri);
      if (voice) return voice;
    }
    
    // Fallback to first available voice
    if (availableVoices.length > 0) {
      return availableVoices[0];
    }
    
    return voicesRef.current[0] || null;
  }, [selectedVoiceUri, availableVoices]);

  const handlePlay = useCallback(() => {
    if (!isSupported) {
      toast.error(t("tts.notSupported", "Text-to-speech is not supported in your browser"));
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

      const selectedVoice = getSelectedVoice();

      if (!selectedVoice) {
        setIsLoading(false);
        setHasError(true);
        toast.error(t("tts.noVoice", "No suitable voice found for the selected language"));
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
          toast.error(t("tts.error", "Failed to play audio. Please try again."));
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
              toast.error(t("tts.loadError", "Speech synthesis voices failed to load. Please try again."));
            }
          }
        }, VOICE_LOAD_TIMEOUT);
      }
    }
  }, [isSupported, isPaused, voicesLoaded, getSelectedVoice, t]);

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

  const handleVoiceChange = useCallback((voiceUri: string) => {
    setSelectedVoiceUri(voiceUri);
    // If currently playing, restart with new voice
    if (isPlaying || isPaused) {
      handleStop();
    }
  }, [isPlaying, isPaused, handleStop]);

  if (!isSupported) {
    return null;
  }

  const isActive = isPlaying || isPaused;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-lg border bg-card transition-all duration-200",
        isActive && "ring-2 ring-primary/20",
        hasError && "border-destructive/50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Volume2 className="h-5 w-5 text-muted-foreground shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {t("tts.listenToArticle", "Listen to Article")}
            </span>
            {isLoading && (
              <span className="text-xs text-muted-foreground">
                {t("tts.loadingVoices", "Loading voices...")}
              </span>
            )}
            {hasError && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("tts.errorLabel", "Error")}
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
            <Button variant="ghost" size="icon" disabled aria-label={t("tts.loading", "Loading")}>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isPlaying ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePause}
              aria-label={t("tts.pause", "Pause")}
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              aria-label={isPaused ? t("tts.resume", "Resume") : t("tts.play", "Play")}
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
              aria-label={t("tts.stop", "Stop")}
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Voice selector */}
      {availableVoices.length > 1 && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground shrink-0">
            {t("tts.voice", "Voice")}:
          </span>
          <Select
            value={selectedVoiceUri}
            onValueChange={handleVoiceChange}
            disabled={isPlaying}
          >
            <SelectTrigger 
              className="h-8 text-xs flex-1 max-w-[280px]"
              aria-label={t("tts.selectVoice", "Select voice")}
            >
              <SelectValue placeholder={t("tts.selectVoicePlaceholder", "Select a voice")} />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem
                  key={voice.voiceURI}
                  value={voice.voiceURI}
                  className="text-xs"
                >
                  <span className="flex items-center gap-2">
                    {formatVoiceName(voice)}
                    {voice.localService && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                        {t("tts.local", "Local")}
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
