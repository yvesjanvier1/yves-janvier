import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── FRENCH QUALITY SYSTEM PROMPT ───
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

const VISUAL_TEXT_QC_PROMPT = `CONTRÔLE QUALITÉ OBLIGATOIRE POUR TEXTE VISUEL :
Toute citation ou texte destiné à une quote card ou une infographie doit être vérifié par un module de correction grammaticale interne avant d'être envoyé au moteur de rendu.
Respectez les règles d'accord, les majuscules et la ponctuation française (notamment l'espace insécable avant les deux points et points d'exclamation).
Le texte doit être auto-suffisant : chaque mot doit être complet, aucune troncature, aucune coupure illogique.
Vérifiez que chaque ligne fait maximum 15 mots et que le texte total ne dépasse pas 4 lignes.`;

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

// ─── STEP 1: AI GENERATES STRUCTURED TEXT FOR VISUAL ───
async function generateVisualText(apiKey: string, topic: string, description: string, contentType: string, platform: string): Promise<{
  lines: string[];
  subtitle?: string;
  attribution?: string;
  keyPoints?: { icon: string; text: string }[];
}> {
  const contentTypeInstructions: Record<string, string> = {
    quote_card: `Génère une CITATION inspirante ou éducative sur « ${topic} ».
Retourne :
- lines : un tableau de 1 à 3 lignes de texte. Chaque ligne fait maximum 12 mots. La citation doit être percutante et complète.
- attribution : un court crédit (ex : "— Sagesse tech", "— Conseil pro"). Pas de nom réel.
- subtitle : null`,
    infographic: `Génère le CONTENU TEXTUEL d'une infographie sur « ${topic} ».
Retourne :
- lines : un tableau contenant le titre principal (max 8 mots) comme premier élément.
- keyPoints : un tableau de 3-5 objets { icon: (un emoji pertinent), text: (max 15 mots, un fait ou chiffre clé) }.
- attribution : null
- subtitle : un sous-titre optionnel (max 10 mots)`,
    carousel: `Génère le TEXTE DE COUVERTURE d'un carrousel sur « ${topic} ».
Retourne :
- lines : un tableau contenant le titre accrocheur (max 8 mots).
- subtitle : une accroche qui donne envie de swiper (max 12 mots).
- attribution : null`,
  };

  const response = await callAI(apiKey, {
    model: "google/gemini-3-flash-preview",
    messages: [
      {
        role: "system",
        content: `Tu es un rédacteur expert en contenu visuel pour réseaux sociaux. ${FRENCH_QUALITY_RULES}
${VISUAL_TEXT_QC_PROMPT}
Tu génères UNIQUEMENT le texte qui sera incrusté programmatiquement sur une image. Le texte doit être PARFAIT car il sera rendu tel quel.`,
      },
      { role: "user", content: contentTypeInstructions[contentType] || contentTypeInstructions.quote_card },
    ],
    tools: [{
      type: "function",
      function: {
        name: "return_visual_text",
        description: "Return structured text for visual overlay",
        parameters: {
          type: "object",
          properties: {
            lines: { type: "array", items: { type: "string" } },
            subtitle: { type: "string" },
            attribution: { type: "string" },
            keyPoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  icon: { type: "string" },
                  text: { type: "string" },
                },
                required: ["icon", "text"],
                additionalProperties: false,
              },
            },
          },
          required: ["lines"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "return_visual_text" } },
  });

  if (!response.ok) throw new Error("Failed to generate visual text");

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) throw new Error("Invalid visual text response");

  const parsed = JSON.parse(toolCall.function.arguments);

  // Proofread each line
  const proofreadLines: string[] = [];
  for (const line of parsed.lines) {
    const corrected = await proofreadFrenchText(apiKey, line);
    proofreadLines.push(corrected);
  }

  // Proofread subtitle and attribution if present
  let subtitle = parsed.subtitle || undefined;
  let attribution = parsed.attribution || undefined;
  if (subtitle) subtitle = await proofreadFrenchText(apiKey, subtitle);
  if (attribution) attribution = await proofreadFrenchText(apiKey, attribution);

  // Proofread key points
  let keyPoints = parsed.keyPoints || undefined;
  if (keyPoints) {
    for (let i = 0; i < keyPoints.length; i++) {
      keyPoints[i].text = await proofreadFrenchText(apiKey, keyPoints[i].text);
    }
  }

  return { lines: proofreadLines, subtitle, attribution, keyPoints };
}

