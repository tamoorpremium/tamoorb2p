// supabase/functions/cancel-order/index.ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CancelOrderBody {
  orderId: number;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const body: CancelOrderBody = await req.json();
    const { orderId, userId } = body;

    if (!orderId || !userId) return new Response("Missing parameters", { status: 400, headers: corsHeaders });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1️⃣ Fetch order + shipment
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, status, payment_method, payment_details")
      .eq("id", orderId)
      .single();

    if (!order || order.user_id !== userId) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    const { data: shipment } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    // 2️⃣ Eligibility check
    if (!shipment) return new Response("Shipment not found", { status: 404, headers: corsHeaders });
    if (shipment.tracking_status === "delivered") return new Response("Cannot cancel delivered order", { status: 400, headers: corsHeaders });
    if (order.payment_method === "upi" && shipment.tracking_status !== "pending" && shipment.tracking_status !== null) {
    return new Response("Cannot cancel UPI order after pickup", { status: 400, headers: corsHeaders });
    }


    // 3️⃣ Create cancellation request
    const { data: cancelReq } = await supabase
      .from("order_cancellation_requests")
      .insert({
        order_id: orderId,
        user_id: userId,
        status: (order.payment_method === "cod" || order.payment_method === "wallet") ? "approved" : "pending",
        payment_refund_status: (order.payment_method === "cod" || order.payment_method === "wallet") ? "na" : "pending",
        requested_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    // 4️⃣ Cancel Shiprocket shipment if exists
    if (shipment.shiprocket_order_id) {
      try {
        const tokenRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/get-shiprocket-token`);
        const { token } = await tokenRes.json();

        const shipResp = await fetch(`https://apiv2.shiprocket.in/v1/external/cancel/shipment/${shipment.shiprocket_order_id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        const shipData = await shipResp.json();
        if (shipResp.ok && shipData.success) {
          await supabase.from("shipments").update({ status: "cancelled" }).eq("order_id", orderId);
        } else {
          console.error("Shiprocket cancel failed:", shipData);
        }
      } catch (err) {
        console.error("Shiprocket cancel error:", err);
      }
    }

    // 5️⃣ Auto-cancel COD / wallet orders
    if (cancelReq.status === "approved") {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    }

    return new Response(JSON.stringify({ success: true, cancelReq }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Cancel order error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
