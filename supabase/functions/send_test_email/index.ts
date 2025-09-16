import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Handlebars from "https://esm.sh/handlebars@4.7.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // ✅ Only read JSON once
    const { templateId, orderId, mode, testEmail } = await req.json();

    if (!templateId || !orderId) {
      return new Response(JSON.stringify({ error: "Missing templateId or orderId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1️⃣ Get template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .single();
    if (templateError || !template) throw templateError;

    // 2️⃣ Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, subtotal, discount, delivery_fee, user_id")
      .eq("id", orderId)
      .single();
    if (orderError || !order) throw orderError;

    // 3️⃣ Get customer profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();
    if (profileError || !profile) throw profileError;

    // 4️⃣ Compile template
    const templateFn = Handlebars.compile(template.body);
    const body = templateFn({
      customer_name: profile.full_name,
      order_id: order.id,
      total: order.total,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_fee: order.delivery_fee,
    });

    // 5️⃣ Send email
    const toEmail = testEmail || profile.email;
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [toEmail],
        subject: template.subject,
        html: body,
      }),
    });

    const resendText = await resendRes.text();
    console.log("Resend API response:", resendText);
    if (!resendRes.ok) throw new Error(`Resend API error: ${resendText}`);

    return new Response(JSON.stringify({ success: true, sentTo: toEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
