import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommunityNotificationPayload {
  type: 'comment' | 'rating' | 'question' | 'answer';
  user_name: string;
  user_email: string;
  content_id: string;
  content_type: string;
  title?: string;
  content?: string;
  rating?: number;
  review?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: CommunityNotificationPayload = await req.json();

    const ALLOWED_TYPES = new Set(['comment', 'rating', 'question', 'answer']);
    if (!ALLOWED_TYPES.has(payload.type)) {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Escape HTML in user-controlled fields to prevent injection in admin email
    const esc = (s: unknown) => String(s ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;").slice(0, 2000);

    // Trust authenticated identity for the actor; sanitize the rest
    const type = payload.type;
    const user_name = esc(user.user_metadata?.display_name ?? user.email ?? 'User');
    const user_email = esc(user.email ?? '');
    const content_id = esc(payload.content_id);
    const content_type = esc(payload.content_type);
    const title = payload.title ? esc(payload.title) : undefined;
    const content = payload.content ? esc(payload.content) : undefined;
    const rating = typeof payload.rating === 'number' ? payload.rating : undefined;
    const review = payload.review ? esc(payload.review) : undefined;
    
    let subject = "";
    let emailHtml = "";

    switch (type) {
      case 'comment':
        subject = `💬 New Comment on ${content_type} ${content_id}`;
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">💬 New Comment Posted</h2>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${user_name} (${user_email})</p>
                <p><strong>On:</strong> ${content_type} ${content_id}</p>
              </div>

              <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Comment:</h3>
                <p style="white-space: pre-wrap;">${content || 'No content'}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                <p>This is an automated notification from your Sentinel DeFi community.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'rating':
        subject = `⭐ New Rating on ${content_type} ${content_id}`;
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">⭐ New Rating Submitted</h2>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${user_name} (${user_email})</p>
                <p><strong>On:</strong> ${content_type} ${content_id}</p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(rating || 0)} (${rating}/5)</p>
              </div>

              ${review ? `
                <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Review:</h3>
                  <p style="white-space: pre-wrap;">${review}</p>
                </div>
              ` : ''}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                <p>This is an automated notification from your Sentinel DeFi community.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'question':
        subject = `❓ New Q&A Question on ${content_type} ${content_id}`;
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">❓ New Q&A Question Posted</h2>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${user_name} (${user_email})</p>
                <p><strong>On:</strong> ${content_type} ${content_id}</p>
              </div>

              <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${title || 'Question'}</h3>
                <p style="white-space: pre-wrap;">${content || 'No description'}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                <p>This is an automated notification from your Sentinel DeFi community.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'answer':
        subject = `💡 New Answer on Q&A for ${content_type} ${content_id}`;
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">💡 New Answer Posted</h2>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${user_name} (${user_email})</p>
                <p><strong>On:</strong> ${content_type} ${content_id}</p>
              </div>

              <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Answer:</h3>
                <p style="white-space: pre-wrap;">${content || 'No content'}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                <p>This is an automated notification from your Sentinel DeFi community.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi Community <notifications@sentineldefi.online>",
      reply_to: user_email,
      to: ["info@sentineldefi.online"],
      subject: subject,
      html: emailHtml,
      tags: [{ name: 'category', value: 'community_notification' }],
    });

    console.log("Community notification sent:", type);

    await supabase.from('email_logs').insert({
      email_type: 'community_notification',
      recipient_email: 'info@sentineldefi.online',
      status: 'sent',
      edge_function_name: 'send-community-notification',
      metadata: {
        resend_id: emailResponse.data?.id,
        notification_type: type,
        content_id,
        content_type
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending community notification:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
