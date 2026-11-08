import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import appsBrand from "../../assets/apps-brand.webp";
import appsRemix from "../../assets/apps-remix.webp";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const APPS_SLUG = "kit"; // Brand Palette & Creative Remix Applications

const button =
  "inline-flex items-center justify-center rounded-full bg-[#5816dd] text-white px-8 py-4 text-lg font-bold shadow-[0px_10px_15px_0px_rgba(0,0,0,0.25),0px_4px_6px_0px_rgba(0,0,0,0.15)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed";

/** The one place the apps are pitched to book buyers: right after their purchase. */
function AppsBox() {
  const [loading, setLoading] = useState(false);

  async function buy() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/mbd-create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ slug: APPS_SLUG }),
      });
      const data = res.ok ? await res.json() : null;
      if (!data?.url) throw new Error("No checkout URL");
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong starting checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-16 bg-white/10 rounded-2xl p-6 sm:p-8 text-left">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <img src={appsBrand} alt="Brand Palette" className="block w-full aspect-[16/10] object-cover object-top rounded-xl" loading="lazy" />
        <img src={appsRemix} alt="Creative Remix" className="block w-full aspect-[16/10] object-cover object-top rounded-xl" loading="lazy" />
      </div>
      <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Also from MBD Studio</p>
      <h2 className="mt-2 text-white text-2xl sm:text-3xl font-bold">
        Brand Palette &amp; Creative Remix Applications
      </h2>
      <p className="mt-3 text-white/95 text-[18px] [font-weight:400]! leading-relaxed">
        Two prompting apps for designers. Brand Palette builds a brand from concept to
        prompt-ready briefs; Creative Remix combines style, influence and mood into concepts you
        wouldn't have reached on your own. Browser-based, no account, no AI credits.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <button type="button" onClick={buy} disabled={loading} className={button}>
          {loading ? "Loading…" : "Get both apps →"}
        </button>
        <span className="text-white text-xl font-bold">$10 USD</span>
        <Link to="/get-the-goods/brand-palette-remix" className="text-white/90 underline underline-offset-4 hover:text-white">
          See them first
        </Link>
      </div>
    </div>
  );
}

export function ThankYouPage() {
  const [params] = useSearchParams();
  const boughtApps = params.get("product") === APPS_SLUG;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" />

        <div className="max-w-[760px] mx-auto px-6 py-20 lg:py-28 text-center">
          <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
            Thank you for your purchase!
          </h1>
          <p className="mt-4 text-white/95 text-xl sm:text-2xl font-medium">
            {boughtApps
              ? "Your personal link to the apps is on its way to your inbox."
              : "Your handbook is on its way to your inbox."}
          </p>

          <div className="mt-10 space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed">
            {boughtApps ? (
              <p>
                Check your email — we've just sent your link to the address you used at checkout.
                It doesn't expire; opening an app once on a device remembers you there.
              </p>
            ) : (
              <p>
                Check your email — we've just sent your download link to the address you used at
                checkout. The link is valid for 7 days.
              </p>
            )}
            <p>
              Didn't get the email?{" "}
              {boughtApps ? (
                <>
                  Check your spam folder, or{" "}
                  <Link to="/kit" className="font-bold underline underline-offset-4 hover:text-white">
                    have it re-sent
                  </Link>
                  .
                </>
              ) : (
                <>
                  Check your spam folder, or{" "}
                  <a href="mailto:hello@mbd.studio" className="font-bold underline underline-offset-4 hover:text-white">
                    contact us
                  </a>{" "}
                  and we'll resend it.
                </>
              )}
            </p>
          </div>

          {!boughtApps && <AppsBox />}

          <div className="mt-12">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-[#5816dd] text-white px-8 py-4 text-lg font-bold shadow-[0px_10px_15px_0px_rgba(0,0,0,0.25),0px_4px_6px_0px_rgba(0,0,0,0.15)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
            >
              ← Back to mbd.studio
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
