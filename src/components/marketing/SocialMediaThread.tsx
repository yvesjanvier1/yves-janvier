
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const SocialMediaThread = () => {
  const threadContent = [
    {
      id: 1,
      platform: 'Twitter/X',
      content: `🚀 I rebuilt my portfolio from scratch in 30 days using modern web technologies!

✨ From idea to production with:
• React + TypeScript
• Supabase for backend
• Tailwind CSS for styling
• @lovable_dev for rapid development

Thread below 👇 #webdev #portfolio`
    },
    {
      id: 2,
      platform: 'Twitter/X',
      content: `2/ Key features I shipped:
📧 Newsletter system with email confirmations
📊 Analytics dashboard for tracking engagement
🌍 Full i18n support (EN/FR/HT)
🎨 Dark/light theme toggle
📱 Fully responsive design
⚡ Performance optimized (90+ Lighthouse scores)`
    },
    {
      id: 3,
      platform: 'Twitter/X',
      content: `3/ Tech stack that made this possible:
• @supabase - Database + Auth + Edge Functions
• @resend - Email delivery
• @tailwindcss - Styling system
• @shadcn/ui - Component library
• @lovable_dev - AI-powered development

All deployed on @vercel ⚡`
    },
    {
      id: 4,
      platform: 'Twitter/X',
      content: `4/ Want to stay updated? 
Join 100+ developers getting my latest projects and insights 📬

Newsletter link in bio ↗️

What should I build next? Drop your ideas below 👇

#buildinpublic #webdevelopment #portfolio`
    },
    {
      id: 1,
      platform: 'LinkedIn',
      content: `🚀 Just shipped: My new developer portfolio built in 30 days

After 6 years in development, I decided to rebuild my portfolio from scratch using modern technologies. Here's what I learned and built:

🔧 **Tech Stack:**
• React + TypeScript for the frontend
• Supabase for backend infrastructure
• Tailwind CSS for design system
• Lovable.dev for AI-assisted development

✨ **Key Features:**
📧 Newsletter system with email confirmations
📊 Real-time analytics dashboard
🌍 Multi-language support (EN/FR/HT)
🎨 Dark/light theme toggle
📱 Mobile-first responsive design
⚡ 90+ Lighthouse performance scores

🎯 **What I learned:**
- Modern development tools can dramatically speed up iteration
- User experience starts with performance optimization
- Accessibility should be built-in, not bolted-on
- Analytics help understand user behavior patterns

💡 **Next steps:**
I'm planning to open-source parts of this project and share the development process. 

Want to follow along? Join my newsletter for updates on new projects and development insights.

What would you like to see me build next?

#webdevelopment #portfolio #react #supabase #buildinpublic`
    }
  ];

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Social Media Thread Content</h2>
        <p className="text-muted-foreground">
          Ready-to-use content for announcing your portfolio on social media
        </p>
      </div>

      {threadContent.map((post) => (
        <Card key={`${post.platform}-${post.id}`} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.platform}</span>
              {post.platform === 'Twitter/X' && (
                <span className="text-sm text-muted-foreground">Post {post.id}/4</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(post.content)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg border">
            {post.content}
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Character count: {post.content.length}</span>
            {post.platform === 'Twitter/X' && post.content.length > 280 && (
              <span className="text-destructive">⚠️ Over Twitter limit</span>
            )}
          </div>
        </Card>
      ))}

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="font-semibold mb-2">📋 Launch Checklist</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ Update newsletter link in bio</li>
          <li>✅ Prepare before/after screenshots</li>
          <li>✅ Schedule posts for optimal engagement times</li>
          <li>✅ Engage with comments and replies</li>
          <li>✅ Cross-post to relevant communities</li>
        </ul>
      </Card>
    </div>
  );
};