// ─── STEP 2: GENERATE BACKGROUND IMAGE (NO TEXT) ───
async function generateBackgroundImage(apiKey: string, topic: string, contentType: string, platform: string): Promise<string> {
  const platformDims: Record<string, string> = {
    instagram: "carré (1080x1080)",
    linkedin: "paysage (1200x627)",
    whatsapp: "carré (800x800)",
  };

  const bgPrompts: Record<string, string> = {
    quote_card: `Crée un arrière-plan visuel SANS AUCUN TEXTE pour une carte de citation sur « ${topic} ». 
Style : dégradé moderne, motifs géométriques subtils ou texture abstraite. Couleurs professionnelles (bleu, violet, sarcelle). 
Format ${platformDims[platform] || platformDims.instagram}.
IMPORTANT : NE PAS inclure de texte, lettres, mots ou caractères dans l'image. Uniquement un fond visuel esthétique.`,
    infographic: `Crée un arrière-plan visuel SANS AUCUN TEXTE pour une infographie sur « ${topic} ».
Style : fond clair avec zones délimitées pour du contenu, look professionnel et épuré.
Format ${platformDims[platform] || platformDims.instagram}.
IMPORTANT : NE PAS inclure de texte, lettres, mots ou caractères. Uniquement le fond graphique avec des zones vides pour le texte.`,
    carousel: `Crée un arrière-plan visuel SANS AUCUN TEXTE pour une diapositive de couverture de carrousel sur « ${topic} ».
Style : audacieux, vibrant, moderne. Éléments graphiques dynamiques.
Format ${platformDims[platform] || platformDims.instagram}.
IMPORTANT : NE PAS inclure de texte, lettres, mots ou caractères. Uniquement le fond graphique.`,
  };

  const response = await callAI(apiKey, {
    model: "google/gemini-2.5-flash-image",
    messages: [{ role: "user", content: bgPrompts[contentType] || bgPrompts.quote_card }],
    modalities: ["image", "text"],
  });

  if (!response.ok) throw new Error("Failed to generate background image");

  const data = await response.json();
  const base64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!base64Url) throw new Error("No background image generated");

  return base64Url;
}

// ─── STEP 3: PROGRAMMATIC TEXT OVERLAY VIA CANVAS ───
function getDimensions(platform: string): { width: number; height: number } {
  switch (platform) {
    case "linkedin": return { width: 1200, height: 627 };
    case "whatsapp": return { width: 800, height: 800 };
    case "instagram":
    default: return { width: 1080, height: 1080 };
  }
}

async function overlayTextOnImage(
  base64Background: string,
  visualText: {
    lines: string[];
    subtitle?: string;
    attribution?: string;
    keyPoints?: { icon: string; text: string }[];
  },
  contentType: string,
  platform: string
): Promise<Uint8Array> {
  const { width, height } = getDimensions(platform);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw background image
  try {
    const bgData = base64Background.replace(/^data:image\/\w+;base64,/, "");
    const bgBuffer = Uint8Array.from(atob(bgData), (c) => c.charCodeAt(0));
    const bgImage = await loadImage(bgBuffer);
    ctx.drawImage(bgImage, 0, 0, width, height);
  } catch (err) {
    console.error("Failed to load background, using gradient fallback:", err);
    // Fallback gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Semi-transparent overlay for text readability
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, width, height);

  const margin = Math.round(width * 0.08);
  const textAreaWidth = width - margin * 2;

  if (contentType === "quote_card") {
    renderQuoteCard(ctx, visualText, width, height, margin, textAreaWidth);
  } else if (contentType === "infographic") {
    renderInfographic(ctx, visualText, width, height, margin, textAreaWidth);
  } else {
    // carousel cover
    renderCarouselCover(ctx, visualText, width, height, margin, textAreaWidth);
  }

  return canvas.toBuffer("image/png");
}

