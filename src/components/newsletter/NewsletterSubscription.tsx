
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useNewsletter } from '@/hooks/useNewsletter';
import { HoneypotField } from '@/components/security/HoneypotField';
import { validateHoneypot } from '@/lib/security';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'default' | 'footer' | 'sidebar';
  className?: string;
}

interface FormData {
  email: string;
  preferences: {
    projects: boolean;
    blog_posts: boolean;
  };
}

export const NewsletterSubscription = ({ 
  variant = 'default', 
  className = '' 
}: NewsletterSubscriptionProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const { subscribe, isLoading } = useNewsletter();
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    defaultValues: {
      email: '',
      preferences: {
        projects: true,
        blog_posts: true
      }
    }
  });

  const preferences = watch('preferences');

  const onSubmit = async (data: FormData) => {
    // Bot check - silently fail if honeypot is filled
    if (!validateHoneypot(honeypot)) {
      console.log('Bot detected via honeypot');
      return;
    }

    const success = await subscribe(data.email, data.preferences);
    if (success) {
      setIsSubscribed(true);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center justify-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 animate-fade-in ${className}`}>
        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
        <span className="text-foreground font-medium">
          ✅ Check your email to confirm subscription!
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
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mx-auto mb-4 animate-pulse">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Stay Updated
          </h3>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Honeypot field for bot protection */}
        <HoneypotField 
          name="website" 
          value={honeypot} 
          onChange={setHoneypot}
        />
        
        <div className={`${isFooterVariant ? 'flex flex-col sm:flex-row sm:space-x-2 sm:space-y-0 space-y-2' : ''}`}>
          <div className={`${isFooterVariant ? 'flex-1' : 'w-full'}`}>
            <Input
              type="email"
              placeholder="Enter your email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="transition-all duration-300 focus:scale-105 focus:shadow-lg focus:shadow-primary/20"
              disabled={isLoading}
              aria-label="Email address for newsletter subscription"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || (!preferences.projects && !preferences.blog_posts)}
            className={`${isFooterVariant ? 'whitespace-nowrap' : 'w-full'} bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20`}
            style={{ minHeight: '48px' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">What would you like to receive?</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="projects"
                checked={preferences.projects}
                onCheckedChange={(checked) => 
                  setValue('preferences.projects', !!checked)
                }
              />
              <Label htmlFor="projects" className="text-sm cursor-pointer">
                Notify me about new projects
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="blog_posts"
                checked={preferences.blog_posts}
                onCheckedChange={(checked) => 
                  setValue('preferences.blog_posts', !!checked)
                }
              />
              <Label htmlFor="blog_posts" className="text-sm cursor-pointer">
                Notify me about new blog posts
              </Label>
            </div>
          </div>
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        🔒 You can unsubscribe at any time. No spam, ever.
      </p>
    </div>
  );
};
