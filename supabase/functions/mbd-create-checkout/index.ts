import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Product slug → env var name that holds the Stripe price ID.
// Adding a product: add a slug here and set the matching env var in Supabase.
const PRICE_ENV_BY_SLUG: Record<string, string> = {
  "ai-workflows": "MBD_STRIPE_PRICE_ID",
  "figma-to-claude": "MBD_STRIPE_PRICE_ID_CLAUDE",
};

// Used when the request has no body — keeps the older AI Workflows page working.
const DEFAULT_SLUG = "ai-workflows";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("MBD_STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing required environment variables");
    }

    // Pick the product the caller asked for, falling back to ai-workflows
    // if the body is missing, malformed, or names an unknown slug.
    let slug = DEFAULT_SLUG;
    try {
      const body = await req.json();
      if (typeof body?.slug === "string" && PRICE_ENV_BY_SLUG[body.slug]) {
        slug = body.slug;
      }
    } catch {
      // No JSON body — that's fine, use the default.
    }

    const priceEnvName = PRICE_ENV_BY_SLUG[slug];
    const priceId = Deno.env.get(priceEnvName);
    if (!priceId) {
      throw new Error(
        `No Stripe price configured for product "${slug}" (expected env var ${priceEnvName})`
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse origin from request to build success/cancel URLs
    const origin = req.headers.get("origin") || "https://mbd.studio";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/get-the-goods/${slug}`,
      // Collect customer email so we can send the download link
      customer_email: undefined, // Stripe will prompt for it
      consent_collection: {
        promotions: "auto",
      },
      metadata: {
        product_slug: slug,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});