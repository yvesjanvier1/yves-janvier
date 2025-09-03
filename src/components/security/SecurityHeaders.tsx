import { useEffect } from 'react';

/**
 * Security Headers Component
 * Adds security headers for enhanced protection in development and production
 */
export const SecurityHeaders = () => {
  useEffect(() => {
    // Add security headers via meta tags (limited effectiveness but better than nothing)
    const headers = [
      {
        httpEquiv: 'X-Content-Type-Options',
        content: 'nosniff'
      },
      {
        httpEquiv: 'X-Frame-Options',
        content: 'DENY'
      },
      {
        httpEquiv: 'X-XSS-Protection',
        content: '1; mode=block'
      },
      {
        httpEquiv: 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin'
      },
      {
        httpEquiv: 'Permissions-Policy',
        content: 'geolocation=(), microphone=(), camera=()'
      }
    ];

    const metaElements: HTMLMetaElement[] = [];

    headers.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.httpEquiv;
      meta.content = header.content;
      document.head.appendChild(meta);
      metaElements.push(meta);
    });

    // Cleanup on unmount
    return () => {
      metaElements.forEach(meta => {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};