// supabase/functions/handle-razorpay-webhook/index.ts

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * 1. Function to verify the webhook signature from Razorpay
 */
async function verifyWebhookSignature(body: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  
  const expectedSignatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
  const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignatureHex === signature;
}

/**
 * 2. Main function to handle fulfillment logic
 * (This logic should mirror your 'verify-razorpay-payment' function)
 */
async function fulfillOrder(supabase: any, order: any, paymentEntity: any) {
  const internal_order_id = order.id;
  const razorpay_payment_id = paymentEntity.id;

  console.log(`[webhook-fulfill] Fulfilling order ${internal_order_id}...`);
  
  try {
    // a. Update order status
    console.log(`[webhook-fulfill] Updating order status to 'paid' for: ${internal_order_id}`);
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", internal_order_id);
    if (updateError) throw new Error(`Failed to update order status: ${updateError.message}`);
    console.log(`[webhook-fulfill] Order ${internal_order_id} updated successfully ✅`);

    // b. Insert payment record
    console.log(`[webhook-fulfill] Inserting payment record for order ${internal_order_id}...`);
    const { error: paymentInsertError } = await supabase.from("payments").insert([
      {
        order_id: internal_order_id,
        payment_method: "razorpay_webhook", // Note the method
        payment_status: "Success",
        transaction_id: razorpay_payment_id,
        amount: order.total,
        user_id: order.user_id,
        gateway_name: "razorpay",
        meta: {
          razorpay_order_id: paymentEntity.order_id,
          razorpay_payment_id: razorpay_payment_id,
          full_response: paymentEntity
        }
      }
    ]);
    if (paymentInsertError) {
      console.error("[webhook-fulfill] Failed to insert payment:", paymentInsertError);
    } else {
      console.log(`[webhook-fulfill] Payment record inserted for order ${internal_order_id} ✅`);
    }

    // ⬇️ ADD THIS NEW BLOCK ⬇️
    if (order && order.user_id) {
      console.log(`[webhook-fulfill] 🧹 Clearing cart for user: ${order.user_id}`);
      const { error: cartClearError } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", order.user_id);
        
      if (cartClearError) {
        console.error(`[webhook-fulfill] Failed to clear cart: ${cartClearError.message}`);
      } else {
        console.log(`[webhook-fulfill] Cart cleared successfully ✅`);
      }
    }
    // ⬆️ END OF NEW BLOCK ⬆️

    // c. Update promo usage
    if (order.promo_code) {
      console.log(`[webhook-fulfill] Incrementing promo usage for: ${order.promo_code}`);
      const { error: promoUpdateError } = await supabase.rpc("increment_promo_used_count", {
        promo: order.promo_code
      });
      if (promoUpdateError) {
        console.error("[webhook-fulfill] Failed to increment promo usage:", promoUpdateError);
      } else {
        console.log(`[webhook-fulfill] Promo usage incremented for ${order.promo_code} ✅`);
      }
    }

    // d. Create shipment
    console.log(`[webhook-fulfill] Triggering shipment creation for order: ${internal_order_id}`);
    const shipmentResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-shipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({ order_id: internal_order_id })
    });
    if (!shipmentResponse.ok) {
        const errText = await shipmentResponse.text();
        console.error("[webhook-fulfill] Failed to trigger shipment:", errText);
    } else {
      console.log(`[webhook-fulfill] Shipment triggered successfully for order ${internal_order_id} ✅`);
    }

    // --- ⬇️ STEP 5: (ADDED) SEND CONFIRMATION EMAIL ⬇️ ---
    
    // Check if email exists in the address JSON (fetched by the 'serve' function)
    if (order.address && order.address.email) {
      console.log(`[webhook-fulfill] Sending confirmation email to: ${order.address.email}`);
      try {
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: JSON.stringify({
            orderId: internal_order_id,
            email: order.address.email, // Send to the actual customer
          }),
        });

        if (emailError) {
            throw emailError;
        }

        console.log(`[webhook-fulfill] Confirmation email triggered for order ${internal_order_id} ✅`);
      } catch (emailError) {
        console.error(`[webhook-fulfill] ❌ Failed to send confirmation email:`, emailError);
      }
    } else {
      console.warn(`[webhook-fulfill] ⚠️ No email found in order.address for order ${internal_order_id}. Cannot send email.`);
    }
    // --- ⬆️ END OF ADDED BLOCK ⬆️ ---

    return true;

  } catch (error) {
    let errorMessage = "An unknown error occurred during fulfillment";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`[webhook-fulfill] CRITICAL ERROR fulfilling order ${internal_order_id}:`, errorMessage, error);
    return false;
  }
}


/**
 * 3. The main server function
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("[webhook] 🔔 New webhook request received.");
    const razorpaySignature = req.headers.get("x-razorpay-signature");
    const razorpayWebhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
    const rawBody = await req.text();

    if (!razorpaySignature) {
      console.warn("[webhook] ⚠️ Missing x-razorpay-signature header. Rejecting.");
      return new Response("Signature missing", { status: 400 });
    }

    // 4. Verify the signature
    const isValid = await verifyWebhookSignature(rawBody, razorpaySignature, razorpayWebhookSecret);
    if (!isValid) {
      console.error("[webhook] ❌ Invalid signature. Rejecting.");
      return new Response("Invalid signature", { status: 403 });
    }
    
    console.log("[webhook] ✅ Signature verified successfully.");
    const payload = JSON.parse(rawBody);

    // 5. Handle the 'payment.captured' event
    if (payload.event === "payment.captured") {
      console.log("[webhook] ⚡ Received 'payment.captured' event.");
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id; // This is the gateway_order_id

      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

      // 6. Find the internal order using the 'gateway_order_id'
      console.log(`[webhook] 🔍 Searching for order with gateway_order_id: ${razorpayOrderId}`);
      
      // --- ⬇️ MODIFIED: Added 'address' to the select query ⬇️ ---
      const { data: order, error: findError } = await supabase
        .from("orders")
        .select("id, status, total, user_id, promo_code, address") // Select all fields needed for fulfillment
        .eq("gateway_order_id", razorpayOrderId)
        .single();
      // --- ⬆️ END OF MODIFICATION ⬆️ ---

      if (findError || !order) {
        console.error(`[webhook] ❌ Order not found for gateway_order_id: ${razorpayOrderId}`, findError);
        return new Response("Order not found", { status: 404 });
      }

      // 7. Check if order is already processed (Idempotency)
      if (order.status === "paid" || order.status === "shipped" || order.status === "delivered") {
        console.log(`[webhook] 🥱 Order ${order.id} is already processed (status: ${order.status}). Skipping.`);
        return new Response("Order already processed", { status: 200 });
      }

      // 8. Fulfill the order
      await fulfillOrder(supabase, order, paymentEntity);
    } else {
      console.log(`[webhook] ⚪ Received event '${payload.event}'. No action taken.`);
    }

    return new Response("Webhook received", { status: 200, headers: corsHeaders });

  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("[webhook] 💥 Internal Server Error:", errorMessage, error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), { status: 500 });
  }
});