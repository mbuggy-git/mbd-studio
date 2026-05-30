import { useState } from "react";
import { toast } from "sonner";
import lpSpread from "../../assets/lp-spread.png";
import lpSpread2 from "../../assets/lp-spread2.png";
import aiHandbookCover from "../../assets/AI-handbook-cover.png";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// Prefer build-time env vars (VITE_SUPABASE_*), but fall back to the public
// project constants committed in info.tsx so checkout works even when the
// Vercel build has no .env.local. Both values are public/anon — safe to ship.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const includes = [
  "63-page PDF handbook",
  "AI Model Guide",
  "AI Tool Guide",
  "Prompting Cheat Sheets",
  "Visual Direction Guide",
  "Editing Guide",
  "Reference Image Guide",
  "Practical Workflows",
  "Tons of Example Prompts",
];

function HandbookButton() {
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
      {loading ? "Loading…" : "Get the Handbook →"}
    </button>
  );
}

export function AiWorkflowsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" currentPage="get-the-goods" />

        <div className="max-w-[1100px] mx-auto px-6 py-10 lg:py-14">
          {/* 1. Title block (above hero) */}
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
              New AI Workflows
            </h1>
            <p className="mt-3 text-white/95 text-xl sm:text-2xl font-medium">
              A Creative Handbook for Designers
            </p>
          </div>

          {/* 2. Hero image */}
          <div className="mb-5 lg:mb-6">
            <img
              src={lpSpread}
              alt="New AI Workflows — handbook cover and open spread"
              className="block w-full h-auto"
            />
          </div>

          {/* 3. First CTA — "Download now for $19 USD" + button */}
          <div className="text-center mb-20 lg:mb-28">
            <p className="text-white text-lg font-bold mb-4">
              Download now for $19 USD
            </p>
            <HandbookButton />
          </div>

          {/* 4. Split block — image collage (left) / paragraphs (right) */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-center mb-20 lg:mb-28">
            <div>
              <img
                src={lpSpread2}
                alt="Inside spread of the New AI Workflows handbook"
                className="block w-full h-auto"
              />
            </div>
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p>
                You can use the same prompt twice and get completely different results. One image might be exactly what you wanted, while the next one misses the mark entirely.
              </p>
              <p>
                The difference between average results and great results isn't finding a magical prompt. It's understanding how AI models interpret direction, how different tools behave, and how to guide the outcome more effectively.
              </p>
            </div>
          </div>

          {/* 5. Includes split — Includes card (left) / paragraphs + CTA (right) */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-start mb-20 lg:mb-28">
            {/* Left: Includes card with bullets + handbook cover */}
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
                  src={aiHandbookCover}
                  alt="New AI Workflows handbook cover"
                  className="w-28 sm:w-32 h-auto"
                />
              </div>
            </div>

            {/* Right: paragraphs + inline CTA */}
            <div className="space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed text-left">
              <p>
                New AI Workflows is a practical handbook designed to help designers get better results from AI tools through prompting, editing, references, and creative workflows.
              </p>
              <p>
                Learn how to choose an AI model when prompting, how to prompt using visual direction, and what AI tools to use, to help you design smarter and faster. This handbook is packed with tips that will make your prompting so much easier and help you get results you want - fast.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <HandbookButton />
                <span className="text-white text-xl font-bold">$19 USD</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
