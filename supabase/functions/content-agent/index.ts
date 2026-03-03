import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, niche, existingTopics, count } = await req.json();

    if (action === "discover") {
      // Fetch existing blog post titles to avoid duplicates
      const { data: existingPosts } = await supabase
        .from("blog_posts")
        .select("title, tags")
        .order("created_at", { ascending: false })
        .limit(20);

      const existingTitles = existingPosts?.map((p: any) => p.title).join(", ") || "None";
      const existingTags = [
        ...new Set(existingPosts?.flatMap((p: any) => p.tags || []) || []),
      ].join(", ");

      const systemPrompt = `You are an expert content strategist and trend analyst. Your job is to discover the most relevant, trending, and educational topics for a blog that covers multiple subjects. Consider:
- Current trends and what people are searching for
- Educational value and audience engagement potential
- Topics that work well across platforms (blog, Instagram, LinkedIn, WhatsApp)
- Content that can be repurposed into visual formats (quote cards, infographics, carousels)

The blog already covers these tags: ${existingTags || "various topics"}
Recent posts include: ${existingTitles}

Avoid suggesting topics too similar to existing content.`;

      const userPrompt = `Suggest ${count || 5} fresh, trending content topics${niche ? ` focused on "${niche}"` : " across various niches"}.

For each topic, provide:
1. A compelling topic title
2. A brief description (2-3 sentences) explaining why this topic is relevant now
3. A relevance score (1-100) based on trending potential and audience interest
4. A category (e.g., "Technology", "Business", "Personal Development", "Marketing", "Design", "Health", "Finance")
5. Suggested tags (3-5 relevant tags)
6. Which platforms it works best for (blog, instagram, linkedin, whatsapp)`;

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "suggest_topics",
                  description: "Return topic suggestions for the content agent",
                  parameters: {
                    type: "object",
                    properties: {
                      suggestions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            topic: { type: "string" },
                            description: { type: "string" },
                            relevance_score: { type: "number" },
                            category: { type: "string" },
                            tags: {
                              type: "array",
                              items: { type: "string" },
                            },
                            target_platforms: {
                              type: "array",
                              items: { type: "string" },
                            },
                          },
                          required: [
                            "topic",
                            "description",
                            "relevance_score",
                            "category",
                            "tags",
                            "target_platforms",
                          ],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["suggestions"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: {
              type: "function",
              function: { name: "suggest_topics" },
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

      if (!toolCall?.function?.arguments) {
        throw new Error("Invalid AI response format");
      }

      const parsed = JSON.parse(toolCall.function.arguments);
      const suggestions = parsed.suggestions;

      // Save suggestions to database
      const { data: saved, error: saveError } = await supabase
        .from("content_suggestions")
        .insert(
          suggestions.map((s: any) => ({
            topic: s.topic,
            description: s.description,
            relevance_score: s.relevance_score,
            category: s.category,
            tags: s.tags,
            target_platforms: s.target_platforms,
            source_context: niche || "general",
            status: "pending",
          }))
        )
        .select();

      if (saveError) {
        console.error("Error saving suggestions:", saveError);
        throw new Error("Failed to save suggestions");
      }

      return new Response(
        JSON.stringify({ success: true, suggestions: saved }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("content-agent error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
