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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "discover") {
      return await handleDiscover(supabase, LOVABLE_API_KEY, body);
    }
    if (action === "generate-visual") {
      return await handleGenerateVisual(supabase, supabaseAdmin, LOVABLE_API_KEY, body);
    }
    if (action === "generate-carousel") {
      return await handleGenerateCarousel(supabase, supabaseAdmin, LOVABLE_API_KEY, body);
    }
    if (action === "auto-pipeline") {
      return await handleAutoPipeline(supabase, supabaseAdmin, LOVABLE_API_KEY, body);
    }
    if (action === "republish") {
      return await handleRepublish(supabase, supabaseAdmin, LOVABLE_API_KEY, body);
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

// ─── DISCOVER HANDLER ───
async function handleDiscover(supabase: any, apiKey: string, body: any) {
  const { niche, count } = body;

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

  const response = await callAI(apiKey, {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [{
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
                  tags: { type: "array", items: { type: "string" } },
                  target_platforms: { type: "array", items: { type: "string" } },
                },
                required: ["topic", "description", "relevance_score", "category", "tags", "target_platforms"],
                additionalProperties: false,
              },
            },
          },
          required: ["suggestions"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "suggest_topics" } },
  });

  if (!response.ok) return handleAIError(response);

  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) throw new Error("Invalid AI response format");

  const parsed = JSON.parse(toolCall.function.arguments);

  const { data: saved, error: saveError } = await supabase
    .from("content_suggestions")
    .insert(
      parsed.suggestions.map((s: any) => ({
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

  if (saveError) throw new Error("Failed to save suggestions");

  return new Response(
    JSON.stringify({ success: true, suggestions: saved }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ─── GENERATE VISUAL HANDLER ───
async function handleGenerateVisual(supabase: any, supabaseAdmin: any, apiKey: string, body: any) {
  const { suggestionId, topic, description, contentType, platform, tags, scheduledAt } = body;

  console.log(`Generating visual: type=${contentType}, platform=${platform}, topic=${topic}`);

  const platformSpecs: Record<string, string> = {
    instagram: "Square format (1080x1080). Bold, vibrant, scroll-stopping. Large readable text. Use brand colors.",
    linkedin: "Landscape format (1200x627). Professional, clean, corporate-friendly. Subtle gradients.",
    whatsapp: "Square format (800x800). Simple, high-contrast, readable at small sizes. Minimal text.",
  };

  const contentTypePrompts: Record<string, string> = {
    quote_card: `Create a professional quote card image with an inspiring or educational quote about "${topic}". Include:
- A powerful one-line quote or key insight related to the topic
- Clean, modern typography with the quote text prominently displayed
- A subtle branded footer area (leave space for a name/handle)
- Visually appealing background (gradient, abstract pattern, or subtle texture)
- ${platformSpecs[platform] || platformSpecs.instagram}
Do NOT include any real person's name. The quote should be generic wisdom about the topic.`,

    infographic: `Create a clean infographic-style image about "${topic}". Include:
- A clear title at the top
- 3-5 key data points or facts visualized with icons and short text
- Clean layout with sections clearly separated
- Professional color scheme with good contrast
- ${platformSpecs[platform] || platformSpecs.instagram}
Use placeholder numbers/stats that look realistic. Focus on visual clarity.`,

    carousel: `Create ONE slide for a carousel post about "${topic}". This should be the TITLE/COVER slide. Include:
- A bold, attention-grabbing title
- A subtitle or hook line that makes people want to swipe
- Visual elements (icons, shapes, patterns) that suggest there's more content
- "Swipe →" indicator
- ${platformSpecs[platform] || platformSpecs.instagram}
Make it bold and engaging to encourage swiping.`,
  };

  const imagePrompt = contentTypePrompts[contentType] || contentTypePrompts.quote_card;

  const imageResponse = await callAI(apiKey, {
    model: "google/gemini-2.5-flash-image",
    messages: [{ role: "user", content: imagePrompt }],
    modalities: ["image", "text"],
  });

  if (!imageResponse.ok) return handleAIError(imageResponse);

  const imageData = await imageResponse.json();
  const base64ImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!base64ImageUrl) throw new Error("No image generated by AI");

  const publicUrl = await uploadBase64Image(supabaseAdmin, base64ImageUrl, contentType, platform);

  // Generate caption and hashtags
  const { caption, hashtags } = await generateCaptionAndHashtags(apiKey, topic, description, contentType, platform);

  const { data: saved, error: saveError } = await supabase
    .from("content_queue")
    .insert({
      suggestion_id: suggestionId || null,
      title: topic,
      content_type: contentType,
      platform,
      image_url: publicUrl,
      text_content: description || "",
      caption,
      hashtags,
      status: scheduledAt ? "scheduled" : "draft",
      scheduled_at: scheduledAt || null,
    })
    .select()
    .single();

  if (saveError) throw new Error("Failed to save content to queue");

  if (suggestionId) {
    await supabase.from("content_suggestions").update({ status: "used" }).eq("id", suggestionId);
  }

  return new Response(
    JSON.stringify({ success: true, content: saved }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ─── GENERATE CAROUSEL (MULTI-SLIDE) HANDLER ───
async function handleGenerateCarousel(supabase: any, supabaseAdmin: any, apiKey: string, body: any) {
  const { suggestionId, topic, description, platform, tags, slideCount = 4, scheduledAt } = body;

  console.log(`Generating ${slideCount}-slide carousel: platform=${platform}, topic=${topic}`);

  const platformSpec = platform === "linkedin"
    ? "Landscape format (1200x627). Professional, clean."
    : "Square format (1080x1080). Bold, vibrant.";

  const carouselGroupId = crypto.randomUUID();
  const slides: any[] = [];

  const planResponse = await callAI(apiKey, {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: "You are a social media carousel expert. Plan concise slide content." },
      { role: "user", content: `Plan a ${slideCount}-slide carousel about "${topic}". ${description || ""}\n\nFor each slide provide a short title (max 8 words) and a key point (max 20 words). Slide 1 is the cover, last slide is the CTA.` },
    ],
    tools: [{
      type: "function",
      function: {
        name: "plan_carousel",
        description: "Return slide plan",
        parameters: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  key_point: { type: "string" },
                },
                required: ["title", "key_point"],
                additionalProperties: false,
              },
            },
          },
          required: ["slides"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "plan_carousel" } },
  });

  if (!planResponse.ok) return handleAIError(planResponse);

  const planData = await planResponse.json();
  const planTool = planData.choices?.[0]?.message?.tool_calls?.[0];
  if (!planTool?.function?.arguments) throw new Error("Failed to plan carousel");

  const slidePlan = JSON.parse(planTool.function.arguments).slides;

  for (let i = 0; i < slidePlan.length; i++) {
    const slide = slidePlan[i];
    const isFirst = i === 0;
    const isLast = i === slidePlan.length - 1;

    let slidePrompt = `Create slide ${i + 1} of ${slidePlan.length} for a carousel post about "${topic}". ${platformSpec}\n`;

    if (isFirst) {
      slidePrompt += `This is the COVER slide. Title: "${slide.title}". Add a "Swipe →" indicator. Make it bold and eye-catching.`;
    } else if (isLast) {
      slidePrompt += `This is the CTA/CLOSING slide. Title: "${slide.title}". Key point: "${slide.key_point}". Include a call-to-action like "Follow for more" or "Save this post".`;
    } else {
      slidePrompt += `Content slide. Title: "${slide.title}". Key point: "${slide.key_point}". Use consistent style with other slides. Add slide number "${i + 1}/${slidePlan.length}" in corner.`;
    }

    slidePrompt += `\nKeep the visual style consistent across all slides. Use the same color palette and typography.`;

    const imgResp = await callAI(apiKey, {
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: slidePrompt }],
      modalities: ["image", "text"],
    });

    if (!imgResp.ok) {
      console.error(`Failed to generate slide ${i + 1}`);
      continue;
    }

    const imgData = await imgResp.json();
    const b64 = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!b64) continue;

    const url = await uploadBase64Image(supabaseAdmin, b64, "carousel", platform, `slide${i + 1}`);
    slides.push({ ...slide, image_url: url, slide_number: i + 1 });
  }

  if (slides.length === 0) throw new Error("Failed to generate any carousel slides");

  const { caption, hashtags } = await generateCaptionAndHashtags(apiKey, topic, description, "carousel", platform);

  const insertData = slides.map((slide) => ({
    suggestion_id: suggestionId || null,
    title: `${topic} - Slide ${slide.slide_number}`,
    content_type: "carousel",
    platform,
    image_url: slide.image_url,
    text_content: `${slide.title}: ${slide.key_point}`,
    caption: slide.slide_number === 1 ? caption : null,
    hashtags: slide.slide_number === 1 ? hashtags : [],
    status: scheduledAt ? "scheduled" : "draft",
    scheduled_at: scheduledAt || null,
    slide_number: slide.slide_number,
    carousel_group_id: carouselGroupId,
  }));

  const { data: saved, error: saveError } = await supabase
    .from("content_queue")
    .insert(insertData)
    .select();

  if (saveError) throw new Error("Failed to save carousel to queue");

  if (suggestionId) {
    await supabase.from("content_suggestions").update({ status: "used" }).eq("id", suggestionId);
  }

  return new Response(
    JSON.stringify({ success: true, slides: saved, carouselGroupId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ─── AUTO PIPELINE HANDLER ───
async function handleAutoPipeline(supabase: any, supabaseAdmin: any, apiKey: string, body: any) {
  const { niche, contentType = "quote_card", platforms = ["instagram", "linkedin"], autoSchedule = true } = body;

  console.log(`Running auto-pipeline: niche=${niche}, type=${contentType}, platforms=${platforms.join(",")}`);

  // Step 1: Discover topics
  const discoverResult = await handleDiscover(supabase, apiKey, { niche, count: 3 });
  const discoverData = await discoverResult.json();

  if (!discoverData.success || !discoverData.suggestions?.length) {
    throw new Error("Pipeline failed at discovery step");
  }

  // Step 2: Pick best topic (highest relevance_score)
  const bestSuggestion = discoverData.suggestions.sort(
    (a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0)
  )[0];

  // Auto-approve the best suggestion
  await supabase.from("content_suggestions").update({ status: "approved" }).eq("id", bestSuggestion.id);

  const generatedContent: any[] = [];

  // Step 3: Generate visual for each platform
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    // Schedule with 1-day intervals starting tomorrow
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + i + 1);
    scheduleDate.setHours(9, 0, 0, 0);
    const scheduledAt = autoSchedule ? scheduleDate.toISOString() : null;

    try {
      const genBody = {
        suggestionId: i === 0 ? bestSuggestion.id : null, // Only link first to suggestion
        topic: bestSuggestion.topic,
        description: bestSuggestion.description,
        contentType,
        platform,
        tags: bestSuggestion.tags || [],
        scheduledAt,
      };

      const genResult = await handleGenerateVisual(supabase, supabaseAdmin, apiKey, genBody);
      const genData = await genResult.json();

      if (genData.success) {
        generatedContent.push({ platform, content: genData.content });
      }
    } catch (err) {
      console.error(`Pipeline: failed to generate for ${platform}:`, err);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      topic: bestSuggestion,
      generated: generatedContent,
      pipelineSummary: {
        topicsDiscovered: discoverData.suggestions.length,
        selectedTopic: bestSuggestion.topic,
        contentGenerated: generatedContent.length,
        platforms: platforms,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ─── REPUBLISH HANDLER ───
async function handleRepublish(supabase: any, supabaseAdmin: any, apiKey: string, body: any) {
  const { contentId, targetPlatform, targetContentType } = body;

  console.log(`Republishing content ${contentId} to ${targetPlatform} as ${targetContentType}`);

  // Get original content
  const { data: original, error: fetchError } = await supabase
    .from("content_queue")
    .select("*")
    .eq("id", contentId)
    .single();

  if (fetchError || !original) throw new Error("Original content not found");

  // Generate new visual adapted for the target platform
  const genBody = {
    suggestionId: original.suggestion_id,
    topic: original.title.replace(/ - Slide \d+$/, ""),
    description: original.text_content || original.caption || "",
    contentType: targetContentType || original.content_type,
    platform: targetPlatform,
    tags: original.hashtags?.map((h: string) => h.replace("#", "")) || [],
    scheduledAt: null,
  };

  const result = await handleGenerateVisual(supabase, supabaseAdmin, apiKey, genBody);
  const resultData = await result.json();

  return new Response(
    JSON.stringify({
      success: true,
      original: { id: original.id, platform: original.platform, title: original.title },
      republished: resultData.content,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ─── HELPERS ───
async function uploadBase64Image(supabaseAdmin: any, base64Url: string, contentType: string, platform: string, suffix = "") {
  const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const timestamp = Date.now();
  const randomId = crypto.randomUUID().substring(0, 8);
  const fileName = `visual-${contentType}-${platform}${suffix ? `-${suffix}` : ""}-${timestamp}-${randomId}.png`;

  const { error } = await supabaseAdmin.storage
    .from("blog-images")
    .upload(fileName, imageBuffer, { contentType: "image/png", upsert: false });

  if (error) throw new Error("Failed to upload image");

  const { data } = supabaseAdmin.storage.from("blog-images").getPublicUrl(fileName);
  return data.publicUrl;
}

async function generateCaptionAndHashtags(apiKey: string, topic: string, description: string, contentType: string, platform: string) {
  const captionResponse = await callAI(apiKey, {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: "You are a social media expert. Generate engaging captions and hashtags." },
      { role: "user", content: `Generate a ${platform} caption and hashtags for a ${contentType.replace("_", " ")} about "${topic}". Description: ${description || ""}` },
    ],
    tools: [{
      type: "function",
      function: {
        name: "generate_caption",
        description: "Return caption and hashtags for social media post",
        parameters: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
          },
          required: ["caption", "hashtags"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "generate_caption" } },
  });

  let caption = "";
  let hashtags: string[] = [];

  if (captionResponse.ok) {
    const captionData = await captionResponse.json();
    const captionTool = captionData.choices?.[0]?.message?.tool_calls?.[0];
    if (captionTool?.function?.arguments) {
      const parsed = JSON.parse(captionTool.function.arguments);
      caption = parsed.caption || "";
      hashtags = (parsed.hashtags || []).map((h: string) => h.startsWith("#") ? h : `#${h}`);
    }
  }

  return { caption, hashtags };
}

async function callAI(apiKey: string, body: any) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function handleAIError(response: Response) {
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
