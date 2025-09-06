import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient, User } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface PromoteRoleRequest {
  userId: string;
  role: "superadmin" | "productmanager" | "ordermanager" | "customer";
}

serve(async (req: Request) => {
  try {
    const body: PromoteRoleRequest = await req.json();

    const { userId, role } = body;

    if (!userId || !role) {
      return new Response(JSON.stringify({ error: "Missing userId or role" }), { status: 400 });
    }

    // Update role in app_metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    });

    console.log("🔑 Role updated:", { data, error });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    console.error("❌ Promote-role function error:", err);
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
