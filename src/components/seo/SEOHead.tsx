import { useEffect } from 'react';

const BASE_URL = 'https://yves-janvier.lovable.app';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

// Strip HTML tags and decode entities for clean text
const stripHtml = (html: string): string => {
  if (typeof document !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  // Fallback for SSR - simple regex strip
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

// Truncate text to a max length while respecting word boundaries
const truncateText = (text: string, maxLength: number): string => {
  const cleaned = stripHtml(text).trim();
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

const SEOHead = ({
  title = "Yves Janvier - Data & Tech Expert",
  description = "Data & Tech Expert specializing in transforming complex data into actionable insights and building innovative tech solutions.",
  image = "/placeholder.svg",
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = "Yves Janvier",
  tags = []
}: SEOHeadProps) => {
  
  // Ensure absolute URLs for Open Graph
  const getAbsoluteUrl = (path: string) => {
    if (!path) return `${BASE_URL}/placeholder.svg`;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const absoluteUrl = url || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  const absoluteImage = getAbsoluteUrl(image);
  
  // Clean and truncate description for optimal social preview
  // Twitter: 200 chars, Facebook/LinkedIn: 300 chars - we use 160 for meta, 200 for social
  const cleanDescription = truncateText(description, 200);
  const metaDescription = truncateText(description, 160);

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', metaDescription);
    updateMetaTag('author', author);
    if (tags.length > 0) {
      updateMetaTag('keywords', tags.join(', '));
    }

    // Open Graph tags - Essential for Facebook, LinkedIn, WhatsApp previews
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', cleanDescription, true);
    updateMetaTag('og:image', absoluteImage, true);
    updateMetaTag('og:image:url', absoluteImage, true);
    updateMetaTag('og:image:secure_url', absoluteImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', title, true);
    updateMetaTag('og:image:type', 'image/jpeg', true);
    updateMetaTag('og:url', absoluteUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Yves Janvier', true);
    updateMetaTag('og:locale', 'fr_FR', true);
    updateMetaTag('og:locale:alternate', 'en_US', true);

    // Twitter Card tags - Essential for X/Twitter previews
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@yvesjanvier01');
    updateMetaTag('twitter:creator', '@yvesjanvier01');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', cleanDescription);
    updateMetaTag('twitter:image', absoluteImage);
    updateMetaTag('twitter:image:alt', title);
    updateMetaTag('twitter:url', absoluteUrl);
    
    // LinkedIn specific (uses OG tags primarily, but these help)
    updateMetaTag('linkedin:owner', author);

    // Article specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, true);
      }
      updateMetaTag('article:author', author, true);
      updateMetaTag('article:section', 'Technology', true);
      
      // Remove old article tags before adding new ones
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      tags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', tag);
        document.head.appendChild(meta);
      });
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', absoluteUrl);

  }, [title, metaDescription, cleanDescription, absoluteImage, absoluteUrl, type, publishedTime, modifiedTime, author, tags]);

  return null;
};

export default SEOHead;
