import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Handlebars from "https://esm.sh/handlebars@4.7.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or restrict to your frontend domains
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
  return new Response("ok", {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

  try {
    const { templateId, orderId, testEmail } = await req.json();

    if (!templateId || !orderId) {
      return new Response(JSON.stringify({ error: "Missing templateId or orderId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Get template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .single();
    if (templateError || !template) throw templateError;

    // 2. Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, subtotal, discount, delivery_fee, user_id")
      .eq("id", orderId)
      .single();
    if (orderError || !order) throw orderError;

    // 3. Get customer profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();
    if (profileError || !profile) throw profileError;

    // 4. Compile template body with Handlebars
    const templateFn = Handlebars.compile(template.body);
    const body = templateFn({
      customer_name: profile.full_name,
      order_id: order.id,
      total: order.total,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_fee: order.delivery_fee,
    });

    // 5. Choose recipient
    const toEmail = testEmail || profile.email;

    // 6. Send email via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // replace with verified sender
        to: [toEmail],
        subject: template.subject,
        html: body,
      }),
    });

    const resendText = await resendRes.text();
    console.log("Resend API response:", resendText);

    if (!resendRes.ok) throw new Error(`Resend API error: ${resendText}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
