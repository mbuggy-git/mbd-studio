import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// Landing page for the kit (slug "kit"). Copy and images are placeholders
// until Michelle supplies them — every [[…]] string is hers to replace, and
// each <ImageSlot> becomes an <img> from src/assets once the screenshot is in.

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const PRODUCT_SLUG = "kit";
const PRICE = "$19 USD";

const includes = [
  "Brand Palette — [[one line]]",
  "Creative Remix — [[one line]]",
  "Art Direction Palette — [[one line]]",
  "New AI Workflows handbook (63 pages, 6 cheat sheets)",
  "Personal link, no account, no expiry",
];

function ImageSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-white/50 bg-white/10 text-white/80 text-sm font-medium aspect-[16/10] ${className}`}
    >
      {label}
    </div>
  );
}

function KitButton() {
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
      {loading ? "Loading…" : "Get the Kit →"}
    </button>
  );
}

export function KitPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" currentPage="get-the-goods" />

        <div className="max-w-[1100px] mx-auto px-6 py-10 lg:py-14">
          {/* 1. Title block */}
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
              [[Kit name]]
            </h1>
            <p className="mt-3 text-white/95 text-xl sm:text-2xl font-medium">
              [[One-line subtitle]]
            </p>
          </div>

          {/* 2. Hero image */}
          <div className="mb-5 lg:mb-6">
            <ImageSlot label="Hero image — kit-hero.png" className="aspect-[21/9]" />
          </div>

          {/* 3. First CTA */}
          <div className="text-center mb-20 lg:mb-28">
            <p className="text-white text-lg font-bold mb-4">Get it now for {PRICE}</p>
            <KitButton />
            <p className="mt-4 text-white/80 text-sm">
              Already bought it?{" "}
              <Link to="/kit" className="underline underline-offset-4 hover:text-white">
                Open your kit
              </Link>
            </p>
          </div>

          {/* 4. Brand Palette */}
          <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-8 md:gap-10 lg:gap-14 items-center mb-20 lg:mb-28">
            <ImageSlot label="Brand Palette — kit-brand-palette.png" />
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p className="font-bold">Brand Palette</p>
              <p>[[What it does, who it's for — 2–3 sentences]]</p>
            </div>
          </div>

          {/* 5. Creative Remix */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-center mb-20 lg:mb-28">
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left md:order-1">
              <p className="font-bold">Creative Remix</p>
              <p>[[What it does — 2–3 sentences]]</p>
            </div>
            <ImageSlot label="Creative Remix — kit-remix.png" className="md:order-2" />
          </div>

          {/* 6. Includes + handbook */}
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
              <p className="font-bold">[[Closing statement — why the three belong together]]</p>
              <p>
                The free{" "}
                <Link to="/palette" className="underline underline-offset-4 hover:text-white">
                  Art Direction Palette
                </Link>{" "}
                is included too, so everything lives in one place.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <KitButton />
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
