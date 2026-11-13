import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, Check, Equal, Plus, Shuffle } from "lucide-react";
import { toast } from "sonner";
import handbookCover from "../../assets/ai-workflows/handbook-cover-3d.webp";
import { Navigation } from "../components/Navigation";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import "../../styles/brand-palette-remix.css";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const PRODUCT_SLUG = "kit"; // Brand Palette & Creative Remix Applications

// Space Grotesk, DM Sans and JetBrains Mono load for this page only: the rest
// of the site renders in the system font, and a global stylesheet link would
// restyle every page.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@500..700&display=swap";

function usePageFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);
}

// [bold lead, rest of the line]
const includes: [string, string][] = [
  ["Brand Palette", " — business, personality, name, color, type, logo, copy, imagery"],
  ["Live brand board", " with print and PNG export"],
  ["Prompt Studio", ": a brand board prompt and asset prompts for any AI design tool"],
  ["Creative Remix", " — style + influence + mood, with a remix prompt"],
  ["Runs in the browser", ", no account, no AI credits"],
  ["Personal link by email", ", yours to keep"],
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
    <button type="button" onClick={handleCheckout} disabled={loading} className="bpr-buy-btn">
      {loading ? "Loading…" : "Get both apps"}
      {!loading && <ArrowRight />}
    </button>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="bpr-hero">
      <p className="bpr-mono bpr-eyebrow">Visual prompt builders for designers</p>
      <h1 className="bpr-display bpr-hero-title">
        <span className="bpr-violet">Brand Palette</span>
        <span className="bpr-pink">
          <span className="bpr-amp">&amp;</span> Creative
        </span>
        <span className="bpr-pink">Remix.</span>
      </h1>
      <p className="bpr-hero-copy">
        Two interactive creative tools to help you build cohesive brand concepts, experiment with
        unexpected visual styles, and turn your ideas into detailed prompts you can actually use.
      </p>

      <div className="bpr-jump">
        <a href="#brand-palette">
          <div>
            <p className="bpr-mono">01</p>
            <h2 className="bpr-display">Brand Palette</h2>
            <p>From a business idea to prompt-ready brand briefs.</p>
          </div>
          <ArrowDownRight />
        </a>
        <a href="#creative-remix">
          <div>
            <p className="bpr-mono">02</p>
            <h2 className="bpr-display">Creative Remix</h2>
            <p>Style + influence + mood, written up as a remix prompt.</p>
          </div>
          <ArrowDownRight />
        </a>
      </div>
    </section>
  );
}

/* ── 01 Brand Palette ─────────────────────────────────────────────── */

const swatches = [
  { name: "Botanical", hex: "#437759" },
  { name: "Slate", hex: "#716F70" },
  { name: "Magenta", hex: "#925874" },
  { name: "Pale indigo", hex: "#EBE7F2", dark: true },
];

