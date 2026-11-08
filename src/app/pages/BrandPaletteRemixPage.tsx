import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import appsBrand from "../../assets/apps-brand.jpg";
import appsRemix from "../../assets/apps-remix.jpg";
import appsBrandColor from "../../assets/apps-brand-color.jpg";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const PRODUCT_SLUG = "kit"; // Brand Palette & Creative Remix Applications
const PRICE = "$10 USD";

const includes = [
  "Brand Palette — business, personality, name, color, type, logo, copy, imagery",
  "Live brand board with print and PNG export",
  "Prompt Studio: a brand board prompt and asset prompts for any AI design tool",
  "Creative Remix — style × influence × mood, with a remix prompt",
  "Runs in the browser, no account, no AI credits",
  "Personal link by email, yours to keep",
];

function BuyButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
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
        body: JSON.stringify({ slug: PRODUCT_SLUG }),
      });
      if (!res.ok) throw new Error(`Checkout request failed (${res.status})`);
      const data = await res.json();
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong starting checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full bg-[#5816dd] text-white px-8 py-4 text-lg font-bold shadow-[0px_10px_15px_0px_rgba(0,0,0,0.25),0px_4px_6px_0px_rgba(0,0,0,0.15)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100"
    >
      {loading ? "Loading…" : "Get both apps →"}
    </button>
  );
}

export function BrandPaletteRemixPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" currentPage="get-the-goods" />

        <div className="max-w-[1100px] mx-auto px-6 py-10 lg:py-14">
          {/* 1. Title block */}
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
              Brand Palette &amp; Creative Remix
            </h1>
            <p className="mt-3 text-white/95 text-xl sm:text-2xl font-medium">
              Two prompting apps for designers.
            </p>
          </div>

          {/* 2. Hero: the two apps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 lg:mb-6">
            <img src={appsBrand} alt="Brand Palette — business, personality and a live brand board" className="block w-full aspect-[16/10] object-cover object-top rounded-2xl shadow-[0px_20px_25px_0px_rgba(0,0,0,0.15)]" />
            <img src={appsRemix} alt="Creative Remix — style, influence and mood combined into a concept and prompt" className="block w-full aspect-[16/10] object-cover object-top rounded-2xl shadow-[0px_20px_25px_0px_rgba(0,0,0,0.15)]" />
          </div>

          {/* 3. First CTA */}
          <div className="text-center mb-20 lg:mb-28">
            <p className="text-white text-lg font-bold mb-4">One payment, {PRICE}</p>
            <BuyButton />
            <p className="mt-4 text-white/80 text-sm">
              Already bought them?{" "}
              <Link to="/kit" className="underline underline-offset-4 hover:text-white">
                Open your apps
              </Link>
            </p>
          </div>

          {/* 4. Brand Palette */}
          <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-8 md:gap-10 lg:gap-14 items-center mb-20 lg:mb-28">
            <img src={appsBrandColor} alt="Brand Palette — the color step with a live brand board" className="block w-full h-auto rounded-2xl shadow-[0px_20px_25px_0px_rgba(0,0,0,0.15)]" />
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p className="font-bold">Brand Palette</p>
              <p>
                Walks you through building a brand from concept to prompt-ready briefs: what the
                business is, its personality, a name, color, type, logo direction, copy and
                imagery, with a live brand board you can print or export.
              </p>
              <p>
                The Prompt Studio turns all of it into a brand board prompt and asset prompts,
                ready for any AI design tool.
              </p>
            </div>
          </div>

          {/* 5. Creative Remix */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-center mb-20 lg:mb-28">
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left md:order-1">
              <p className="font-bold">Creative Remix</p>
              <p>
                Combines a style, an influence and a mood into concepts you wouldn't have reached
                on your own, then writes the remix prompt. Shuffle one card or all three, and save
                the combinations worth keeping.
              </p>
            </div>
            <img src={appsRemix} alt="Creative Remix" className="block w-full h-auto rounded-2xl md:order-2 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.15)]" />
          </div>

          {/* 6. Includes + CTA */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-start mb-20 lg:mb-28">
            <div className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-white text-3xl font-bold mb-6">Includes</h2>
              <ul className="space-y-2 text-white text-[16px] [font-weight:400]! text-left">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-2 inline-block size-1.5 rounded-full bg-white/80 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p className="font-bold">Both run in the browser. No account, no AI credits used.</p>
              <p>
                They pair with the free{" "}
                <a href="/palette" className="underline underline-offset-4 hover:text-white">
                  Art Direction Palette
                </a>
                , the visual thesaurus for the words you can see but can't name.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <BuyButton />
                <span className="text-white text-xl font-bold">{PRICE}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
