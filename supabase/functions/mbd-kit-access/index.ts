import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Kit access.
//   GET  ?token=<access_token>  → { ok, appUrl, handbookUrl } for a kit purchase
//   POST { email }              → re-sends the access email; always 200 so the
//                                 form can't be used to check who has bought.
// Env: MBD_KIT_APP_URL (where the apps live — the Firefly Builder preview
// until the kit is hosted on mbd.studio), MBD_SUPABASE_SERVICE_ROLE_KEY,
// MBD_RESEND_API_KEY.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const KIT_SLUG = "kit";
const HANDBOOK_PDF = "MBD-studio-AI-Workflow-Handbook.pdf";
const SITE_URL = "https://www.mbd.studio";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://agzfmgsgcfngpzbcfsbh.supabase.co";
  const serviceKey = Deno.env.get("MBD_SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return json({ error: "Server not configured" }, 500);
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (req.method === "GET") {
      const token = new URL(req.url).searchParams.get("token") || "";
      if (token.length < 20) return json({ ok: false }, 401);

      const { data: purchase } = await supabase
        .from("mbd_purchases")
        .select("id, product_slug")
        .eq("access_token", token)
        .eq("product_slug", KIT_SLUG)
        .maybeSingle();
      if (!purchase) return json({ ok: false }, 401);

      const appUrl = Deno.env.get("MBD_KIT_APP_URL") || "";

      // Fresh 7-day handbook link on every visit, so the PDF never "expires"
      // for a kit buyer.
      const { data: signed } = await supabase.storage
        .from("mbd-products")
        .createSignedUrl(HANDBOOK_PDF, 60 * 60 * 24 * 7);

      return json({ ok: true, appUrl, handbookUrl: signed?.signedUrl || null });
    }

    if (req.method === "POST") {
      let email = "";
      try {
        const body = await req.json();
        email = String(body?.email || "").trim().toLowerCase();
      } catch { /* fall through */ }
      if (!email || !email.includes("@")) return json({ ok: true });

      const { data: purchases } = await supabase
        .from("mbd_purchases")
        .select("access_token")
        .eq("product_slug", KIT_SLUG)
        .ilike("customer_email", email)
        .not("access_token", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      const token = purchases?.[0]?.access_token;
      const resendApiKey = Deno.env.get("MBD_RESEND_API_KEY");
      if (token && resendApiKey) {
        const accessUrl = `${SITE_URL}/kit/${token}`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MBD Studio <hello@mbd.studio>",
            to: email,
            subject: "Your Art Direction Kit link",
            html: `
              <!DOCTYPE html>
              <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
                  <h1 style="color: #1a1a1a;">Here's your kit link</h1>
                  <p>This is your personal link to the apps. It doesn't expire, and your handbook is available from the same page.</p>
                  <p style="margin: 32px 0;">
                    <a href="${accessUrl}" style="background: #6d28d9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-weight: bold; display: inline-block;">
                      Open the kit →
                    </a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
                  <p style="color: #666; font-size: 14px;">Thank you for supporting MBD Studio.<br>— Michelle</p>
                </body>
              </html>
            `,
          }),
        }).catch((e) => console.error("Resend failed:", e));
      }
      // Same answer whether or not a purchase exists.
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("mbd-kit-access error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
