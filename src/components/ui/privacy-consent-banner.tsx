
import React, { useState } from 'react';
import { Button } from './button';
import { X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyConsentBannerProps {
  onConsent: (accepted: boolean) => void;
  isVisible: boolean;
}

export const PrivacyConsentBanner = ({ onConsent, isVisible }: PrivacyConsentBannerProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => onConsent(true), 200);
  };

  const handleDecline = () => {
    setIsClosing(true);
    setTimeout(() => onConsent(false), 200);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300",
        isClosing ? "animate-out slide-out-to-bottom-4 fade-out-0" : "animate-in slide-in-from-bottom-4 fade-in-0"
      )}
      role="alertdialog"
      aria-live="polite"
      aria-label="Privacy consent banner"
    >
      <div className={cn(
        "relative max-w-md mx-auto p-4 rounded-xl shadow-lg",
        "backdrop-blur-sm bg-white/90 dark:bg-gray-800/90",
        "border border-gray-200/50 dark:border-gray-700/50",
        "bg-gradient-to-b from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-800/85"
      )}>
        {/* Content */}
        <div className="pr-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              We respect your privacy
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            We use localStorage to remember your preferences and show personalized content. 
            No data is shared with third parties.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 min-h-[44px]"
            >
              Accept
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px] border-gray-200 dark:border-gray-600"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
