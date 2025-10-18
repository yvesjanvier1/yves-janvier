
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

interface SEOInternationalProps {
  canonicalUrl?: string;
  alternateUrls?: {
    fr?: string;
    en?: string;
    ht?: string;
  };
}

export const SEOInternational = ({ 
  canonicalUrl, 
  alternateUrls = {} 
}: SEOInternationalProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Update document language
    document.documentElement.lang = language;
    
    // Remove existing hreflang links
    const existingLinks = document.querySelectorAll('link[hreflang]');
    existingLinks.forEach(link => link.remove());

    // Add canonical URL if provided
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    // Add hreflang links if alternate URLs are provided
    if (Object.keys(alternateUrls).length > 0) {
      Object.entries(alternateUrls).forEach(([lang, url]) => {
        if (url) {
          const link = document.createElement('link');
          link.setAttribute('rel', 'alternate');
          link.setAttribute('hreflang', lang);
          link.setAttribute('href', url);
          document.head.appendChild(link);
        }
      });

      // Add x-default hreflang (usually pointing to the main language)
      if (alternateUrls.en) {
        const defaultLink = document.createElement('link');
        defaultLink.setAttribute('rel', 'alternate');
        defaultLink.setAttribute('hreflang', 'x-default');
        defaultLink.setAttribute('href', alternateUrls.en);
        document.head.appendChild(defaultLink);
      }
    }

    // Set content language meta tag
    let contentLangMeta = document.querySelector('meta[http-equiv="content-language"]');
    if (!contentLangMeta) {
      contentLangMeta = document.createElement('meta');
      contentLangMeta.setAttribute('http-equiv', 'content-language');
      document.head.appendChild(contentLangMeta);
    }
    contentLangMeta.setAttribute('content', language);

  }, [language, canonicalUrl, alternateUrls]);

  return null; // This component doesn't render anything visible
};
