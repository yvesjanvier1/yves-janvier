
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsletterSubscription } from '@/components/newsletter/NewsletterSubscription';
import { cn } from '@/lib/utils';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}

export const ExitIntentModal = ({ isOpen, onClose, onSubscribe }: ExitIntentModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the close button when modal opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubscribeSuccess = () => {
    onSubscribe?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-md rounded-xl shadow-2xl",
          "backdrop-blur-lg bg-white/90 dark:bg-gray-900/90",
          "border border-white/20 dark:border-gray-700/20",
          "animate-in zoom-in-95 duration-300"
        )}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 
              id="exit-modal-title"
              className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#6C4DFF] to-[#4A90E2] bg-clip-text text-transparent"
            >
              Wait! Don't go yet 🙌
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Get notified when I publish new projects or blog posts. Join other developers who stay updated!
            </p>
          </div>

          {/* Newsletter form */}
          <div className="mb-6">
            <NewsletterSubscription 
              variant="default" 
              className="space-y-4"
            />
          </div>

          {/* Continue browsing button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline-offset-4 hover:underline"
            >
              No thanks, I'll keep browsing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
