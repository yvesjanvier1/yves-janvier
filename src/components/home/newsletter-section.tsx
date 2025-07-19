
import React from 'react';
import { NewsletterSubscription } from '@/components/newsletter/NewsletterSubscription';
import { SectionHeader } from '@/components/ui/section-header';

export const NewsletterSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Stay in the Loop"
          subtitle="Get notified when I publish new projects or blog posts. No spam, just quality content delivered to your inbox."
          centered
          className="mb-12"
        />
        
        <div className="max-w-md mx-auto">
          <NewsletterSubscription />
        </div>
      </div>
    </section>
  );
};
