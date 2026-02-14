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
    const GOOGLE_CLOUD_API_KEY = Deno.env.get("GOOGLE_CLOUD_API_KEY");
    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("GOOGLE_CLOUD_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const languageCode = url.searchParams.get("languageCode") || "en";

    // Map short codes to Google TTS language codes
    const langMap: Record<string, string> = {
      en: "en-US",
      fr: "fr-FR",
      ht: "fr-HT",
    };
    const resolvedLang = langMap[languageCode] || languageCode;

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?languageCode=${resolvedLang}&key=${GOOGLE_CLOUD_API_KEY}`
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Google TTS Voices API error:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `Google TTS Voices API error: ${response.status}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    // Filter and format voices
    const voices = (data.voices || []).map((v: any) => ({
      name: v.name,
      languageCodes: v.languageCodes,
      ssmlGender: v.ssmlGender,
      naturalSampleRateHertz: v.naturalSampleRateHertz,
      // Label for display: extract readable name
      label: formatVoiceName(v.name, v.ssmlGender),
    }));

    return new Response(JSON.stringify({ voices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("google-tts-voices error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function formatVoiceName(name: string, gender: string): string {
  // e.g. "en-US-Wavenet-D" -> "Wavenet D (Female)"
  const parts = name.split("-");
  const type = parts[2] || "Standard";
  const variant = parts[3] || "";
  const genderLabel = gender === "MALE" ? "Male" : gender === "FEMALE" ? "Female" : "Neutral";
  return `${type} ${variant} (${genderLabel})`.trim();
}
