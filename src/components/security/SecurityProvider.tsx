import React, { useEffect } from 'react';
import { getCSPHeader, secureLog } from '@/lib/security';

/**
 * SecurityProvider — installs runtime security side-effects:
 *  - Dev-only CSP meta tag
 *  - Global unhandled error / promise rejection logging
 *
 * No React context is exposed anymore — the previous `csrfToken` and
 * `useSecurity()` API were dead code (zero consumers). If a real CSRF need
 * arises later, reintroduce it via a dedicated provider.
 */
export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = getCSPHeader();
      document.head.appendChild(meta);
    }

    const handleError = (event: ErrorEvent) => {
      secureLog.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      secureLog.error('Unhandled promise rejection', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  return <>{children}</>;
};
