// supabase/functions/order-tracking-webhook/index.ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const WEBHOOK_SECRET = Deno.env.get("SHIPROCKET_WEBHOOK_SECRET")!;

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 🔐 Verify secret header
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("🚚 Order Tracking Webhook Payload:", body);

    const shipmentId = body.shipment_id ?? body.order_id;
    const awb = String(body.awb ?? body.awb_code);
    const courier = body.courier_name ?? body.courier;
    const status = body.current_status ?? body.shipment_status;
    const scans = body.scans ?? [];
    const lastUpdate = scans.length
      ? new Date(scans[0].date).toISOString()
      : new Date().toISOString();

    // Update shipments table
    const { error } = await supabase
      .from("shipments")
      .update({
        awb_no: awb,
        courier_company: courier,
        tracking_status: status,
        tracking_history: scans,
        last_tracking_update: lastUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("shipment_id", shipmentId);

    if (error) {
      console.error("❌ Failed to update shipment:", error);
      return new Response("Database error", { status: 500 });
    }

    return new Response("✅ Webhook processed", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Internal Error", { status: 500 });
  }
});
