
import React, { useState } from 'react';
import { Button } from './button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock = ({ children, language = '', showLineNumbers = false, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      const textContent = typeof children === 'string' ? children : 
        (children as any)?.props?.children || '';
      
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success('✅ Code copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        {/* Language label */}
        {language && (
          <div className="absolute top-3 left-4 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {language.toUpperCase()}
            </span>
          </div>
        )}

        {/* Copy button */}
        <div className={cn(
          "absolute top-3 right-3 z-10 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8 p-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
            aria-label={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Code content */}
        <pre className={cn(
          "p-4 overflow-x-auto text-sm font-mono leading-relaxed",
          language && "pt-12", // Extra padding when language label is present
          showLineNumbers && "pl-12" // Extra padding for line numbers
        )}>
          <code className="text-gray-800 dark:text-gray-200">
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

// Enhanced SecureHtml component to handle code blocks
export const EnhancedSecureHtml = ({ html, className }: { html: string; className?: string }) => {
  // This would need to be integrated with a proper syntax highlighter like Prism.js
  // For now, we'll create a basic implementation that detects code blocks
  const processHtml = (htmlString: string) => {
    // Simple regex to find code blocks - in a real implementation, use proper HTML parsing
    return htmlString.replace(
      /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
      (match, language, code) => {
        // Return a placeholder that React can process
        return `<div data-code-block="true" data-language="${language || ''}">${code}</div>`;
      }
    );
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processHtml(html) }}
    />
  );
};
