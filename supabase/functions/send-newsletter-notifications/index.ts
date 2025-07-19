
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'blog_post' | 'project';
  title: string;
  excerpt?: string;
  slug: string;
  cover_image?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, title, excerpt, slug, cover_image }: NotificationRequest = await req.json();

    // Get active subscribers who want this type of content
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from('newsletter_subscriptions')
      .select('email, preferences')
      .eq('is_active', true);

    if (subscribersError) {
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscribers' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Filter subscribers based on preferences
    const interestedSubscribers = subscribers.filter(subscriber => {
      const preferences = subscriber.preferences || { projects: true, blog_posts: true };
      return type === 'blog_post' ? preferences.blog_posts : preferences.projects;
    });

    if (interestedSubscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No interested subscribers for this content type' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare email content
    const subject = type === 'blog_post' 
      ? `New Blog Post: ${title}` 
      : `New Project: ${title}`;

    const contentType = type === 'blog_post' ? 'blog post' : 'project';
    const baseUrl = 'https://your-domain.com'; // Update with your actual domain
    const contentUrl = type === 'blog_post' 
      ? `${baseUrl}/blog/${slug}` 
      : `${baseUrl}/portfolio/${slug}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Yves Janvier</h1>
            <p style="color: #666; margin: 5px 0;">Full Stack Developer & Data Engineer</p>
          </div>
          
          ${cover_image ? `<img src="${cover_image}" alt="${title}" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; margin-bottom: 20px;">` : ''}
          
          <h2 style="color: #1e40af; margin-bottom: 15px;">New ${contentType}: ${title}</h2>
          
          ${excerpt ? `<p style="color: #555; font-size: 16px; margin-bottom: 25px;">${excerpt}</p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${contentUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Read ${contentType === 'blog post' ? 'Article' : 'More'}
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            You're receiving this because you subscribed to updates from Yves Janvier.<br>
            <a href="${baseUrl}/unsubscribe?email={{email}}" style="color: #2563eb;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `;

    // Send emails to all interested subscribers
    const emailPromises = interestedSubscribers.map(subscriber => 
      resend.emails.send({
        from: "Yves Janvier <notifications@yourdomain.com>", // Update with your verified domain
        to: [subscriber.email],
        subject,
        html: emailHtml.replace('{{email}}', encodeURIComponent(subscriber.email)),
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Newsletter notifications sent: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      message: `Notifications sent to ${successful} subscribers`,
      successful,
      failed 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter-notifications function:", error);
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
