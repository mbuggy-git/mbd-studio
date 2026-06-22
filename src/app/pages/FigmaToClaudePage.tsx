import { useState } from "react";
import { toast } from "sonner";
import claudeBookHero from "../../assets/claude-book-hero.png";
import claudeBookSpread from "../../assets/claude-book-spread.png";
import claudeBookCover from "../../assets/claude-book-cover.png";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const PRODUCT_SLUG = "figma-to-claude";

const includes = [
  "Why I Left Figma Make",
  "Claude.ai + Claude Code Workflow",
  "Figma Make Migration Guide",
  "Setup & Tool Checklist",
  "Planning Mode Workflows",
  "GitHub & Vercel Quick Start",
  "Publishing Your App Live",
  "Cheat Sheets & Resources",
];

function GuideButton() {
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

      if (!res.ok) {
        throw new Error(`Checkout request failed (${res.status})`);
      }

      const data = await res.json();
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

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
      {loading ? "Loading…" : "Get the Guide →"}
    </button>
  );
}

export function FigmaToClaudePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" currentPage="get-the-goods" />

        <div className="max-w-[1100px] mx-auto px-6 py-10 lg:py-14">
          {/* 1. Title block */}
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
              Switch to Claude Code
            </h1>
            <p className="mt-3 text-white/95 text-xl sm:text-2xl font-medium">
              Practical guide to switching from Figma Make and still stay a designer.
            </p>
          </div>

          {/* 2. Hero image */}
          <div className="mb-5 lg:mb-6">
            <img
              src={claudeBookHero}
              alt="Claude & Me — How to Switch From Figma Make to Claude Code"
              className="block w-full h-auto"
            />
          </div>

          {/* 3. First CTA */}
          <div className="text-center mb-20 lg:mb-28">
            <p className="text-white text-lg font-bold mb-4">
              Download now for $9.95 USD
            </p>
            <GuideButton />
          </div>

          {/* 4. Split block — inside-spread image (left) / paragraphs (right) */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-center mb-20 lg:mb-28">
            <div>
              <img
                src={claudeBookSpread}
                alt="Inside spread of Claude & Me"
                className="block w-full h-auto"
              />
            </div>
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p className="font-bold">
                Figma Make is a great place to start. But eventually, iteration gets expensive.
              </p>
              <p>
                As apps become more complex, iterations get slower, costs increase, and maintaining a growing project becomes harder. <em>Claude &amp; Me</em> documents the transition I made from Figma Make to Claude Code, showing how designers can move from prototype to production without becoming traditional developers.
              </p>
            </div>
          </div>

          {/* 5. Includes split — Includes card (left) / paragraphs + CTA (right) */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-start mb-20 lg:mb-28">
            <div className="bg-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-white text-3xl font-bold mb-6">Includes</h2>
              <div className="grid grid-cols-[1fr_auto] gap-4 sm:gap-6 items-center">
                <ul className="space-y-2 text-white text-[16px] [font-weight:400]! text-left">
                  {includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2 inline-block size-1.5 rounded-full bg-white/80 shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <img
                  src={claudeBookCover}
                  alt="Claude & Me book cover"
                  className="w-28 sm:w-32 h-auto"
                />
              </div>
            </div>

            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p className="font-bold">
                The challenge isn&rsquo;t building a prototype&mdash;it&rsquo;s having a code partner you trust.
              </p>
              <p>
                Learn the workflows, tools, and mindset that helped transform web app creation from a frustrating experiment into a practical, repeatable process. Through real examples from my app TubeLab, you&rsquo;ll see how Claude.ai and Claude Code can become your strategist and builder&mdash;while you remain the designer, not the developer.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <GuideButton />
                <span className="text-white text-xl font-bold">$9.95 USD</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
