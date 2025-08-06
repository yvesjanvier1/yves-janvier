import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify HMAC-signed JWT token
async function verifySecureToken(token: string, email: string): Promise<boolean> {
  try {
    const secret = Deno.env.get("JWT_SECRET") || "fallback-secret-key";
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify signature
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${header}.${payload}`)
    );
    
    const expectedSignatureB64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature))).replace(/=/g, "");
    
    if (signature !== expectedSignatureB64) {
      console.log('❌ Token signature verification failed');
      return false;
    }

    // Verify payload
    const decodedPayload = JSON.parse(atob(payload + '='.repeat(4 - (payload.length % 4))));
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      console.log('❌ Token has expired');
      return false;
    }

    // Check email match
    if (decodedPayload.email !== email) {
      console.log('❌ Token email mismatch');
      return false;
    }

    console.log('✅ Token verification successful');
    return true;
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    if (!token || !email) {
      console.log('❌ Missing token or email parameters');
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': '/unsubscribe?error=invalid_parameters',
        },
      });
    }

    console.log('🔐 Verifying confirmation token for:', email);

    // Verify the secure token
    const isValidToken = await verifySecureToken(token, email);
    
    if (!isValidToken) {
      console.log('❌ Invalid or expired token');
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': '/unsubscribe?error=invalid_token',
        },
      });
    }

    console.log('📝 Confirming newsletter subscription...');

    // Update the subscription in the database
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .update({
        is_confirmed: true,
        confirmed_at: new Date().toISOString(),
        is_active: true,
      })
      .eq('email', email)
      .eq('is_confirmed', false)
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': '/unsubscribe?error=database_error',
        },
      });
    }

    if (!data || data.length === 0) {
      console.log('❌ No pending subscription found');
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': '/unsubscribe?error=subscription_not_found',
        },
      });
    }

    console.log('✅ Newsletter subscription confirmed successfully:', {
      email,
      confirmedAt: new Date().toISOString(),
    });

    // Redirect to success page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/unsubscribe?subscription=confirmed',
      },
    });

  } catch (error: any) {
    console.error("❌ Error in confirm-subscription function:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/unsubscribe?error=server_error',
      },
    });
  }
};

serve(handler);