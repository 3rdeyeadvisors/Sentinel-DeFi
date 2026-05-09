// Shared helpers to enforce JWT auth + admin role on edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type AuthResult =
  | { ok: true; userId: string; email: string | null; isAdmin: boolean }
  | { ok: false; status: number; message: string };

export async function requireUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { ok: false, status: 401, message: "Unauthorized" };
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, message: "Unauthorized" };
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return {
    ok: true,
    userId: data.user.id,
    email: data.user.email ?? null,
    isAdmin: !!roleRow,
  };
}

export async function requireAdmin(req: Request): Promise<AuthResult> {
  const result = await requireUser(req);
  if (!result.ok) return result;
  if (!result.isAdmin) return { ok: false, status: 403, message: "Admin role required" };
  return result;
}
