import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials not configured");
      throw new Error("Storage service not configured");
    }

    const imagePrompt = title 
      ? `Create a professional, modern blog cover image for an article titled "${title}". The image should be visually striking, suitable for a technology blog, with abstract or conceptual elements. Use a clean, professional color palette with blue and purple tones. No text in the image.`
      : `Create a professional, modern blog cover image about ${topic || 'technology'}. The image should be visually striking with abstract tech elements like circuits, data visualization, or futuristic patterns. Use a clean color palette with blue and purple tones. No text.`;

    console.log(`Generating cover image with prompt: ${imagePrompt.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { role: "user", content: imagePrompt }
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate image");
    }

    const data = await response.json();
    console.log("AI response structure:", JSON.stringify(data).substring(0, 200));

    const images = data.choices?.[0]?.message?.images;
    
    if (!images || images.length === 0) {
      console.error("No images in AI response");
      throw new Error("No image generated");
    }

    const base64ImageUrl = images[0]?.image_url?.url;
    
    if (!base64ImageUrl) {
      console.error("No image URL in response");
      throw new Error("Invalid image response");
    }

    console.log("Image generated, uploading to storage...");

    // Extract base64 data from data URL
    const base64Data = base64ImageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().substring(0, 8);
    const fileName = `cover-${timestamp}-${randomId}.png`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to save image");
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log("Image uploaded successfully:", publicUrl);

    return new Response(JSON.stringify({
      success: true,
      imageUrl: publicUrl,
      fileName: fileName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating cover image:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate cover image" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
