import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      return new Response(
        JSON.stringify({ error: 'Missing token or email parameter' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Confirming subscription for:', email, 'with token:', token);

    // Verify and update subscription
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .update({
        is_confirmed: true,
        confirmed_at: new Date().toISOString(),
        confirmation_token: null // Clear the token after use
      })
      .eq('email', email)
      .eq('confirmation_token', token)
      .eq('is_active', true)
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired confirmation token' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Subscription confirmed successfully for:', email);

    // Redirect to a success page
    const origin = req.headers.get('origin') || 'https://qfnqmdmsapovxdjwdhsx.supabase.co';
    const redirectUrl = `${origin}/?subscription=confirmed`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });

  } catch (error: any) {
    console.error("Error in confirm-subscription function:", error);
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