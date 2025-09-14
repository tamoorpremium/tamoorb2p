// supabase/functions/send-invoice-email/index.ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Handlebars from "https://esm.sh/handlebars@4.7.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, testEmail } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "OrderId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, placed_at, user_id, invoice_file")
      .eq("id", orderId)
      .single();
    if (orderError || !order) throw orderError || new Error("Order not found");

    // 2. Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", order.user_id)
      .single();
    if (profileError || !profile) throw profileError || new Error("Profile not found");

    // 3. Get active invoice template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, body, banner_url")
      .eq("type", "invoice")
      .eq("is_active", true)
      .single();
    if (templateError || !template) throw templateError || new Error("Active invoice template not found");

    // 4. Compile HTML with Handlebars
    const compiled = Handlebars.compile(template.body);
    const html = compiled({
      customer_name: profile.full_name,
      order_id: order.id,
      order_total: order.total,
      order_date: order.placed_at,
    });

    const finalHtml = template.banner_url
      ? `<div style="text-align:center;"><img src="${template.banner_url}" style="max-width:100%;"></div>${html}`
      : html;

    // 5. Download invoice PDF from private bucket
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from("invoices")
      .download(order.invoice_file);
    if (fileError || !fileData) throw fileError || new Error("Invoice file not found");

    // 6. Convert PDF to Base64 safely
    async function fileToBase64(file: Response | Blob) {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 0x8000; // 32KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      return btoa(binary);
    }
    const base64Content = await fileToBase64(fileData);

    // 7. Determine recipient
    const toEmail = testEmail || profile.email;

    // 8. Send email via Resend with PDF attachment
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
        html: finalHtml,
        attachments: [
          {
            filename: order.invoice_file,
            type: "application/pdf",
            content: base64Content,
          },
        ],
      }),
    });

    const resendText = await resendRes.text();
    console.log("Resend response:", resendText);
    if (!resendRes.ok) throw new Error(`Resend error: ${resendText}`);

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
