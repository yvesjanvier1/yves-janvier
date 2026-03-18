import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── FRENCH QUALITY SYSTEM PROMPT (shared across all generation) ───
const FRENCH_QUALITY_RULES = `
RÈGLES LINGUISTIQUES STRICTES — FRANÇAIS :
1. Grammaire : respecte les accords complexes (participes passés, subjonctif, concordance des temps). Aucune faute tolérée.
2. Ponctuation française : espace insécable AVANT les signes doubles ( ; : ! ? « » ) et après « et avant ».
3. Typographie : utilise les guillemets français « … » et non "…". Tirets cadratins — pour les incises.
4. Ton : professionnel, expert tech, assertif mais accessible. Évite le langage familier ou les anglicismes inutiles.
5. Orthographe : vérifie chaque mot. Aucune faute de frappe. Attention aux accents (é, è, ê, ë, à, ù, ç, ô, î, û).
6. Texte sur visuels : le texte incrusté dans les images (quote cards, infographies) doit être COURT, COMPLET (jamais tronqué), et parfaitement orthographié. Maximum 15 mots par ligne, 4 lignes maximum.
7. Concision : privilégie des phrases percutantes et bien construites plutôt que des phrases longues.
`;

const SOCIAL_MEDIA_SYSTEM_PROMPT = `Tu es un expert en réseaux sociaux et marketing de contenu francophone. ${FRENCH_QUALITY_RULES}
Génère des textes engageants, professionnels et sans aucune faute.`;

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

  const systemPrompt = `Tu es un stratège de contenu expert et analyste de tendances. ${FRENCH_QUALITY_RULES}
Ton travail est de découvrir les sujets les plus pertinents, tendance et éducatifs pour un blog couvrant plusieurs domaines. Considère :
- Les tendances actuelles et ce que les gens recherchent
- La valeur éducative et le potentiel d'engagement
- Les sujets qui fonctionnent bien sur plusieurs plateformes (blog, Instagram, LinkedIn, WhatsApp)
- Le contenu réutilisable en formats visuels (quote cards, infographies, carrousels)

Le blog couvre déjà ces tags : ${existingTags || "divers sujets"}
Articles récents : ${existingTitles}

Évite de suggérer des sujets trop similaires au contenu existant.`;

  const userPrompt = `Suggère ${count || 5} sujets de contenu frais et tendance${niche ? ` centrés sur "${niche}"` : " couvrant divers domaines"}.

Pour chaque sujet, fournis :
1. Un titre de sujet accrocheur (en français impeccable)
2. Une brève description (2-3 phrases) expliquant pourquoi ce sujet est pertinent maintenant
3. Un score de pertinence (1-100) basé sur le potentiel tendance et l'intérêt du public
4. Une catégorie (ex : "Technologie", "Business", "Développement Personnel", "Marketing", "Design", "Santé", "Finance")
5. Des tags suggérés (3-5 tags pertinents, en français)
6. Les plateformes idéales (blog, instagram, linkedin, whatsapp)`;

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
    instagram: "Format carré (1080x1080). Audacieux, vibrant, accrocheur au défilement. Texte large et lisible. Couleurs de marque.",
    linkedin: "Format paysage (1200x627). Professionnel, épuré, adapté au monde corporate. Dégradés subtils.",
    whatsapp: "Format carré (800x800). Simple, fort contraste, lisible en petit. Texte minimal.",
  };

  const contentTypePrompts: Record<string, string> = {
    quote_card: `Crée une image de carte de citation professionnelle avec une citation inspirante ou éducative sur « ${topic} ». Inclus :
- Une citation percutante d'UNE LIGNE maximum (en français parfait, sans faute) liée au sujet
- Typographie moderne et épurée avec le texte de la citation bien visible
- Un espace subtil en bas pour un nom/handle
- Arrière-plan visuellement attrayant (dégradé, motif abstrait ou texture subtile)
- IMPORTANT : le texte NE DOIT PAS être tronqué — tout le texte doit être entièrement visible et lisible
- ${platformSpecs[platform] || platformSpecs.instagram}
N'inclus aucun nom réel. La citation doit être une sagesse générique sur le sujet. Tout le texte DOIT être en français correct.`,

    infographic: `Crée une image de style infographie épurée sur « ${topic} ». Inclus :
- Un titre clair en haut (en français, maximum 8 mots)
- 3-5 points clés ou faits visualisés avec icônes et texte court (chaque texte en français parfait)
- Mise en page propre avec sections clairement séparées
- Palette de couleurs professionnelle avec bon contraste
- IMPORTANT : tout le texte doit être COMPLET, jamais tronqué, et en français impeccable
- ${platformSpecs[platform] || platformSpecs.instagram}
Utilise des chiffres/statistiques réalistes. Concentre-toi sur la clarté visuelle.`,

    carousel: `Crée UNE diapositive pour un post carrousel sur « ${topic} ». Ceci doit être la diapositive TITRE/COUVERTURE. Inclus :
- Un titre accrocheur et audacieux (en français, maximum 8 mots, sans faute)
- Un sous-titre ou accroche qui donne envie de swiper
- Éléments visuels (icônes, formes, motifs) suggérant qu'il y a plus de contenu
- Indicateur « Swipe → »
- IMPORTANT : tout le texte doit être COMPLET et en français correct
- ${platformSpecs[platform] || platformSpecs.instagram}
Rends-le audacieux et engageant pour encourager le swipe.`,
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

  // AI proofreading step
  const proofreadCaption = await proofreadFrenchText(apiKey, caption);

  const { data: saved, error: saveError } = await supabase
    .from("content_queue")
    .insert({
      suggestion_id: suggestionId || null,
      title: topic,
      content_type: contentType,
      platform,
      image_url: publicUrl,
      text_content: description || "",
      caption: proofreadCaption,
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
    ? "Format paysage (1200x627). Professionnel, épuré."
    : "Format carré (1080x1080). Audacieux, vibrant.";

  const carouselGroupId = crypto.randomUUID();
  const slides: any[] = [];

  const planResponse = await callAI(apiKey, {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: `Tu es un expert en carrousels pour réseaux sociaux. Planifie un contenu concis par diapositive. ${FRENCH_QUALITY_RULES}` },
      { role: "user", content: `Planifie un carrousel de ${slideCount} diapositives sur « ${topic} ». ${description || ""}\n\nPour chaque diapositive, fournis un titre court (max 8 mots, en français impeccable) et un point clé (max 20 mots, en français parfait). La diapositive 1 est la couverture, la dernière est le CTA.` },
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

    let slidePrompt = `Crée la diapositive ${i + 1} sur ${slidePlan.length} pour un post carrousel sur « ${topic} ». ${platformSpec}\n`;

    if (isFirst) {
      slidePrompt += `Ceci est la diapositive COUVERTURE. Titre : « ${slide.title} ». Ajoute un indicateur « Swipe → ». Rends-la audacieuse et accrocheuse. Tout le texte en français parfait, JAMAIS tronqué.`;
    } else if (isLast) {
      slidePrompt += `Ceci est la diapositive CTA/FERMETURE. Titre : « ${slide.title} ». Point clé : « ${slide.key_point} ». Inclus un appel à l'action comme « Suivez pour plus » ou « Enregistrez ce post ». Texte en français, complet et sans faute.`;
    } else {
      slidePrompt += `Diapositive de contenu. Titre : « ${slide.title} ». Point clé : « ${slide.key_point} ». Style visuel cohérent avec les autres. Numéro « ${i + 1}/${slidePlan.length} » dans un coin. Texte en français, COMPLET et sans faute.`;
    }

    slidePrompt += `\nGarde un style visuel cohérent sur toutes les diapositives. Même palette de couleurs et typographie. IMPORTANT : tout texte incrusté doit être en français impeccable et ne JAMAIS être tronqué.`;

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

  // AI proofreading step
  const proofreadCaption = await proofreadFrenchText(apiKey, caption);

  const insertData = slides.map((slide) => ({
    suggestion_id: suggestionId || null,
    title: `${topic} - Slide ${slide.slide_number}`,
    content_type: "carousel",
    platform,
    image_url: slide.image_url,
    text_content: `${slide.title}: ${slide.key_point}`,
    caption: slide.slide_number === 1 ? proofreadCaption : null,
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

  // Compute a SINGLE scheduled_at for all platforms (synchronized)
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 1); // tomorrow
  scheduleDate.setHours(9, 0, 0, 0);
  const syncScheduledAt = autoSchedule ? scheduleDate.toISOString() : null;

  // Step 3: Generate visual for each platform — ALL get the SAME scheduled_at
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];

    try {
      const genBody = {
        suggestionId: i === 0 ? bestSuggestion.id : null,
        topic: bestSuggestion.topic,
        description: bestSuggestion.description,
        contentType,
        platform,
        tags: bestSuggestion.tags || [],
        scheduledAt: syncScheduledAt,
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
        synchronizedSchedule: syncScheduledAt,
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

// ─── AI PROOFREADING ───
async function proofreadFrenchText(apiKey: string, text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  try {
    const response = await callAI(apiKey, {
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `Tu es un correcteur professionnel de langue française. Ta SEULE tâche est de corriger les fautes d'orthographe, de grammaire, de ponctuation et de typographie dans le texte fourni.
Règles :
- Corrige les fautes de frappe et d'orthographe
- Assure la ponctuation française correcte (espaces insécables avant ; : ! ?)
- Utilise les guillemets français « … »
- NE MODIFIE PAS le sens, le ton ou la structure du texte
- NE RAJOUTE PAS de contenu
- Retourne UNIQUEMENT le texte corrigé, rien d'autre`,
        },
        { role: "user", content: text },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_proofread_text",
          description: "Return the proofread text",
          parameters: {
            type: "object",
            properties: {
              corrected_text: { type: "string" },
              had_errors: { type: "boolean" },
            },
            required: ["corrected_text", "had_errors"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_proofread_text" } },
    });

    if (!response.ok) {
      console.error("Proofreading failed, returning original text");
      return text;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return text;

    const parsed = JSON.parse(toolCall.function.arguments);
    if (parsed.had_errors) {
      console.log("Proofreading corrected errors in caption");
    }
    return parsed.corrected_text || text;
  } catch (err) {
    console.error("Proofreading error:", err);
    return text;
  }
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
      { role: "system", content: SOCIAL_MEDIA_SYSTEM_PROMPT },
      { role: "user", content: `Génère une légende ${platform} et des hashtags pour un(e) ${contentType.replace("_", " ")} sur « ${topic} ». Description : ${description || ""}
      
Règles pour la légende :
- En français impeccable, ton professionnel d'expert tech
- Ponctuation française correcte (espaces insécables avant ; : ! ?)
- Guillemets français « … »
- Engageante et incitant à l'interaction
- Adaptée à ${platform}` },
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
