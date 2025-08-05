
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useNewsletter } from '@/hooks/useNewsletter';
import Layout from '@/components/layout/Layout';
import { Mail, CheckCircle2, ArrowLeft, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { unsubscribe, updatePreferences, isLoading } = useNewsletter();
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [preferences, setPreferences] = useState({
    projects: true,
    blog_posts: true
  });

  useEffect(() => {
    // Check if coming from confirmation
    if (searchParams.get('subscription') === 'confirmed') {
      toast.success('✅ Your subscription has been confirmed! Welcome to our newsletter.');
    }
  }, [searchParams]);

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
      toast.success('Your preferences have been updated!');
    }
  };

  if (!email) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Unsubscribe Link</h2>
              <p className="text-muted-foreground mb-4">
                The unsubscribe link appears to be invalid or expired.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isUnsubscribed) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Successfully Unsubscribed</h2>
              <p className="text-muted-foreground mb-4">
                You have been unsubscribed from our newsletter. We're sorry to see you go!
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mx-auto mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">Manage Your Subscription</CardTitle>
              <p className="text-muted-foreground">
                Update your preferences or unsubscribe from our newsletter
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Email address:</p>
                <p className="font-medium">{decodeURIComponent(email)}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Email Preferences
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="projects"
                      checked={preferences.projects}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, projects: !!checked }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="projects" className="cursor-pointer font-medium">
                        Project Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new projects are published
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="blog_posts"
                      checked={preferences.blog_posts}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, blog_posts: !!checked }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="blog_posts" className="cursor-pointer font-medium">
                        Blog Post Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new blog posts are published
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleUpdatePreferences}
                  disabled={isLoading || (!preferences.projects && !preferences.blog_posts)}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  Update Preferences
                </Button>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Button 
                  onClick={handleKeepSubscription}
                  variant="outline" 
                  className="w-full"
                >
                  Keep My Subscription
                </Button>
                
                <Button 
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? 'Unsubscribing...' : 'Unsubscribe Completely'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You can change these preferences at any time by clicking the unsubscribe link in any email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UnsubscribePage;
