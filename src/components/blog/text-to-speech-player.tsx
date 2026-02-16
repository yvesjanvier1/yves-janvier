import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Square, Volume2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TextToSpeechPlayerProps {
  title: string;
  content: string;
  locale?: string;
  className?: string;
}

const SUPABASE_URL = "https://qfnqmdmsapovxdjwdhsx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbnFtZG1zYXBvdnhkandkaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTIwMDgsImV4cCI6MjA2MTg2ODAwOH0.COLWed6k7Mw7kAevxuJtZtJv_Z0YTu4p9GN1NBTH_kY";

// ElevenLabs voice options
const VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "Female" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "Male" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", gender: "Female" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "Male" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", gender: "Female" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", gender: "Male" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", gender: "Male" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", gender: "Female" },
];

// Strip HTML tags for clean text
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export function TextToSpeechPlayer({
  title,
  content,
  locale: propLocale,
  className,
}: TextToSpeechPlayerProps) {
  const { language: contextLanguage, t } = useLanguage();
  const locale = propLocale || contextLanguage;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [activeEngine, setActiveEngine] = useState<"elevenlabs" | "browser" | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (isPlaying || isPaused)) {
        handleStop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying, isPaused]);

  const playWithElevenLabs = useCallback(async (fullText: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          text: fullText,
          voiceId: selectedVoice,
        }),
      });

      if (!response.ok) {
        console.warn(`ElevenLabs TTS failed (${response.status}), falling back to browser TTS`);
        return false;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsPlaying(true);
          setProgress(0);
        }
      };

      audio.ontimeupdate = () => {
        if (isMountedRef.current && audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          setIsPaused(false);
          setProgress(100);
          URL.revokeObjectURL(audioUrl);
          setTimeout(() => {
            if (isMountedRef.current) setProgress(0);
          }, 1000);
        }
      };

      audio.onerror = () => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
          toast.error(t("tts.error"));
        }
      };

      await audio.play();
      if (isMountedRef.current) setActiveEngine("elevenlabs");
      return true;
    } catch (err) {
      console.warn("ElevenLabs TTS error, falling back to browser TTS:", err);
      return false;
    }
  }, [selectedVoice, t]);

  const playWithBrowserTTS = useCallback((fullText: string) => {
    if (!window.speechSynthesis) {
      toast.error(t("tts.error"));
      setHasError(true);
      setIsLoading(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);

    // Map locale to browser speech lang
    const langMap: Record<string, string> = { en: "en-US", fr: "fr-FR", ht: "ht" };
    utterance.lang = langMap[locale] || locale;
    utterance.rate = 1;

    // Try to find a voice matching the locale
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(locale));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsPlaying(true);
        setProgress(0);
        setActiveEngine("browser");
        toast.info(t("tts.browserFallback") || "Using browser voice (ElevenLabs unavailable)");
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

    utterance.onerror = (e) => {
      if (e.error === "canceled") return;
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
        toast.error(t("tts.error"));
      }
    };

    // Store reference for pause/stop via speechSynthesis
    (audioRef as any).current = { _browserTTS: true, utterance };
    window.speechSynthesis.speak(utterance);
  }, [locale, t]);

  const handlePlay = useCallback(async () => {
    // Resume paused audio
    if (isPaused && audioRef.current) {
      if ((audioRef.current as any)._browserTTS) {
        window.speechSynthesis.resume();
      } else {
        (audioRef.current as HTMLAudioElement).play();
      }
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop existing
    if (audioRef.current) {
      if ((audioRef.current as any)._browserTTS) {
        window.speechSynthesis.cancel();
      } else {
        (audioRef.current as HTMLAudioElement).pause();
      }
      audioRef.current = null;
    }

    setIsLoading(true);
    setHasError(false);

    const cleanText = stripHtml(content);
    const fullText = `${title}. ${cleanText}`;

    // Try ElevenLabs first, fall back to browser TTS
    const success = await playWithElevenLabs(fullText);
    if (!success && isMountedRef.current) {
      playWithBrowserTTS(fullText);
    }
  }, [isPaused, content, title, playWithElevenLabs, playWithBrowserTTS]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      if ((audioRef.current as any)._browserTTS) {
        window.speechSynthesis.pause();
      } else {
        (audioRef.current as HTMLAudioElement).pause();
      }
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      if ((audioRef.current as any)._browserTTS) {
        window.speechSynthesis.cancel();
      } else {
        (audioRef.current as HTMLAudioElement).pause();
        (audioRef.current as HTMLAudioElement).currentTime = 0;
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setProgress(0);
    setActiveEngine(null);
  }, []);

  const handleVoiceChange = useCallback(
    (voiceId: string) => {
      setSelectedVoice(voiceId);
      if (isPlaying || isPaused) {
        handleStop();
      }
    },
    [isPlaying, isPaused, handleStop]
  );

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
              {t("tts.listenToArticle")}
            </span>
            {isLoading && (
              <span className="text-xs text-muted-foreground">
                {t("tts.loadingVoices")}
              </span>
            )}
            {activeEngine && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                {activeEngine === "elevenlabs" ? "ElevenLabs" : "Browser"}
              </Badge>
            )}
            {hasError && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("tts.errorLabel")}
              </span>
            )}
          </div>

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
            <Button variant="ghost" size="icon" disabled aria-label={t("tts.loading")}>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isPlaying ? (
            <Button variant="ghost" size="icon" onClick={handlePause} aria-label={t("tts.pause")}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              aria-label={isPaused ? t("tts.resume") : t("tts.play")}
              className={hasError ? "text-destructive hover:text-destructive" : ""}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          {isActive && (
            <Button variant="ghost" size="icon" onClick={handleStop} aria-label={t("tts.stop")}>
              <Square className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Voice selector */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground shrink-0">
          {t("tts.voice")}:
        </span>
        <Select value={selectedVoice} onValueChange={handleVoiceChange} disabled={isPlaying}>
          <SelectTrigger
            className="h-8 text-xs flex-1 max-w-[280px] bg-background"
            aria-label={t("tts.selectVoice")}
          >
            <SelectValue placeholder={t("tts.selectVoicePlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id} className="text-xs">
                {voice.name} ({voice.gender})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
