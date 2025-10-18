import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogPostNotification {
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, slug, excerpt, cover_image }: BlogPostNotification = await req.json();
    
    console.log('Sending blog post notification for:', title);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch subscribers who want blog post notifications
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscriptions')
      .select('email, preferences')
      .eq('is_active', true)
      .eq('is_confirmed', true);

    if (error) {
      console.error('Error fetching subscribers:', error);
      throw error;
    }

    // Filter subscribers who want blog post notifications
    const blogSubscribers = subscribers?.filter(sub => 
      sub.preferences?.blog_posts === true
    ) || [];

    console.log(`Found ${blogSubscribers.length} subscribers for blog post notifications`);

    if (blogSubscribers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No subscribers found for blog post notifications' 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const origin = req.headers.get('origin') || 'https://qfnqmdmsapovxdjwdhsx.supabase.co';
    const postUrl = `${origin}/blog/${slug}`;
    const unsubscribeUrl = `${origin}/unsubscribe`;

    // Send emails to all subscribers
    const emailPromises = blogSubscribers.map(subscriber => 
      resend.emails.send({
        from: "Blog Updates <onboarding@resend.dev>",
        to: [subscriber.email],
        subject: `📝 New Blog Post: ${title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Blog Post</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                📝 New Blog Post Published!
              </h1>
            </div>
            
            ${cover_image ? `
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${cover_image}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              </div>
            ` : ''}
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">${title}</h2>
              ${excerpt ? `
                <p style="font-size: 16px; margin-bottom: 20px; color: #666;">
                  ${excerpt}
                </p>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${postUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(108, 77, 255, 0.3);">
                  📖 Read Full Post
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>You're receiving this because you subscribed to blog post notifications.</p>
              <p style="margin-top: 20px;">
                <a href="${unsubscribeUrl}?email=${encodeURIComponent(subscriber.email)}" style="color: #666; text-decoration: underline;">
                  Manage subscription preferences
                </a>
              </p>
            </div>
          </body>
          </html>
        `,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Blog post notification sent: ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      console.error('Some emails failed to send:', 
        results.filter(result => result.status === 'rejected')
          .map(result => (result as PromiseRejectedResult).reason)
      );
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successful,
      failed: failed,
      total: blogSubscribers.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in notify-new-blog-post function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);