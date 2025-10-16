// supabase\functions\send-confirmation-email\index.ts
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
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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
    const { orderId, testEmail } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "OrderId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Get order + profile
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, placed_at, user_id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) throw orderError || new Error("Order not found");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", order.user_id)
      .single();

    if (profileError || !profile) {
      throw profileError || new Error("Profile not found");
    }

    // 2. Fetch active confirmation template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, body, banner_url")
      .eq("type", "order_confirmation")
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      throw templateError || new Error("Active template not found");
    }

    // 3. Compile Handlebars template
    const compiled = Handlebars.compile(template.body);
    const html = compiled({
      customer_name: profile.full_name,
      order_id: order.id,
      order_total: order.total,
      order_date: order.placed_at,
    });

    // Add banner if present
    const finalHtml = template.banner_url
      ? `<div style="text-align:center;"><img src="${template.banner_url}" style="max-width:100%;"></div>${html}`
      : html;

    // 4. Determine recipient: real user or test email
    const toEmail = testEmail || profile.email;

    // 5. Send with Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "orders@tamoor.in", // replace with verified sender
        to: [toEmail],
        subject: template.subject,
        html: finalHtml,
      }),
    });

    const resendText = await resendRes.text();
    console.log("Resend response:", resendText);

    if (!resendRes.ok) {
      throw new Error(`Resend error: ${resendText}`);
    }

    return new Response(JSON.stringify({ success: true, sentTo: toEmail }), {
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
