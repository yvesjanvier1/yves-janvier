import { Button } from "@/components/ui/button";
import { Linkedin, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

const SocialShare = ({ title, url, description }: SocialShareProps) => {
  const { t } = useTranslation(["common", "blog"]);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(
      shareLinks[platform],
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-sm font-medium text-muted-foreground">
        {t("blog.shareLabel", "Share:")}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="flex items-center gap-2 hover:bg-primary/10"
          aria-label={`${t("blog.shareOnTwitter", "Share on Twitter")}: ${title}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {t("blog.twitter", "Twitter")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin")}
          className="flex items-center gap-2 hover:bg-primary/10"
          aria-label={`${t("blog.shareOnLinkedIn", "Share on LinkedIn")}: ${title}`}
        >
          <Linkedin className="h-4 w-4" />
          {t("blog.linkedin", "LinkedIn")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="flex items-center gap-2 hover:bg-primary/10"
          aria-label={`${t("blog.shareOnWhatsApp", "Share on WhatsApp")}: ${title}`}
        >
          <MessageCircle className="h-4 w-4" />
          {t("blog.whatsapp", "WhatsApp")}
        </Button>
      </div>
    </div>
  );
};

export default SocialShare;
