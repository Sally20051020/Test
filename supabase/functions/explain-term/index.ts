import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a financial education AI assistant for a robo-fintech advisor app targeting beginners aged 16-30 in Hong Kong. Your job is to explain financial terms clearly and accurately.

RULES:
- You MUST respond using the "explain_term" tool call. Never respond with plain text.
- If the user's query is in Chinese, provide all fields in Traditional Chinese (繁體中文). If in English, use English.
- The formal definition must be accurate and cite-worthy.
- The simple explanation must use everyday analogies a teenager can understand.
- The example must use real HK or US stocks (e.g., 騰訊 0700.HK, HSBC 0005.HK, Apple AAPL) with realistic numbers.
- For source, cite real sources like Investopedia, HKEX Investor Education, CFA Institute, etc. If you are uncertain, use "AI 生成，僅供參考" or "AI-generated, for reference only".
- Provide 3 related terms that a beginner should learn next, in the same language as the response.
- NEVER fabricate statistics or specific financial data. Use approximate or illustrative figures.
- Keep the tone friendly, educational, and encouraging.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { term, lang } = await req.json();

    if (!term || typeof term !== "string" || term.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "term is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (term.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: "term too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langInstruction = lang === "zh"
      ? "The user is asking in Chinese. Respond entirely in Simplified Chinese (简体中文). Do NOT use any Traditional Chinese characters."
      : lang === "zh-TW"
      ? "The user is asking in Chinese. Respond entirely in Traditional Chinese (繁體中文). Do NOT use any Simplified Chinese characters."
      : "The user is asking in English. Respond entirely in English.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${langInstruction}\n\nExplain this financial term: "${term.trim()}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "explain_term",
              description: "Return a structured financial term explanation",
              parameters: {
                type: "object",
                properties: {
                  term: { type: "string", description: "The canonical name of the term" },
                  formalDefinition: { type: "string", description: "Accurate formal definition (2-3 sentences)" },
                  simpleExplanation: { type: "string", description: "Beginner-friendly explanation with analogy (1-2 sentences)" },
                  example: { type: "string", description: "Real-world example using HK/US stocks with numbers" },
                  source: { type: "string", description: "Reference source (e.g. Investopedia, HKEX)" },
                  relatedTerms: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 related terms for further learning",
                  },
                },
                required: ["term", "formalDefinition", "simpleExplanation", "example", "source", "relatedTerms"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "explain_term" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("explain-term error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
