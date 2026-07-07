import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Product slug → delivery details.
// Adding a product: drop a new entry here and upload the matching PDF
// to the mbd-products Storage bucket.
const PRODUCTS: Record<string, {
  pdfPath: string;
  title: string;
  emailSubject: string;
  ctaLabel: string;
}> = {
  "ai-workflows": {
    pdfPath: "MBD-studio-AI-Workflow-Handbook.pdf",
    title: "New AI Workflows: A Creative Handbook for Designers",
    emailSubject: "Your New AI Workflows handbook is ready",
    ctaLabel: "Download your handbook →",
  },
  "figma-to-claude": {
    pdfPath: "MBD-studio-Claude-and-Me.pdf",
    title: "Claude & Me: How to Switch From Figma Make to Claude Code",
    emailSubject: "Your Claude & Me guide is ready",
    ctaLabel: "Download your guide →",
  },
};

const DEFAULT_SLUG = "ai-workflows";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripeSecretKey = Deno.env.get("MBD_STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("MBD_STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://agzfmgsgcfngpzbcfsbh.supabase.co";
    const supabaseServiceKey = Deno.env.get("MBD_SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("MBD_RESEND_API_KEY");

    if (!stripeSecretKey || !webhookSecret || !supabaseServiceKey || !resendApiKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Verify the webhook signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // We only care about completed checkout sessions
    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotency check: don't process the same session twice
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existing } = await supabase
      .from("mbd_purchases")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      console.log("Session already processed:", session.id);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customerEmail = session.customer_details?.email || session.customer_email;
    const productSlug = session.metadata?.product_slug || DEFAULT_SLUG;
    const amountPaid = session.amount_total || 0;
    const currency = session.currency || "usd";
    // Marketing consent collected via consent_collection.promotions on the
    // checkout session. Stripe reports "opt_in" / "opt_out" (or null if the
    // checkout didn't collect it).
    const marketingOptIn = session.consent?.promotions === "opt_in";

    if (!customerEmail) {
      throw new Error("No customer email on session");
    }

    // Resolve product details, falling back to the default if the slug is
    // unknown (defensive — should never happen since mbd-create-checkout
    // also enforces an allowlist).
    const product = PRODUCTS[productSlug] || PRODUCTS[DEFAULT_SLUG];

    // Generate a signed download URL valid for 7 days
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from("mbd-products")
      .createSignedUrl(product.pdfPath, 60 * 60 * 24 * 7); // 7 days in seconds

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message}`);
    }

    const downloadUrl = signedUrlData.signedUrl;

    // Log the purchase
    const { error: insertError } = await supabase
      .from("mbd_purchases")
      .insert({
        stripe_session_id: session.id,
        customer_email: customerEmail,
        product_slug: productSlug,
        amount_paid: amountPaid,
        currency: currency,
        marketing_opt_in: marketingOptIn,
      });

    if (insertError) {
      console.error("Failed to insert purchase:", insertError);
      // Continue anyway — we still want to send the email
    }

    // Send the email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="color: #1a1a1a;">Thanks for your purchase!</h1>
          <p>Your copy of <strong>${product.title}</strong> is ready to download.</p>
          <p style="margin: 32px 0;">
            <a href="${downloadUrl}" style="background: #6d28d9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-weight: bold; display: inline-block;">
              ${product.ctaLabel}
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This download link is valid for 7 days. If it expires or you have any trouble accessing it, just reply to this email and I'll send you a fresh link.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          <p style="color: #666; font-size: 14px;">
            Thank you for supporting MBD Studio.<br>
            — Michelle
          </p>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MBD Studio <hello@mbd.studio>",
        to: customerEmail,
        subject: product.emailSubject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Failed to send email:", errorText);
      // Don't throw — purchase is logged, buyer can still access via thank-you page
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});