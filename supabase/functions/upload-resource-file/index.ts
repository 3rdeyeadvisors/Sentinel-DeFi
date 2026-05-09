import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const FILENAME_PATTERN = /^[A-Za-z0-9._-]+\.pdf$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileName, fileData } = await req.json();

    // Validate filename — alphanumeric, dot/dash/underscore only, must end in .pdf
    if (typeof fileName !== "string" || !FILENAME_PATTERN.test(fileName) || fileName.includes("/") || fileName.includes("..")) {
      return new Response(
        JSON.stringify({ error: "Invalid fileName. Must match [A-Za-z0-9._-]+.pdf" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof fileData !== "string" || fileData.length === 0) {
      return new Response(JSON.stringify({ error: "Missing fileData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode base64 file data
    const fileBytes = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

    if (fileBytes.byteLength > MAX_BYTES) {
      return new Response(
        JSON.stringify({ error: `File exceeds ${MAX_BYTES} bytes` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify PDF magic bytes (%PDF-)
    if (
      fileBytes[0] !== 0x25 || fileBytes[1] !== 0x50 ||
      fileBytes[2] !== 0x44 || fileBytes[3] !== 0x46 || fileBytes[4] !== 0x2d
    ) {
      return new Response(JSON.stringify({ error: "File is not a valid PDF" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabaseAdmin.storage
      .from("resources")
      .upload(fileName, fileBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("resources")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ success: true, publicUrl, fileName, message: "File uploaded successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
