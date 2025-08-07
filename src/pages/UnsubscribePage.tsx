
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNewsletter } from '@/hooks/useNewsletter';
import { supabase } from '@/integrations/supabase/client';

import { Mail, CheckCircle2, ArrowLeft, Settings, Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { unsubscribe, updatePreferences, isLoading } = useNewsletter();
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    projects: true,
    blog_posts: true
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Validate token and load current preferences
  useEffect(() => {
    const validateTokenAndLoadPreferences = async () => {
      if (!email || !token) {
        setIsTokenValid(false);
        return;
      }

      try {
        // Verify token by calling the confirm-subscription function
        const { data, error } = await supabase.functions.invoke('confirm-subscription', {
          body: { 
            token,
            email,
            validate_only: true // Add this flag to just validate without confirming
          }
        });

        if (error) {
          console.error('Token validation error:', error);
          setIsTokenValid(false);
          return;
        }

        setIsTokenValid(true);

        // Load current subscription preferences
        const { data: subscription, error: subError } = await supabase
          .from('newsletter_subscriptions')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .maybeSingle();

        if (subscription && !subError) {
          setCurrentSubscription(subscription);
          // Safely parse preferences JSON
          const prefs = subscription.preferences as any;
          setPreferences({
            projects: prefs?.projects ?? true,
            blog_posts: prefs?.blog_posts ?? true
          });
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsTokenValid(false);
      }
    };

    validateTokenAndLoadPreferences();

    // Check if coming from confirmation
    if (searchParams.get('subscription') === 'confirmed') {
      toast.success('✅ Your subscription has been confirmed! Welcome to our newsletter.');
    }
  }, [searchParams, email, token]);

  const handleKeepSubscription = () => {
    navigate('/');
  };

  const handleUnsubscribe = async () => {
    if (!email) return;
    
    const success = await unsubscribe(email, token || undefined);
    if (success) {
      setIsUnsubscribed(true);
    }
  };

  const handleUpdatePreferences = async () => {
    if (!email) return;
    
    const success = await updatePreferences(email, preferences, token || undefined);
    if (success) {
      toast.success('✅ Preferences saved!');
    }
  };

  const handleDeleteSubscription = async () => {
    if (!email) return;
    
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('email', email);

      if (error) throw error;

      toast.success('✅ Subscription deleted successfully!');
      setIsUnsubscribed(true);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription. Please try again.');
    }
  };

  // Loading state while validating token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-md mx-auto">
            <Card className="backdrop-blur-md bg-background/80 border-primary/20 shadow-2xl">
              <CardContent className="pt-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Validating Access</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your token...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token or email
  if (!email || isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-destructive/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-md mx-auto">
            <Card className="backdrop-blur-md bg-background/80 border-destructive/20 shadow-2xl">
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4">
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Invalid or Expired Link</h2>
                <p className="text-muted-foreground mb-6">
                  This unsubscribe link is invalid or has expired. Please use the link from a recent email.
                </p>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="w-full min-h-[48px]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-green-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-md mx-auto">
            <Card className="backdrop-blur-md bg-background/80 border-green-500/20 shadow-2xl">
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Successfully Unsubscribed</h2>
                <p className="text-muted-foreground mb-6">
                  You have been unsubscribed from our newsletter. We're sorry to see you go!
                </p>
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full min-h-[48px] bg-gradient-to-r from-primary to-primary/80"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Homepage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:16px_16px]" />
      
      <div className="container mx-auto px-4 py-8 md:py-16 relative">
        <div className="max-w-lg mx-auto">
          <Card className="backdrop-blur-md bg-background/80 border-primary/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 mx-auto mb-4 shadow-lg">
                <Settings className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Manage Your Subscription
              </CardTitle>
              <p className="text-muted-foreground">
                Update your preferences or unsubscribe from our newsletter
              </p>
              
              {/* Security indicator */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Secure access verified</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email display */}
              <div className="p-4 bg-muted/30 backdrop-blur-sm rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Email address:</p>
                </div>
                <p className="font-medium break-all">{decodeURIComponent(email)}</p>
              </div>

              {/* Current subscription status */}
              {currentSubscription && (
                <div className="p-4 bg-green-500/5 backdrop-blur-sm rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Active Subscription</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subscribed on {new Date(currentSubscription.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Email Preferences Section */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center text-lg">
                  <Eye className="h-5 w-5 mr-2 text-primary" />
                  Email Preferences
                </h3>
                
                <div className="space-y-3">
                  {/* Project Updates */}
                  <div className="flex items-start space-x-3 p-4 border border-primary/10 rounded-lg hover:bg-muted/30 transition-all duration-200 backdrop-blur-sm min-h-[48px]">
                    <Checkbox
                      id="projects"
                      checked={preferences.projects}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, projects: !!checked }))
                      }
                      className="mt-1 h-5 w-5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="projects" className="cursor-pointer font-medium text-base">
                        🚀 Project Updates
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when new projects and portfolio pieces are published
                      </p>
                    </div>
                  </div>
                  
                  {/* Blog Post Updates */}
                  <div className="flex items-start space-x-3 p-4 border border-primary/10 rounded-lg hover:bg-muted/30 transition-all duration-200 backdrop-blur-sm min-h-[48px]">
                    <Checkbox
                      id="blog_posts"
                      checked={preferences.blog_posts}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, blog_posts: !!checked }))
                      }
                      className="mt-1 h-5 w-5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="blog_posts" className="cursor-pointer font-medium text-base">
                        📝 Blog Post Updates
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when new blog posts and articles are published
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Preferences Button */}
                <Button 
                  onClick={handleUpdatePreferences}
                  disabled={isLoading || (!preferences.projects && !preferences.blog_posts)}
                  className="w-full min-h-[48px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  {isLoading ? 'Saving...' : '✅ Save Preferences'}
                </Button>
                
                {(!preferences.projects && !preferences.blog_posts) && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                    ⚠️ Select at least one preference to stay subscribed
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-primary/10 space-y-3">
                <Button 
                  onClick={handleKeepSubscription}
                  variant="outline" 
                  className="w-full min-h-[48px] border-primary/20 hover:bg-primary/5"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Keep My Subscription
                </Button>
                
                <Button 
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full min-h-[48px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-400"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {isLoading ? 'Unsubscribing...' : 'Unsubscribe Completely'}
                </Button>

                {/* Delete Subscription */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      className="w-full min-h-[48px] bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="backdrop-blur-md bg-background/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        Delete Subscription Permanently
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your subscription and all associated data. 
                        You won't receive any future emails, and you'll need to resubscribe if you change your mind.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="min-h-[48px]">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteSubscription}
                        className="min-h-[48px] bg-destructive hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Footer Notice */}
              <div className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 Your preferences are securely encrypted and can be changed anytime using links in our emails.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
