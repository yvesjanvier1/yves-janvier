import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationToken }: ConfirmationEmailRequest = await req.json();
    
    console.log('Sending confirmation email to:', email);

    const confirmationUrl = `${req.headers.get('origin') || 'https://qfnqmdmsapovxdjwdhsx.supabase.co'}/confirm-subscription?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

    const emailResponse = await resend.emails.send({
      from: "Newsletter <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your newsletter subscription",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Newsletter Subscription</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              📧 Confirm Your Subscription
            </h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Welcome aboard! 🎉</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for subscribing to our newsletter. You're one step away from receiving updates about new projects and blog posts.
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Please click the button below to confirm your subscription:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #6C4DFF 0%, #4A90E2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(108, 77, 255, 0.3); transition: transform 0.2s;">
                ✅ Confirm Subscription
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
            <p style="margin-top: 20px;">
              <a href="${confirmationUrl.replace('/confirm-subscription', '/unsubscribe')}" style="color: #666; text-decoration: underline;">
                Unsubscribe
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
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