// supabase/functions/create-razorpay-order/index.ts

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

serve(async (req) => {
  console.log("👉 Incoming request:", req.method);
  if (req.method === "OPTIONS") {
    console.log("🔄 Handling preflight OPTIONS request");
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    console.error("❌ Method not allowed:", req.method);
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    console.log("📥 Parsing request body...");
    const body = await req.json();
    console.log("✅ Request body received (first 50 chars):", JSON.stringify(body).substring(0, 50));

    const { 
      amount, user_id, address, delivery_option, 
      payment_method, payment_details, cart_items, 
      subtotal, discount, promo_code, delivery_fee 
    } = body;

    if (!amount || !user_id || !address || !cart_items) {
      console.error("❌ Missing required fields");
      return new Response(JSON.stringify({ error: "Missing required fields: amount, user_id, address, or cart_items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("🔑 Initializing Supabase client...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log("📝 Inserting order into Supabase...");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id,
        total: amount,
        subtotal,
        discount,
        delivery_fee,
        promo_code,
        status: "pending", // This order is pending until paid
        address,
        delivery_option,
        payment_method,
        payment_details,
        placed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("❌ Failed to insert order:", orderError?.message);
      return new Response(JSON.stringify({ error: "Failed to create order", details: orderError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`✅ Order inserted with ID: ${order.id}`);
    console.log("🛒 Inserting order items with weight...");

    for (const item of cart_items) {
      console.log(`➡️ Inserting item: product_id=${item.id}, qty=${item.quantity}, price=${item.price}, weight=${item.weight}`);
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price, // Make sure this is unit price
        weight: item.weight || 0 // weight added here
      });
      if (itemError) {
        console.error("❌ Failed to insert order item:", itemError.message);
        // Here, you might want to roll back the order creation or mark it as 'failed'
        return new Response(JSON.stringify({ error: "Failed to insert order item", details: itemError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    console.log("✅ All order items inserted");
    console.log("🧹 Clearing cart for user:", user_id);
    await supabase.from("cart").delete().eq("user_id", user_id);
    console.log("✅ Cart cleared");

    console.log("💳 Creating Razorpay order...");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const keySecret = Deno.env.get("RAZORPAY_SECRET") || "";
    const authString = btoa(`${keyId}:${keySecret}`);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Ensure amount is in paise
        currency: "INR",
        receipt: `receipt_${order.id}`,
        payment_capture: 1
      })
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("❌ Razorpay order creation failed:", errorText);
      // Mark internal order as failed
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return new Response(JSON.stringify({ error: "Failed to create Razorpay order", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log("✅ Razorpay order created:", razorpayOrder.id);

    // --- ADDED BLOCK: Link Internal Order to Razorpay Order ---
    console.log(`[webhook-prep] 🔗 Linking internal order ${order.id} to gateway_order_id ${razorpayOrder.id}`);
    const { error: updateError } = await supabase
      .from("orders")
      .update({ gateway_order_id: razorpayOrder.id })
      .eq("id", order.id);

    if (updateError) {
      console.error(`❌ Failed to update order ${order.id} with gateway_order_id:`, updateError.message);
      // This is not fatal for the user's payment, but log it for debugging.
    }
    // --- END OF ADDED BLOCK ---

    return new Response(JSON.stringify({
      internal_order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("💥 Internal Server Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
      status: 500,
      headers: corsHeaders
    });
  }
});