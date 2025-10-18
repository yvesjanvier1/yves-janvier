import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProjectNotification {
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  tech_stack?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, slug, description, images, tech_stack }: ProjectNotification = await req.json();
    
    console.log('Sending project notification for:', title);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch subscribers who want project notifications
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscriptions')
      .select('email, preferences')
      .eq('is_active', true)
      .eq('is_confirmed', true);

    if (error) {
      console.error('Error fetching subscribers:', error);
      throw error;
    }

    // Filter subscribers who want project notifications
    const projectSubscribers = subscribers?.filter(sub => 
      sub.preferences?.projects === true
    ) || [];

    console.log(`Found ${projectSubscribers.length} subscribers for project notifications`);

    if (projectSubscribers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No subscribers found for project notifications' 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const origin = req.headers.get('origin') || 'https://qfnqmdmsapovxdjwdhsx.supabase.co';
    const projectUrl = `${origin}/portfolio/${slug}`;
    const unsubscribeUrl = `${origin}/unsubscribe`;

    const firstImage = images && images.length > 0 ? images[0] : null;
    const techStackDisplay = tech_stack && tech_stack.length > 0 
      ? tech_stack.slice(0, 5).join(', ') + (tech_stack.length > 5 ? '...' : '')
      : null;

    // Send emails to all subscribers
    const emailPromises = projectSubscribers.map(subscriber => 
      resend.emails.send({
        from: "Project Updates <onboarding@resend.dev>",
        to: [subscriber.email],
        subject: `🚀 New Project: ${title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Project</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
                🚀 New Project Launch!
              </h1>
            </div>
            
            ${firstImage ? `
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${firstImage}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              </div>
            ` : ''}
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">${title}</h2>
              ${description ? `
                <p style="font-size: 16px; margin-bottom: 20px; color: #666;">
                  ${description}
                </p>
              ` : ''}
              
              ${techStackDisplay ? `
                <div style="margin-bottom: 20px;">
                  <h4 style="color: #333; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tech Stack</h4>
                  <p style="background: white; padding: 10px 15px; border-radius: 8px; font-size: 14px; color: #666; margin: 0;">
                    ${techStackDisplay}
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${projectUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(108, 77, 255, 0.3);">
                  🔍 View Project
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>You're receiving this because you subscribed to project notifications.</p>
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

    console.log(`Project notification sent: ${successful} successful, ${failed} failed`);

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
      total: projectSubscribers.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in notify-new-project function:", error);
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