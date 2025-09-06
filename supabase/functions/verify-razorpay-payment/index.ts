import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
async function verifyRazorpaySignature(order_id, payment_id, signature, secret) {
  console.log("[verifyRazorpaySignature] Inputs:", {
    order_id,
    payment_id,
    signature
  });
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = `${order_id}|${payment_id}`;
  console.log("[verifyRazorpaySignature] Data string for HMAC:", data);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, {
    name: "HMAC",
    hash: {
      name: "SHA-256"
    }
  }, false, [
    "sign"
  ]);
  const expectedSignatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  // Convert ArrayBuffer -> hex string
  const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer)).map((b)=>b.toString(16).padStart(2, "0")).join("");
  console.log("[verifyRazorpaySignature] Expected (hex):", expectedSignatureHex);
  console.log("[verifyRazorpaySignature] Provided (hex):", signature);
  return expectedSignatureHex === signature;
}
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }
  try {
    console.log("[verify-razorpay-payment] Incoming request...");
    const body = await req.json();
    console.log("[verify-razorpay-payment] Request body:", body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_order_id) {
      console.error("[verify-razorpay-payment] Missing required fields");
      return new Response(JSON.stringify({
        error: "Missing required fields"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const razorpaySecret = Deno.env.get("RAZORPAY_SECRET") || "";
    console.log("[verify-razorpay-payment] Using Razorpay Secret (len):", razorpaySecret.length);
    const signatureIsValid = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpaySecret);
    if (!signatureIsValid) {
      console.error("[verify-razorpay-payment] Invalid signature verification failed");
      return new Response(JSON.stringify({
        error: "Invalid signature"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("[verify-razorpay-payment] Signature verified successfully ✅");
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    // Update order status
    console.log("[verify-razorpay-payment] Updating order status to 'paid' for:", internal_order_id);
    const { error: updateError } = await supabase.from("orders").update({
      status: "paid",
      updated_at: new Date().toISOString()
    }).eq("id", internal_order_id);
    if (updateError) {
      console.error("[verify-razorpay-payment] Failed to update order:", updateError);
      return new Response(JSON.stringify({
        error: "Failed to update order status"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("[verify-razorpay-payment] Order updated successfully ✅");
    // --- Fetch order data to get amount and user_id ---
    const { data: orderData, error: orderFetchError } = await supabase.from("orders").select("total, user_id").eq("id", internal_order_id).single();
    if (orderFetchError || !orderData) {
      console.error("[payments] Failed to fetch order data:", orderFetchError);
    }
    // --- Insert payment record ---
    console.log("[payments] Inserting payment record into payments table...");
    const { error: paymentInsertError } = await supabase.from("payments").insert([
      {
        order_id: internal_order_id,
        payment_method: "razorpay",
        payment_status: "Success ✅",
        transaction_id: razorpay_payment_id,
        amount: orderData?.total || 0,
        user_id: orderData?.user_id || null,
        gateway_name: "razorpay",
        meta: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          full_response: body
        }
      }
    ]);
    if (paymentInsertError) {
      console.error("[payments] Failed to insert payment:", paymentInsertError);
    } else {
      console.log("[payments] Payment record inserted successfully ✅");
    }
    // 🚀 STEP 2: Create shipment after successful payment
    try {
      console.log("[shipping] Creating shipment for order:", internal_order_id);
      const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        },
        body: JSON.stringify({
          order_id: internal_order_id
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("[shipping] Failed to trigger shipment:", errText);
      } else {
        console.log("[shipping] Shipment triggered successfully ✅");
      }
    } catch (err) {
      console.error("[shipping] Error while creating shipment:", err);
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("[verify-razorpay-payment] Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: String(error)
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
