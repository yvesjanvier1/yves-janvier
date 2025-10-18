
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCSPHeader, checkRateLimit, secureLog } from '@/lib/security';

interface SecurityContextType {
  csrfToken: string;
  checkRateLimit: (identifier: string, maxRequests?: number, windowMs?: number) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Generate CSRF token
    const token = crypto.randomUUID();
    setCsrfToken(token);
    
    // Set CSP header if possible (for development)
    if (process.env.NODE_ENV === 'development') {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = getCSPHeader();
      document.head.appendChild(meta);
    }

    // Set up error boundary for unhandled errors
    const handleError = (event: ErrorEvent) => {
      secureLog.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
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

  const value = {
    csrfToken,
    checkRateLimit,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
