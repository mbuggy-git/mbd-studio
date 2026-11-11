import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import appsBrand from "../../assets/apps-brand.jpg";
import appsRemix from "../../assets/apps-remix.jpg";
import appsBrandColor from "../../assets/apps-brand-color.jpg";
import aiHandbookCover from "../../assets/AI-handbook-cover.png";
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
      className="inline-flex items-center justify-center rounded-full bg-[#F65CE1] text-[#1A0B2E] px-8 py-4 text-lg font-bold shadow-[0px_10px_15px_0px_rgba(0,0,0,0.25),0px_4px_6px_0px_rgba(0,0,0,0.15)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100"
    >
      {loading ? "Loading…" : "Get both apps →"}
    </button>
  );
}

/* ── "See it work" examples: what you pick in the app → the prompt it writes ── */

const monoLabel =
  "font-mono text-[11px] uppercase tracking-[0.2em] text-[#33243F]/60";

function Chip({ label, dot, selected }: { label: string; dot: string; selected?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 font-mono text-sm ${
        selected ? "bg-[#1a1a1a] text-white" : "bg-white/70 text-[#33243F]/55"
      }`}
    >
      <span
        aria-hidden="true"
        className="inline-block size-5 rounded-full border border-white/70 shrink-0"
        style={{ background: dot }}
      />
      {label}
    </span>
  );
}

function ExampleCard({
  app,
  left,
  prompt,
  promptLabel,
}: {
  app: string;
  left: ReactNode;
  prompt: string;
  promptLabel: string;
}) {
  return (
    <div className="rounded-2xl bg-[#DCD0F2] text-[#33243F] p-6 sm:p-8 text-left shadow-[0px_20px_25px_0px_rgba(0,0,0,0.15)] mb-20 lg:mb-28">
      <p className={monoLabel}>See it work · {app}</p>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <p className="text-xl font-bold mb-4">You choose</p>
          {left}
        </div>
        <div>
          <p className="text-xl font-bold mb-4">You get</p>
          <div className="rounded-xl bg-white/80 p-5">
            <p className={`${monoLabel} mb-3`}>{promptLabel}</p>
            <p className="font-mono text-[14px] leading-relaxed [font-weight:400]!">{prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const brandChipRows: { label: string; chips: { label: string; dot: string; selected?: boolean }[] }[] = [
  {
    label: "Personality",
    chips: [
      { label: "Playful", dot: "linear-gradient(135deg,#ff8fb1,#7fd3ff)" },
      { label: "Serene", dot: "#C9D6D2", selected: true },
      { label: "Luxurious", dot: "linear-gradient(135deg,#1a1a1a 55%,#d9a441)" },
    ],
  },
  {
    label: "Aesthetics",
    chips: [
      { label: "Editorial", dot: "#F2EDE4" },
      { label: "Botanical", dot: "#5E8B5A", selected: true },
      { label: "Art Deco", dot: "#C9A227" },
    ],
  },
  {
    label: "Brand characteristics",
    chips: [
      { label: "Handcrafted", dot: "#D9C39A", selected: true },
      { label: "Sustainable", dot: "#7FA06B" },
      { label: "Premium", dot: "#1a1a1a" },
    ],
  },
];

const kindredGlowSwatches = ["#437759", "#716F70", "#925874", "#EBE7F2", "#121A17"];

function BrandPaletteExample() {
  return (
    <ExampleCard
      app="Brand Palette"
      promptLabel="Asset prompt · Product photography"
      prompt="Generate product photography for Kindred Glow, a serene and botanical natural skincare apothecary. Soft diffused light with gentle shadows, an intimate close-up, an editorial layout-ready composition, dreamy atmosphere. Color: muted botanical green #437759, slate grey #716F70 and muted magenta #925874 accents on pale indigo #EBE7F2. Materials and props: frosted glass, stone, water droplets and botanicals. Final, polished quality."
      left={
        <div className="space-y-4">
          <div>
            <p className={`${monoLabel} mb-2`}>Business</p>
            <div className="rounded-lg bg-white/80 px-4 py-2.5 text-base">natural skincare apothecary</div>
          </div>
          {brandChipRows.map((row) => (
            <div key={row.label}>
              <p className={`${monoLabel} mb-2`}>{row.label}</p>
              <div className="flex flex-wrap gap-2">
                {row.chips.map((chip) => (
                  <Chip key={chip.label} {...chip} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className={`${monoLabel} mb-2`}>The brand it builds</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">Kindred Glow</span>
              <span className="flex">
                {kindredGlowSwatches.map((hex) => (
                  <span
                    key={hex}
                    aria-hidden="true"
                    className="inline-block size-7 rounded-full border-2 border-white -ml-1.5 first:ml-0"
                    style={{ background: hex }}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
}

const remixCards = [
  { step: "01 · Base", kind: "Style", term: "Pop Art", cues: "Ben-Day dots, bold outlines, mass culture", accent: "#A04FC4" },
  { step: "02 · Catalyst", kind: "Influence", term: "1970s NASA Manuals", cues: "technical diagrams and earnest futurism", accent: "#5F7480" },
  { step: "03 · Finish", kind: "Mood & Treatment", term: "Faded Polaroid", cues: "washed warmth and light leaks", accent: "#D9822B" },
];

function CreativeRemixExample() {
  return (
    <ExampleCard
      app="Creative Remix"
      promptLabel="Remix prompt"
      prompt="An editorial key visual, art-directed as a collision of Pop Art and 1970s NASA manuals. Style cues: Ben-Day dots, bold outlines, mass culture. Motifs and textures borrowed from 1970s NASA manuals — technical diagrams and earnest futurism. Lighting and color: faded polaroid, washed warmth and light leaks. Lean into the contrast between the loud style and the soft treatment. Dynamic low-angle perspective with strong leading lines pulling the eye inward. Polished, award-winning art direction, sharp focus, rich material detail."
      left={
        <div className="space-y-3">
          {remixCards.map((card) => (
            <div key={card.term} className="rounded-xl bg-white/80 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: card.accent }}>
                {card.step} · {card.kind}
              </p>
              <p className="mt-1 text-2xl font-bold leading-tight">{card.term}</p>
              <p className="mt-1 font-mono text-[13px] text-[#33243F]/70 [font-weight:400]!">{card.cues}</p>
            </div>
          ))}
          <div className="pt-2">
            <p className={`${monoLabel} mb-2`}>The concept</p>
            <p className="text-lg font-medium leading-snug">
              A visual as if 1970s NASA manuals were redesigned by a Pop Art studio, finished with
              washed warmth and light leaks. The tension between the two moods is the point.
            </p>
          </div>
        </div>
      }
    />
  );
}

export function BrandPaletteRemixPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#150F2B] to-[#33205F]">
        <Navigation variant="gradient" currentPage="get-the-goods" />

        <div className="max-w-[1100px] mx-auto px-6 py-10 lg:py-14">
          {/* 1. Title block */}
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
              Brand Palette &amp; Creative Remix
            </h1>
            <p className="mt-4 max-w-[820px] mx-auto text-white/95 text-lg sm:text-xl font-medium leading-relaxed">
              Two interactive creative tools to help you build cohesive brand concepts, experiment
              with unexpected visual styles, and turn your ideas into detailed prompts you can
              actually use.
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <BuyButton />
              <a
                href="/palette"
                className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-7 py-[14px] text-lg font-bold transition-all duration-200 hover:bg-white hover:text-[#5816dd] hover:-translate-y-0.5"
              >
                Free: Art Direction Palette →
              </a>
            </div>
            <p className="mt-5 text-white/90 text-base [font-weight:400]!">
              Try Art Direction Palette for art directed prompt styles, completely free.
            </p>
            <p className="mt-3 text-white/80 text-sm">
              Already bought them?{" "}
              <Link to="/kit" className="underline underline-offset-4 hover:text-white">
                Open your apps
              </Link>
            </p>
          </div>

          {/* 4. Brand Palette */}
          <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-8 md:gap-10 lg:gap-14 items-center mb-8 lg:mb-10">
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

          <BrandPaletteExample />

          {/* 5. Creative Remix */}
          <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10 lg:gap-14 items-center mb-8 lg:mb-10">
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

          <CreativeRemixExample />

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

          {/* 7. Handbook promo */}
          <div className="bg-white/10 rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 sm:gap-10 items-center">
            <Link to="/get-the-goods/ai-workflows" className="block w-[160px] sm:w-full mx-auto">
              <img src={aiHandbookCover} alt="New AI Workflows — A Creative Handbook for Designers" loading="lazy" className="block w-full h-auto rounded-lg shadow-[0px_20px_25px_0px_rgba(0,0,0,0.25)]" />
            </Link>
            <div className="text-left">
              <p className="text-white/80 text-sm font-bold uppercase tracking-[0.2em]">Also from MBD Studio</p>
              <h2 className="mt-2 text-white text-3xl font-bold">New AI Workflows</h2>
              <p className="mt-1 text-white/95 text-xl font-medium">A Creative Handbook for Designers</p>
              <p className="mt-4 text-white/95 text-[18px] [font-weight:400]! leading-relaxed">
                The thinking behind these apps, on the page. 63 pages, 6 cheat sheets and example
                prompts to give you more creative control over your AI workflows.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <Link
                  to="/get-the-goods/ai-workflows"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-7 py-3 text-lg font-bold transition-all duration-200 hover:bg-white hover:text-[#5816dd] hover:-translate-y-0.5"
                >
                  See the handbook →
                </Link>
                <span className="text-white text-xl font-bold">$9.95 USD</span>
              </div>
            </div>
          </div>

          {/* 8. Contact */}
          <p className="mt-12 lg:mt-16 text-center text-white/90 text-lg [font-weight:400]!">
            Questions about the apps?{" "}
            <a
              href="mailto:michelle@mbd.studio?subject=Brand%20Palette%20%26%20Creative%20Remix"
              className="font-bold text-white underline underline-offset-4 hover:text-[#F65CE1]"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
