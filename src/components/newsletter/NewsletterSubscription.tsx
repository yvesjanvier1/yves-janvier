
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, CheckCircle2 } from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'default' | 'footer' | 'sidebar';
  className?: string;
}

export const NewsletterSubscription = ({ 
  variant = 'default', 
  className = '' 
}: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Use type assertion to work around missing types
      const { error } = await (supabase as any)
        .from('newsletter_subscriptions')
        .insert({
          email,
          user_id: user?.id || null,
          preferences: { projects: true, blog_posts: true }
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already subscribed to our newsletter');
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        setEmail('');
        toast.success('Successfully subscribed to our newsletter!');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${className}`}>
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
        <span className="text-green-800 dark:text-green-200 font-medium">
          Thanks for subscribing!
        </span>
      </div>
    );
  }

  const isFooterVariant = variant === 'footer';
  const isSidebarVariant = variant === 'sidebar';

  return (
    <div className={`${className}`}>
      {variant === 'default' && (
        <div className="text-center mb-6">
          <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground">
            Get notified when I publish new projects or blog posts
          </p>
        </div>
      )}

      {isSidebarVariant && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Get updates on new content
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-3 ${isFooterVariant ? 'flex flex-col sm:flex-row sm:space-y-0 sm:space-x-2' : ''}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${isFooterVariant ? 'flex-1' : 'w-full'}`}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className={`${isFooterVariant ? 'whitespace-nowrap' : 'w-full'}`}
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-2">
        You can unsubscribe at any time. No spam, ever.
      </p>
    </div>
  );
};
