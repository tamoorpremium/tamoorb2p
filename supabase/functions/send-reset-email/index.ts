import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({
        error: "Email is required"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    // Generate Supabase reset link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://www.tamoor.in/reset-password"
      }
    });
    if (error) throw error;
    const resetUrl = data.properties?.action_link;
    // Send email via Resend REST API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "noreply@tamoor.in",
        to: [
          email
        ],
        subject: "Reset your password",
        html: `
          <p>Hi,</p>
          <p>You requested a password reset. Click below:</p>
          <p><a href="${resetUrl}" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset Password</a></p>
          <p>If you didn’t request this, ignore this email.</p>
        `
      })
    });
    const resendText = await resendRes.text();
    console.log("Resend API response:", resendText);
    if (!resendRes.ok) {
      throw new Error(`Resend API error: ${resendText}`);
    }
    return new Response(JSON.stringify({
      success: true,
      resetUrl
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
