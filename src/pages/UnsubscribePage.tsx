
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNewsletter } from '@/hooks/useNewsletter';
import { CheckCircle2, Mail } from 'lucide-react';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { unsubscribe, isLoading } = useNewsletter();
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const handleUnsubscribe = async () => {
    if (!email) return;
    
    const success = await unsubscribe(decodeURIComponent(email));
    if (success) {
      setIsUnsubscribed(true);
    }
  };

  if (!email) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Invalid Unsubscribe Link</CardTitle>
              <CardDescription>
                The unsubscribe link appears to be invalid or expired.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (isUnsubscribed) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Successfully Unsubscribed</CardTitle>
              <CardDescription>
                You have been successfully unsubscribed from our newsletter.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                We're sorry to see you go! If you change your mind, you can always subscribe again from our website.
              </p>
              <Button asChild>
                <a href="/">Return to Homepage</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Unsubscribe from Newsletter</CardTitle>
            <CardDescription>
              Are you sure you want to unsubscribe from our newsletter?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Email: <strong>{decodeURIComponent(email)}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                You'll no longer receive updates about new projects and blog posts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                asChild
              >
                <a href="/">Keep Subscription</a>
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleUnsubscribe}
                disabled={isLoading}
              >
                {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnsubscribePage;
