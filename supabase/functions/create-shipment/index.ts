// supabase/functions/create-shipment/index.ts
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
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({
        error: "Missing order_id"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("[create-shipment] Processing order:", order_id);
    // Supabase client
    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    // 1. Get order + items with product names
    const { data: order, error: orderError } = await supabase.from("orders").select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          weight,
          products ( name )
        )
      `).eq("id", order_id).single();
    if (orderError || !order) {
      console.error("[create-shipment] Failed to fetch order:", orderError);
      return new Response(JSON.stringify({
        error: "Order not found"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const items = order.order_items || [];
    // 2. Calculate total weight in KG (assuming DB stores weight in grams)
    const totalWeightGrams = items.reduce((sum, item)=>sum + parseFloat(item.weight || "0") * item.quantity, 0);
    const totalWeightKg = Math.max(totalWeightGrams / 1000, 0.5); // min 0.5 kg
    console.log("[create-shipment] Total Weight (kg):", totalWeightKg);
    // 3. Prepare order_items for Shiprocket
    const shiprocketItems = items.map((item)=>({
        name: item.products?.name || "Unknown Product",
        sku: `SKU-${item.id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: "0802"
      }));
    // 4. Extract address from JSON column
    const orderAddress = typeof order.address === "object" ? order.address : JSON.parse(order.address || "{}");
    console.log("[create-shipment] Extracted Address:", orderAddress);
    // 5. Use API Token directly
    const tokenRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/get-shiprocket-token`, {
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json"
      }
    });
    const { token } = await tokenRes.json();
    if (!token) {
      return new Response(JSON.stringify({
        error: "Missing Shiprocket API token"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Map your DB payment methods to Shiprocket values
    const mapPaymentMethod = (method)=>{
      if (!method) return "Prepaid";
      const m = method.toLowerCase();
      if (m === "cod" || m === "cash" || m === "cashondelivery") return "COD";
      return "Prepaid"; // everything else is prepaid
    };
    // Map delivery option to Shiprocket-friendly tag
    const mapDeliveryOption = (option)=>{
      if (!option) return "standard";
      const o = option.toLowerCase();
      if (o === "standard") return "standard";
      if (o === "express") return "express";
      if (o === "premium") return "sdd"; // treat premium as Same-Day Delivery
      return "standard"; // fallback
    };
    const deliveryOption = mapDeliveryOption(order.delivery_option);
    // 6. Calculate subtotal safely
    const subTotal = order.total || items.reduce((sum, item)=>sum + item.price * item.quantity, 0);
    // 7. Prepare Shiprocket payload
    const shipmentPayload = {
      order_id: `ORDER-${order.id}-${deliveryOption}`,
      order_date: new Date().toISOString(),
      pickup_location: "Tamoor",
      channel_id: "",
      billing_customer_name: orderAddress.full_name || order.customer_name || "Guest",
      billing_last_name: "",
      billing_address: orderAddress.address || "Default Address",
      billing_city: orderAddress.city || "Default City",
      billing_pincode: orderAddress.pincode || "000000",
      billing_state: orderAddress.state || "Default State",
      billing_country: "India",
      billing_email: orderAddress.email || "guest@example.com",
      billing_phone: orderAddress.phone || "0000000000",
      shipping_is_billing: true,
      order_items: shiprocketItems,
      payment_method: mapPaymentMethod(order.payment_method),
      sub_total: subTotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: totalWeightKg,
      delivery_option: deliveryOption
    };
    console.log("[create-shipment] Shiprocket Payload:", shipmentPayload);
    // 8. Create Shipment Order in Shiprocket
    const shipmentRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(shipmentPayload)
    });
    const shipmentText = await shipmentRes.text();
    console.log("[create-shipment] Shiprocket Response Status:", shipmentRes.status);
    console.log("[create-shipment] Shiprocket Response Body:", shipmentText);
    if (!shipmentRes.ok) {
      return new Response(JSON.stringify({
        error: "Shiprocket shipment failed",
        details: shipmentText
      }), {
        status: shipmentRes.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const shipmentData = JSON.parse(shipmentText);
    console.log("[create-shipment] Shipment Created ✅:", shipmentData);
    // 9. Insert shipment into shipments table
    const { error: shipmentInsertError } = await supabase.from("shipments").insert({
      order_id: order.id,
      shiprocket_order_id: shipmentData.order_id,
      shipment_id: shipmentData.shipment_id,
      status: shipmentData.status,
      tracking_id: shipmentData.awb_code,
      courier_company: shipmentData.courier_company_id,
      delivery_option: deliveryOption,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (shipmentInsertError) {
      console.error("[create-shipment] Failed to insert shipment:", shipmentInsertError);
      return new Response(JSON.stringify({
        error: "Failed to save shipment in database",
        details: shipmentInsertError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      shipment: shipmentData
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("[create-shipment] Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: String(error)
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
