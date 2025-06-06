
import { useState } from "react";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export const VideoEmbed = ({ url, title }: VideoEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract video ID and platform from URL
  const getVideoInfo = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
      };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`
      };
    }

    return null;
  };

  const videoInfo = getVideoInfo(url);

  if (!videoInfo) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Unsupported video format</p>
      </div>
    );
  }

  return (
    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
      {!isLoaded ? (
        <div 
          className="absolute inset-0 cursor-pointer group"
          onClick={() => setIsLoaded(true)}
        >
          <img
            src={videoInfo.thumbnailUrl}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
              <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      ) : (
        <iframe
          src={videoInfo.embedUrl}
          title={title || "Embedded video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};
