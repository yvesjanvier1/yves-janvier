import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TECH_TOPICS = [
  "artificial intelligence and machine learning",
  "web development trends",
  "cloud computing and DevOps",
  "cybersecurity best practices",
  "mobile app development",
  "blockchain and Web3",
  "data science and analytics",
  "software architecture patterns",
  "programming languages updates",
  "tech industry news and innovations"
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, customTopic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const selectedTopic = customTopic || topic || TECH_TOPICS[Math.floor(Math.random() * TECH_TOPICS.length)];
    
    console.log(`Generating article for topic: ${selectedTopic}`);

    const systemPrompt = `You are an expert technology writer who creates engaging, informative blog posts. 
Your writing style is professional yet accessible, with practical insights and examples.
Focus on current trends and actionable advice. Write in a way that appeals to both technical and non-technical readers.
Always structure your articles with clear headings and sections.`;

    const userPrompt = `Write a comprehensive blog article about "${selectedTopic}" for a technology-focused blog.

The article should include:
1. An engaging introduction that hooks the reader
2. 3-5 main sections with H2 headings covering key aspects of the topic
3. Practical examples or use cases where relevant
4. A conclusion with key takeaways

Format the content in HTML with proper semantic tags (h2, h3, p, ul, li, strong, em).
Keep the total length between 800-1200 words.

Also provide:
- A compelling title (max 60 characters)
- A brief excerpt/summary (max 160 characters)
- 3-5 relevant tags

Respond in this exact JSON format:
{
  "title": "Article title here",
  "excerpt": "Brief summary here",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
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
      throw new Error("Failed to generate article");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      throw new Error("No content generated");
    }

    console.log("Raw AI response:", content.substring(0, 200));

    // Parse the JSON response from the AI
    let articleData;
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      articleData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: create structured response from raw content
      articleData = {
        title: `Latest in ${selectedTopic}`,
        excerpt: `Explore the latest developments in ${selectedTopic} and what it means for the future.`,
        content: `<p>${content.replace(/\n\n/g, '</p><p>')}</p>`,
        tags: [selectedTopic.split(' ')[0], 'technology', 'trends']
      };
    }

    console.log("Successfully generated article:", articleData.title);

    return new Response(JSON.stringify({
      success: true,
      article: articleData,
      topic: selectedTopic
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating article:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate article" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
