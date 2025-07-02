
import { sanitizeHtml } from '@/lib/security';

interface SecureHtmlProps {
  html: string;
  className?: string;
}

export function SecureHtml({ html, className }: SecureHtmlProps) {
  const sanitizedHtml = sanitizeHtml(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
