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
    if (!path) return BASE_URL;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const absoluteUrl = url || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  const absoluteImage = getAbsoluteUrl(image);

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
    updateMetaTag('description', description);
    updateMetaTag('author', author);
    if (tags.length > 0) {
      updateMetaTag('keywords', tags.join(', '));
    }

    // Open Graph tags - must use absolute URLs
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', absoluteImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', title, true);
    updateMetaTag('og:url', absoluteUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Yves Janvier', true);
    updateMetaTag('og:locale', 'fr_FR', true);

    // Twitter Card tags - must use absolute URLs
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:site', '@yvesjanvier01', true);
    updateMetaTag('twitter:creator', '@yvesjanvier01', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', absoluteImage, true);
    updateMetaTag('twitter:image:alt', title, true);

    // Article specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, true);
      }
      updateMetaTag('article:author', author, true);
      
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

  }, [title, description, absoluteImage, absoluteUrl, type, publishedTime, modifiedTime, author, tags]);

  return null;
};

export default SEOHead;