function renderQuoteCard(
  ctx: any, text: { lines: string[]; subtitle?: string; attribution?: string },
  width: number, height: number, margin: number, textAreaWidth: number
) {
  // Decorative quote mark
  const quoteSize = Math.round(width * 0.12);
  ctx.font = `bold ${quoteSize}px serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.fillText("«", margin, margin + quoteSize);

  // Main quote lines
  const fontSize = Math.round(width * 0.045);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";

  const lineHeight = fontSize * 1.5;
  const totalTextHeight = text.lines.length * lineHeight;
  let startY = (height - totalTextHeight) / 2;

  for (const line of text.lines) {
    const wrappedLines = wrapText(ctx, line, textAreaWidth);
    for (const wl of wrappedLines) {
      ctx.fillText(wl, width / 2, startY);
      startY += lineHeight;
    }
  }

  // Attribution
  if (text.attribution) {
    const attrSize = Math.round(fontSize * 0.6);
    ctx.font = `italic ${attrSize}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(text.attribution, width / 2, startY + lineHeight * 0.8);
  }

  // Closing quote mark
  ctx.font = `bold ${quoteSize}px serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.textAlign = "right";
  ctx.fillText("»", width - margin, height - margin);
  ctx.textAlign = "left";
}

function renderInfographic(
  ctx: any, text: { lines: string[]; subtitle?: string; keyPoints?: { icon: string; text: string }[] },
  width: number, height: number, margin: number, textAreaWidth: number
) {
  // Title
  const titleSize = Math.round(width * 0.05);
  ctx.font = `bold ${titleSize}px sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  const title = text.lines[0] || "";
  ctx.fillText(title, width / 2, margin + titleSize + 10);

  // Subtitle
  let currentY = margin + titleSize + 20;
  if (text.subtitle) {
    const subSize = Math.round(titleSize * 0.6);
    ctx.font = `${subSize}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    currentY += subSize + 10;
    ctx.fillText(text.subtitle, width / 2, currentY);
  }

  // Divider
  currentY += 30;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, currentY);
  ctx.lineTo(width - margin, currentY);
  ctx.stroke();
  currentY += 30;

  // Key points
  if (text.keyPoints && text.keyPoints.length > 0) {
    const pointSize = Math.round(width * 0.032);
    const pointHeight = (height - currentY - margin) / text.keyPoints.length;

    ctx.textAlign = "left";
    for (const kp of text.keyPoints) {
      // Icon
      ctx.font = `${Math.round(pointSize * 1.4)}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(kp.icon, margin + 10, currentY + pointSize);

      // Text
      ctx.font = `${pointSize}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      const iconWidth = Math.round(pointSize * 2);
      const wrappedLines = wrapText(ctx, kp.text, textAreaWidth - iconWidth);
      for (const wl of wrappedLines) {
        ctx.fillText(wl, margin + iconWidth + 10, currentY + pointSize);
        currentY += pointSize * 1.4;
      }
      currentY += Math.max(0, pointHeight - pointSize * 1.4 * 2);
    }
  }
}

function renderCarouselCover(
  ctx: any, text: { lines: string[]; subtitle?: string },
  width: number, height: number, margin: number, textAreaWidth: number
) {
  // Title
  const titleSize = Math.round(width * 0.06);
  ctx.font = `bold ${titleSize}px sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";

  const title = text.lines[0] || "";
  const wrappedTitle = wrapText(ctx, title, textAreaWidth);
  const lineHeight = titleSize * 1.4;
  let startY = height * 0.35;

  for (const line of wrappedTitle) {
    ctx.fillText(line, width / 2, startY);
    startY += lineHeight;
  }

  // Subtitle
  if (text.subtitle) {
    const subSize = Math.round(titleSize * 0.55);
    ctx.font = `${subSize}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    startY += 15;
    const wrappedSub = wrapText(ctx, text.subtitle, textAreaWidth);
    for (const line of wrappedSub) {
      ctx.fillText(line, width / 2, startY);
      startY += subSize * 1.4;
    }
  }

  // Swipe indicator
  const swipeSize = Math.round(width * 0.03);
  ctx.font = `${swipeSize}px sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText("Swipe →", width / 2, height - margin);
}

// ─── TEXT WRAPPING UTILITY ───
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ─── VALIDATION: CHECK NO WORDS ARE TRUNCATED ───
function validateTextNotTruncated(
  ctx: any,
  visualText: { lines: string[]; subtitle?: string; attribution?: string; keyPoints?: { icon: string; text: string }[] },
  maxWidth: number
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  const checkLine = (text: string, label: string) => {
    // Check for common truncation patterns
    if (text.endsWith("...") || text.endsWith("…")) {
      issues.push(`${label} semble tronqué : "${text}"`);
    }
    // Check for words cut mid-syllable (ending with hyphen not part of compound words)
    if (/[a-zàâäéèêëïîôùûüÿç]-$/i.test(text) && !/(peut-être|c'est-à-dire|au-dessus|au-dessous|vis-à-vis)/i.test(text)) {
      issues.push(`${label} contient un mot coupé : "${text}"`);
    }
    // Check for incomplete sentences (ending with comma or conjunction)
    if (/[,\s](et|ou|mais|donc|car|ni|or)\s*$/i.test(text)) {
      issues.push(`${label} semble incomplet : "${text}"`);
    }
  };

  for (let i = 0; i < visualText.lines.length; i++) {
    checkLine(visualText.lines[i], `Ligne ${i + 1}`);
  }
  if (visualText.subtitle) checkLine(visualText.subtitle, "Sous-titre");
  if (visualText.attribution) checkLine(visualText.attribution, "Attribution");
  if (visualText.keyPoints) {
    for (let i = 0; i < visualText.keyPoints.length; i++) {
      checkLine(visualText.keyPoints[i].text, `Point clé ${i + 1}`);
    }
  }

  return { valid: issues.length === 0, issues };
}

// ─── GENERATE VISUAL HANDLER (REFACTORED: TEXT → BG → OVERLAY) ───
async function handleGenerateVisual(supabase: any, supabaseAdmin: any, apiKey: string, body: any) {
  const { suggestionId, topic, description, contentType, platform, tags, scheduledAt } = body;

  console.log(`Generating visual (text-first pipeline): type=${contentType}, platform=${platform}, topic=${topic}`);

  // PHASE 1: Generate structured text via AI (with proofreading)
  console.log("Phase 1: Generating and proofreading visual text...");
  const visualText = await generateVisualText(apiKey, topic, description || "", contentType, platform);
  console.log("Visual text generated:", JSON.stringify(visualText).substring(0, 200));

  // PHASE 2: Validate text is not truncated
  console.log("Phase 2: Validating text integrity...");
  const { width } = getDimensions(platform);
  const tempCanvas = createCanvas(width, 100);
  const tempCtx = tempCanvas.getContext("2d");
  const fontSize = Math.round(width * 0.045);
  tempCtx.font = `bold ${fontSize}px sans-serif`;
  const margin = Math.round(width * 0.08);
  const textAreaWidth = width - margin * 2;

  const validation = validateTextNotTruncated(tempCtx, visualText, textAreaWidth);
  if (!validation.valid) {
    console.warn("Text validation issues found:", validation.issues);
    // Auto-fix: regenerate text if truncation detected
    console.log("Regenerating text to fix truncation...");
    const fixedText = await generateVisualText(apiKey, topic, description || "", contentType, platform);
    const revalidation = validateTextNotTruncated(tempCtx, fixedText, textAreaWidth);
    if (revalidation.valid) {
      Object.assign(visualText, fixedText);
      console.log("Text fixed successfully after regeneration.");
    } else {
      console.warn("Text still has issues after regeneration, proceeding anyway:", revalidation.issues);
      Object.assign(visualText, fixedText);
    }
  } else {
    console.log("Text validation passed.");
  }

  // PHASE 3: Generate background image (NO TEXT in image)
  console.log("Phase 3: Generating background image...");
  const base64Background = await generateBackgroundImage(apiKey, topic, contentType, platform);

  // PHASE 4: Programmatically overlay text on background
  console.log("Phase 4: Overlaying text on background...");
  const compositeBuffer = await overlayTextOnImage(base64Background, visualText, contentType, platform);

  // PHASE 5: Upload composite image
  console.log("Phase 5: Uploading final composite image...");
  const publicUrl = await uploadImageBuffer(supabaseAdmin, compositeBuffer, contentType, platform);

  // Generate caption and hashtags (separate from image text)
  const { caption, hashtags } = await generateCaptionAndHashtags(apiKey, topic, description, contentType, platform);
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

  console.log(`Generating ${slideCount}-slide carousel (text-first): platform=${platform}, topic=${topic}`);

  const carouselGroupId = crypto.randomUUID();
  const slides: any[] = [];

  // Plan carousel slides via text AI
  const planResponse = await callAI(apiKey, {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: `Tu es un expert en carrousels pour réseaux sociaux. Planifie un contenu concis par diapositive. ${FRENCH_QUALITY_RULES} ${VISUAL_TEXT_QC_PROMPT}` },
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

  // Proofread each slide's text
  for (let i = 0; i < slidePlan.length; i++) {
    slidePlan[i].title = await proofreadFrenchText(apiKey, slidePlan[i].title);
    slidePlan[i].key_point = await proofreadFrenchText(apiKey, slidePlan[i].key_point);
  }

  for (let i = 0; i < slidePlan.length; i++) {
    const slide = slidePlan[i];
    const isFirst = i === 0;
    const isLast = i === slidePlan.length - 1;

    try {
      // Generate background (no text)
      const bgPrompt = isFirst
        ? `Arrière-plan SANS TEXTE pour une couverture de carrousel sur « ${topic} ». Style audacieux, vibrant, accrocheur. Format ${platform === "linkedin" ? "paysage 1200x627" : "carré 1080x1080"}. AUCUN TEXTE dans l'image.`
        : isLast
        ? `Arrière-plan SANS TEXTE pour un CTA de carrousel. Style professionnel, invitant. Format ${platform === "linkedin" ? "paysage 1200x627" : "carré 1080x1080"}. AUCUN TEXTE dans l'image.`
        : `Arrière-plan SANS TEXTE pour diapositive ${i + 1} d'un carrousel sur « ${topic} ». Style cohérent, professionnel. Format ${platform === "linkedin" ? "paysage 1200x627" : "carré 1080x1080"}. AUCUN TEXTE dans l'image.`;

      const imgResp = await callAI(apiKey, {
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: bgPrompt }],
        modalities: ["image", "text"],
      });

      if (!imgResp.ok) {
        console.error(`Failed to generate slide ${i + 1} background`);
        continue;
      }

      const imgData = await imgResp.json();
      const b64 = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!b64) continue;

      // Build text for this slide
      const slideLines = [slide.title];
      const slideSubtitle = isFirst ? "Swipe →" : isLast ? slide.key_point : slide.key_point;
      const slideAttribution = !isFirst && !isLast ? `${i + 1}/${slidePlan.length}` : undefined;

      const slideText = {
        lines: slideLines,
        subtitle: slideSubtitle,
        attribution: slideAttribution,
      };

      // Overlay text on background
      const compositeBuffer = await overlayTextOnImage(b64, slideText, "carousel", platform);
      const url = await uploadImageBuffer(supabaseAdmin, compositeBuffer, "carousel", platform, `slide${i + 1}`);

      slides.push({ ...slide, image_url: url, slide_number: i + 1 });
    } catch (err) {
      console.error(`Failed to generate carousel slide ${i + 1}:`, err);
    }
  }

  if (slides.length === 0) throw new Error("Failed to generate any carousel slides");

  const { caption, hashtags } = await generateCaptionAndHashtags(apiKey, topic, description, "carousel", platform);
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

  const discoverResult = await handleDiscover(supabase, apiKey, { niche, count: 3 });
  const discoverData = await discoverResult.json();

  if (!discoverData.success || !discoverData.suggestions?.length) {
    throw new Error("Pipeline failed at discovery step");
  }

  const bestSuggestion = discoverData.suggestions.sort(
    (a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0)
  )[0];

  await supabase.from("content_suggestions").update({ status: "approved" }).eq("id", bestSuggestion.id);

  const generatedContent: any[] = [];

  // Synchronized schedule for all platforms
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 1);
  scheduleDate.setHours(9, 0, 0, 0);
  const syncScheduledAt = autoSchedule ? scheduleDate.toISOString() : null;

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

  const { data: original, error: fetchError } = await supabase
    .from("content_queue")
    .select("*")
    .eq("id", contentId)
    .single();

  if (fetchError || !original) throw new Error("Original content not found");

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
      console.log("Proofreading corrected errors in text");
    }
    return parsed.corrected_text || text;
  } catch (err) {
    console.error("Proofreading error:", err);
    return text;
  }
}

// ─── HELPERS ───
async function uploadImageBuffer(supabaseAdmin: any, imageBuffer: Uint8Array, contentType: string, platform: string, suffix = "") {
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
