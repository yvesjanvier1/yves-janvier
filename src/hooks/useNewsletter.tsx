
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewsletterPreferences {
  projects: boolean;
  blog_posts: boolean;
  [key: string]: any;
}

export const useNewsletter = () => {
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (email: string, preferences: NewsletterPreferences = { projects: true, blog_posts: true }) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate confirmation token
      const confirmationToken = crypto.randomUUID();

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          user_id: user?.id || null,
          preferences: preferences as any,
          confirmation_token: confirmationToken,
          confirmation_sent_at: new Date().toISOString(),
          is_confirmed: false
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already subscribed');
          return false;
        }
        throw error;
      }

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          confirmationToken
        }
      });

      if (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        toast.error('Subscription created but failed to send confirmation email. Please try again.');
        return false;
      }

      toast.success('✅ Check your email to confirm your subscription!');
      return true;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string, token?: string) => {
    setIsLoading(true);
    try {
      const updateData: any = { 
        is_active: false, 
        unsubscribed_at: new Date().toISOString() 
      };

      let query = supabase
        .from('newsletter_subscriptions')
        .update(updateData)
        .eq('email', email);

      // If token provided, validate it
      if (token) {
        query = query.eq('confirmation_token', token);
      }

      const { error } = await query;

      if (error) throw error;

      toast.success('Successfully unsubscribed from newsletter');
      return true;
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      toast.error('Failed to unsubscribe. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (email: string, preferences: NewsletterPreferences, token?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('newsletter_subscriptions')
        .update({ preferences: preferences as any })
        .eq('email', email);

      if (token) {
        query = query.eq('confirmation_token', token);
      }

      const { error } = await query;

      if (error) throw error;

      toast.success('Preferences updated successfully');
      return true;
    } catch (error) {
      console.error('Newsletter preferences update error:', error);
      toast.error('Failed to update preferences. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async (type: 'blog_post' | 'project', data: {
    title: string;
    slug: string;
    excerpt?: string;
    cover_image?: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('send-newsletter-notifications', {
        body: {
          type,
          ...data
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to send newsletter notification:', error);
      return false;
    }
  };

  return {
    subscribe,
    unsubscribe,
    updatePreferences,
    sendNotification,
    isLoading
  };
};
