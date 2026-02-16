import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { text, voiceId = "EXAVITQu4vr4xnSDxMaL" } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'text' parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ElevenLabs has a 5000 char limit per request
    const truncatedText = text.slice(0, 5000);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("ElevenLabs TTS API error:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `ElevenLabs TTS API error: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return audio as binary
    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("elevenlabs-tts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
