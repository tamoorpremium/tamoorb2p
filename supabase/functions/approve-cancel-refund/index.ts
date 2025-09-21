// supabase/functions/approve-cancel-refund/index.ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ApproveCancelBody {
  cancellation_request_id: number;
  admin_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const body: ApproveCancelBody = await req.json();
    const { cancellation_request_id, admin_id } = body;

    if (!cancellation_request_id || !admin_id)
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1️⃣ Fetch cancellation request
    const { data: cancelReq } = await supabase
      .from("order_cancellation_requests")
      .select("*")
      .eq("id", cancellation_request_id)
      .single();

    if (!cancelReq) return new Response(JSON.stringify({ error: "Cancellation request not found" }), { status: 404, headers: corsHeaders });
    if (cancelReq.status !== "pending") return new Response(JSON.stringify({ error: "Already processed" }), { status: 400, headers: corsHeaders });

    const orderId = cancelReq.order_id;

    // 2️⃣ Fetch order
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, payment_method")
      .eq("id", orderId)
      .single();

    if (!order) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: corsHeaders });

    // 3️⃣ Fetch payment if online
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .eq("payment_status", "Success ✅")
      .single();

    const isOnlinePayment = order.payment_method !== "cod" && !!payment;

    // 4️⃣ Refund via Razorpay (direct REST API)
    if (isOnlinePayment && payment?.transaction_id) {
      try {
        console.log("Payment record:", payment);
        console.log("Transaction ID:", payment.transaction_id);
        console.log("Refund amount (paise):", payment.amount * 100);

        const razorpayKey = Deno.env.get("RAZORPAY_KEY_ID");
        const razorpaySecret = Deno.env.get("RAZORPAY_SECRET");

        const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${payment.transaction_id}/refund`, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${razorpayKey}:${razorpaySecret}`),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: payment.amount * 100, // amount in paise
          }),
        });

        const refundData = await refundRes.json();
        if (!refundRes.ok) {
          console.error("Razorpay refund failed:", refundData);
          return new Response(JSON.stringify({ error: `Razorpay refund failed: ${JSON.stringify(refundData)}` }), { status: 400, headers: corsHeaders });
        }

        await supabase.from("order_refunds").insert({
          cancellation_request_id,
          refund_id: refundData.id,
          amount: payment.amount,
          status: refundData.status,
          approved_by: admin_id,
        });

        await supabase.from("payments").update({ payment_status: "Refunded" }).eq("id", payment.id);
      } catch (err: unknown) {
        console.error("Razorpay refund failed:", err);
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: `Razorpay refund failed: ${message}` }), { status: 400, headers: corsHeaders });
      }
    }

    // 5️⃣ Cancel shipment
    const { data: shipment } = await supabase.from("shipments").select("*").eq("order_id", orderId).single();
    if (shipment?.shiprocket_order_id) {
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
        }
      } catch (err: unknown) {
        console.error("Shiprocket cancel failed:", err);
      }
    }

    // 6️⃣ Update order + request
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await supabase.from("order_cancellation_requests").update({
      status: "approved",
      payment_refund_status: isOnlinePayment ? "processed" : "na",
      approved_by: admin_id,
      approved_at: new Date().toISOString(),
    }).eq("id", cancellation_request_id);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    console.error("approve-cancel-refund error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders });
  }
});
