export const config = { runtime: "edge" };

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { orderId, mode, testEmail } = await req.json();
    if (!orderId || !mode) return new Response(JSON.stringify({ error: "orderId/mode required" }), { status: 400 });

    let endpoint = "";
    switch (mode) {
      case "test": endpoint = `${process.env.SUPABASE_URL}/functions/v1/send-test-email`; break;
      case "invoice": endpoint = `${process.env.SUPABASE_URL}/functions/v1/send-invoice-email`; break;
      case "confirmation": endpoint = `${process.env.SUPABASE_URL}/functions/v1/send-order-confirmation`; break;
      default: return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400 });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ orderId, testEmail }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.ok ? 200 : response.status });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
