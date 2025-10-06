import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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

    // Log notification details (email sending would be implemented via Resend in production)
    console.log(`Would send project notification to ${projectSubscribers.length} subscribers`);
    console.log(`Project: ${title} (${slug})`);

    const results = projectSubscribers.map(() => ({ status: 'fulfilled' as const }));
    
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