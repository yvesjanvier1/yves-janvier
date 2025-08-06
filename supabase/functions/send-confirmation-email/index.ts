import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { SubscriptionConfirmationEmail } from "./_templates/subscription-confirmation.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationToken: string;
}

// Generate cryptographically secure HMAC-signed token
async function generateSecureToken(email: string): Promise<string> {
  const secret = Deno.env.get("JWT_SECRET") || "fallback-secret-key";
  const payload = {
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${header}.${payloadB64}`)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "");
  return `${header}.${payloadB64}.${signatureB64}`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationToken }: ConfirmationEmailRequest = await req.json();
    
    console.log('🚀 Generating secure token for newsletter confirmation:', email);

    // Generate a cryptographically secure token valid for 24 hours
    const secureToken = await generateSecureToken(email);
    
    // Determine the site URL
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://qfnqmdmsapovxdjwdhsx.supabase.co';
    const siteUrl = origin.includes('localhost') ? origin : origin;
    
    const confirmationUrl = `${siteUrl}/confirm-subscription?token=${secureToken}&email=${encodeURIComponent(email)}`;
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${secureToken}`;

    console.log('📧 Rendering React Email template...');

    // Render the React Email template
    const emailHtml = await renderAsync(
      React.createElement(SubscriptionConfirmationEmail, {
        email,
        confirmationUrl,
        unsubscribeUrl,
      })
    );

    // Generate plain text version for spam compliance
    const emailText = `
Welcome to our newsletter!

Thanks for subscribing! You're one step away from receiving updates about new projects and blog posts.

To confirm your subscription, visit: ${confirmationUrl}

You'll receive updates about:
- New project launches and case studies
- Fresh blog posts and insights  
- Tips and tutorials
- Exclusive content and early access

If you didn't subscribe, you can safely ignore this email.

Need help? Just reply to this email.

To unsubscribe: ${unsubscribeUrl}
    `.trim();

    console.log('📬 Sending confirmation email via Resend...');

    const emailResponse = await resend.emails.send({
      from: "Newsletter <onboarding@resend.dev>",
      to: [email],
      subject: "👋 Please confirm your newsletter subscription",
      html: emailHtml,
      text: emailText,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      },
    });

    if (emailResponse.error) {
      console.error('❌ Failed to send confirmation email:', emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    console.log('✅ Confirmation email sent successfully:', {
      id: emailResponse.data?.id,
      email,
      timestamp: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: 'Confirmation email sent successfully',
      expiresIn: '24 hours'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-confirmation-email function:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Failed to send confirmation email',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);