
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNewsletter = () => {
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (email: string, preferences = { projects: true, blog_posts: true }) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          user_id: user?.id || null,
          preferences
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already subscribed');
          return false;
        }
        throw error;
      }

      toast.success('Successfully subscribed to newsletter!');
      return true;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          is_active: false, 
          unsubscribed_at: new Date().toISOString() 
        })
        .eq('email', email);

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
    sendNotification,
    isLoading
  };
};
