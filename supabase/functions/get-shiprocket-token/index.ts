import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    // 1. Fetch existing token (id = 1)
    const { data: settings, error: fetchError } = await supabase.from("shipping_settings").select("shiprocket_token, shiprocket_token_expiry").eq("id", 1).single();
    if (fetchError) {
      console.error("[get-shiprocket-token] Fetch error:", fetchError);
    }
    const now = new Date();
    // 2. Return cached token if valid
    if (settings?.shiprocket_token && settings?.shiprocket_token_expiry && new Date(settings.shiprocket_token_expiry) > now) {
      console.log("[get-shiprocket-token] Using cached token ✅");
      return new Response(JSON.stringify({
        token: settings.shiprocket_token
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 3. Otherwise fetch new token
    console.log("[get-shiprocket-token] Refreshing token...");
    const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: Deno.env.get("SHIPROCKET_EMAIL"),
        password: Deno.env.get("SHIPROCKET_PASSWORD")
      })
    });
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error("Failed to fetch Shiprocket token: " + errText);
    }
    const loginData = await loginRes.json();
    const newToken = loginData.token;
    // Set expiry (~9 days)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 9);
    // 4. Update row id=1 (don’t touch identity column)
    const { error: updateError } = await supabase.from("shipping_settings").update({
      shiprocket_token: newToken,
      shiprocket_token_expiry: expiry.toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", 1);
    if (updateError) {
      console.error("[get-shiprocket-token] Failed to update token:", updateError);
    } else {
      console.log("[get-shiprocket-token] New token saved ✅");
    }
    return new Response(JSON.stringify({
      token: newToken
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("[get-shiprocket-token] Unexpected error:", err);
    return new Response(JSON.stringify({
      error: String(err)
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