function BrandPaletteSection() {
  return (
    <section id="brand-palette" className="bpr-section">
      <div className="bpr-section-head">
        <span className="bpr-display bpr-number" aria-hidden="true">01</span>
        <div>
          <h2 className="bpr-display bpr-section-title bpr-violet">Brand Palette</h2>
          <div className="bpr-lede bpr-lede-two">
            <p>
              Walks you through building a brand from concept to prompt-ready briefs: what the
              business is, its personality, a name, color, type, logo direction, copy and imagery,
              with a live brand board you can print or export.
            </p>
            <p className="bpr-soft">
              The Prompt Studio turns all of it into a brand board prompt and asset prompts, ready
              for any AI design tool.
            </p>
          </div>
        </div>
      </div>

      <div className="bpr-demo">
        <div className="bpr-demo-bar">
          <p className="bpr-mono">See it work · Brand Palette</p>
          <p className="bpr-mono">Live brand board</p>
        </div>

        <div className="bpr-demo-body">
          <div className="bpr-demo-col">
            <h3 className="bpr-mono">You choose</h3>
            <div>
              <p className="bpr-field-label">Business</p>
              <p className="bpr-field-value">natural skincare apothecary</p>
            </div>
            <div>
              <p className="bpr-field-label">Personality</p>
              <ul className="bpr-chips bpr-chips-dark">
                <li>Playful</li>
                <li>Serene</li>
                <li>Luxurious</li>
              </ul>
            </div>
            <div>
              <p className="bpr-field-label">Aesthetics</p>
              <ul className="bpr-chips bpr-chips-mid">
                <li>Editorial</li>
                <li>Botanical</li>
                <li>Art Deco</li>
              </ul>
            </div>
            <div>
              <p className="bpr-field-label">Brand characteristics</p>
              <ul className="bpr-chips bpr-chips-light">
                <li>Handcrafted</li>
                <li>Sustainable</li>
                <li>Premium</li>
              </ul>
            </div>
          </div>

          <div className="bpr-demo-arrow" aria-hidden="true">
            <span>
              <ArrowRight />
            </span>
          </div>

          <div className="bpr-demo-col">
            <h3 className="bpr-mono">You get</h3>
            <div>
              <div className="bpr-board">
                <p className="bpr-mono">Natural skincare apothecary</p>
                <p className="bpr-board-name">Kindred Glow</p>
                <ul className="bpr-swatches">
                  {swatches.map((s) => (
                    <li key={s.hex} style={{ background: s.hex, color: s.dark ? "#33243f" : undefined }}>
                      <b>{s.name}</b>
                      <span>{s.hex}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bpr-prompt">
                <p className="bpr-mono">Asset prompt · Product photography</p>
                <p>
                  Generate product photography for Kindred Glow, a serene and botanical natural
                  skincare apothecary. Soft diffused light with gentle shadows, an intimate
                  close-up, an editorial layout-ready composition, dreamy atmosphere. Color: muted
                  botanical green #437759, slate grey #716F70 and muted magenta #925874 accents on
                  pale indigo #EBE7F2. Materials and props: frosted glass, stone, water droplets and
                  botanicals. Final, polished quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 02 Creative Remix ────────────────────────────────────────────── */

// Terms, notes and tones are the app's own (palette/client/lib/remix.ts), and
// the concept and prompt below follow its templates, so the demo writes what
// the real app would. `inline` is the name as it reads mid-sentence.
type Term = { name: string; inline: string; note: string; tone: "calm" | "bold" };

const STYLES: Term[] = [
  { name: "Pop Art", inline: "Pop Art", note: "Ben-Day dots, bold outlines, mass culture", tone: "bold" },
  { name: "Mid-century Modern", inline: "Mid-century Modern", note: "atomic optimism and walnut-toned simplicity", tone: "calm" },
  { name: "Bauhaus", inline: "Bauhaus", note: "primary shapes, strict grids, function as ornament", tone: "bold" },
];

const INFLUENCES: Term[] = [
  { name: "1970s NASA Manuals", inline: "1970s NASA manuals", note: "technical diagrams and earnest futurism", tone: "calm" },
  { name: "Laundromats at 3am", inline: "laundromats at 3am", note: "fluorescent hum and spinning drums", tone: "calm" },
  { name: "Topographic Maps", inline: "topographic maps", note: "contour lines and elevation bands", tone: "calm" },
];

const MOODS: Term[] = [
  { name: "Faded Polaroid", inline: "faded Polaroid", note: "washed warmth and light leaks", tone: "calm" },
  { name: "Neon Noir", inline: "neon noir", note: "magenta and cyan cutting through shadow", tone: "bold" },
  { name: "Risograph Grain", inline: "Risograph grain", note: "misregistered inks and speckled texture", tone: "calm" },
];

function nextRandom(current: number, length: number) {
  const step = 1 + Math.floor(Math.random() * (length - 1));
  return (current + step) % length;
}

function CreativeRemixSection() {
  const [s, setS] = useState(0);
  const [i, setI] = useState(0);
  const [m, setM] = useState(0);
  const style = STYLES[s];
  const influence = INFLUENCES[i];
  const mood = MOODS[m];
  const clash = style.tone !== mood.tone;

  const shuffleAll = () => {
    setS((v) => nextRandom(v, STYLES.length));
    setI((v) => nextRandom(v, INFLUENCES.length));
    setM((v) => nextRandom(v, MOODS.length));
  };

  const cards = [
    { label: "01 · Base · Style", term: style, tint: "", aria: "Shuffle style", next: () => setS((v) => (v + 1) % STYLES.length) },
    { label: "02 · Catalyst · Influence", term: influence, tint: "bpr-ingredient-pink", aria: "Shuffle influence", next: () => setI((v) => (v + 1) % INFLUENCES.length) },
    { label: "03 · Finish · Mood & Treatment", term: mood, tint: "bpr-ingredient-peach", aria: "Shuffle mood", next: () => setM((v) => (v + 1) % MOODS.length) },
  ];

  return (
    <section id="creative-remix" className="bpr-section">
      <div className="bpr-section-head">
        <span className="bpr-display bpr-number bpr-number-pink" aria-hidden="true">02</span>
        <div>
          <h2 className="bpr-display bpr-section-title bpr-pink">Creative Remix</h2>
          <div className="bpr-lede">
            <p>
              Combines a style, an influence and a mood into concepts you wouldn't have reached on
              your own, then writes the remix prompt. Shuffle one card or all three, and save the
              combinations worth keeping.
            </p>
          </div>
        </div>
      </div>

      <div className="bpr-remix">
        <div className="bpr-remix-top">
          <p className="bpr-mono">3 ingredients · 1 unexpected direction</p>
          <button type="button" onClick={shuffleAll} className="bpr-pill-btn">
            <Shuffle /> Shuffle all three
          </button>
        </div>

        <div className="bpr-ingredients">
          {cards.flatMap((card, index) => [
            index > 0 ? (
              <div key={`plus-${card.label}`} className="bpr-op" aria-hidden="true">
                <Plus />
              </div>
            ) : null,
            <div key={card.label} className={`bpr-ingredient ${card.tint}`}>
              <div className="bpr-ingredient-top">
                <p className="bpr-mono">{card.label}</p>
                <button type="button" aria-label={card.aria} onClick={card.next}>
                  <Shuffle />
                </button>
              </div>
              <h3 className="bpr-display">{card.term.name}</h3>
              <p>{card.term.note}</p>
            </div>,
          ])}
        </div>

        <div className="bpr-equals" aria-hidden="true">
          <i />
          <Equal />
          <i />
        </div>

        <div className="bpr-results" aria-live="polite">
          <div className="bpr-result">
            <p className="bpr-mono">The concept</p>
            <p className="bpr-concept">
              A visual as if {influence.inline} were redesigned by a {style.name} studio, finished
              with {mood.note}.{clash ? " The tension between the two moods is the point." : ""}
            </p>
          </div>
          <div className="bpr-result bpr-result-prompt">
            <p className="bpr-mono">Remix prompt</p>
            <p>
              Create an editorial key visual in the {style.name} style, drawing unexpected
              inspiration from {influence.inline}. Style cues: {style.note}. Motifs and textures
              borrowed from {influence.inline} — {influence.note}. Lighting and color: {mood.inline},{" "}
              {mood.note}.
              {clash
                ? ` Lean into the contrast between the ${style.tone === "calm" ? "restrained" : "loud"} style and the ${mood.tone === "calm" ? "soft" : "intense"} treatment.`
                : ""}{" "}
              Dynamic low-angle perspective with strong leading lines pulling the eye inward.
              Polished, award-winning art direction, sharp focus, rich material detail.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Purchase rail ────────────────────────────────────────────────── */

function PurchaseRail() {
  return (
    <aside className="bpr-rail">
      <div className="bpr-buy">
        <p className="bpr-mono">One payment · Both apps</p>
        <div className="bpr-price-row">
          <span className="bpr-display bpr-price">$10</span>
          <span>USD</span>
        </div>

        <h2 className="bpr-display">Includes</h2>
        <ul className="bpr-includes">
          {includes.map(([lead, rest]) => (
            <li key={lead}>
              <Check />
              <span>
                <b>{lead}</b>
                {rest}
              </span>
            </li>
          ))}
        </ul>

        <BuyButton />
        <p className="bpr-owned">
          Already bought them? <Link to="/kit">Open your apps</Link>
        </p>
      </div>

      <div className="bpr-free">
        <p className="bpr-mono">
          <i aria-hidden="true" />
          Free companion
        </p>
        <h3 className="bpr-display">
          Art Direction <span>Palette</span>
        </h3>
        <p>
          The visual thesaurus for the words you can see but can't name. Art-directed prompt
          styles, completely free.
        </p>
        <a href="/palette" className="bpr-free-btn">
          Free: Art Direction Palette <ArrowRight />
        </a>
      </div>
    </aside>
  );
}

/* ── Handbook promo ───────────────────────────────────────────────── */

function HandbookPromo() {
  return (
    <section className="bpr-section">
      <div className="bpr-handbook">
        <div className="bpr-handbook-glow" />
        <div className="bpr-handbook-grid">
          <Link to="/get-the-goods/ai-workflows" className="bpr-handbook-cover">
            <img
              src={handbookCover}
              alt="New AI Workflows, Second Edition — handbook cover"
              loading="lazy"
            />
          </Link>
          <div>
            <p className="bpr-mono">Also from MBD Studio</p>
            <h2 className="bpr-display">New AI Workflows</h2>
            <p className="bpr-handbook-sub">A Creative Handbook for Designers · Second Edition</p>
            <p className="bpr-handbook-copy">
              The thinking behind these apps, on the page. 60+ pages, 6 printable cheat sheets and
              example prompts to give you more creative control over your AI workflows.
            </p>
            <ul className="bpr-stats">
              <li>
                <b>60+</b>
                <span>pages</span>
              </li>
              <li>
                <b>6</b>
                <span>cheat sheets</span>
              </li>
              <li>
                <b>$9.95</b>
                <span>USD</span>
              </li>
            </ul>
            <Link to="/get-the-goods/ai-workflows" className="bpr-ghost-btn">
              See the handbook <ArrowRight />
            </Link>
          </div>
        </div>
      </div>

      <div className="bpr-outro">
        <p>
          Already bought them? <Link to="/kit">Open your apps</Link>
        </p>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export function BrandPaletteRemixPage() {
  usePageFonts();

  return (
    <div className="bpr">
      <div className="bpr-glow" />
      <div className="bpr-nav">
        <Navigation variant="gradient" currentPage="get-the-goods" />
      </div>

      <div className="bpr-page">
        <main className="bpr-grid">
          <Hero />
          <div className="bpr-rail-cell">
            <PurchaseRail />
          </div>
          <BrandPaletteSection />
          <CreativeRemixSection />
          <HandbookPromo />
        </main>

        <footer className="bpr-footer">
          <div className="bpr-footer-inner">
            <p>© 2026 MBD Studio. All rights reserved.</p>
            <ul>
              <li>
                <a href="https://www.iammbd.com" target="_blank" rel="noopener noreferrer">
                  Portfolio
                </a>
              </li>
              <li>
                <Link to="/vidpod">VidPod Studio</Link>
              </li>
              <li>
                <a href="https://youtube.com/@MakeDailyBread" target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}
