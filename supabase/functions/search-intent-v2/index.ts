// supabase/functions/search-intent-v2/index.ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

// =================================================================
// --- THE DEFINITIVE FIX: A direct, cache-busted URL import ---
// This bypasses deno.json and all caching issues completely.
// =================================================================
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0?cb=reset";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");
    
    const { query } = await req.json();
    if (!query) throw new Error("A 'query' is required.");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use a model name compatible with the specified library version
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      ## Persona & Rules
      You are a search specialist for "TAMOOR", a premium dry fruits store. Translate user queries into a JSON object.
      - Use the Store Inventory to map user terms (like "Kaju") to a specific "category".
      - If the query is specific (e.g., "roasted cashews"), use "search_term".
      - Infer intent: "cheapest" -> "sort_by": "price_asc"; "best" -> "sort_by": "popularity".
      - For irrelevant queries, return {"error": "irrelevant_query"}.
      - Your entire output MUST be a single, raw JSON object.

      ## Store Inventory
      - Categories: Almonds (Badam), Cashews (Kaju), Pistachios (Pista), Walnuts (Akhrot), Raisins (Kishmish), Figs (Anjeer), Dates (Khajoor), Premium Gift Hampers, Corporate Hampers, Festival Hampers.
      
      ## Examples
      Query: "kaju" -> Response: {"category": "Cashews (Kaju)"}
      Query: "best kashmiri akhrot" -> Response: {"search_term": "Kashmiri Walnuts", "sort_by": "popularity"}
      Query: "gifts under 2500" -> Response: {"category": "Premium Gift Hampers", "max_price": 2500}
      
      ## User's Query
      Query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(jsonString);
    
    return new Response(JSON.stringify(jsonResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("[search-intent-v2] Error:", error);
    let errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});