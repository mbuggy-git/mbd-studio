import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  Cpu,
  FileText,
  Globe,
  Images,
  Lightbulb,
  Paperclip,
  PlayCircle,
  ShoppingCart,
  Wand2,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import lighthouse1 from "../../assets/ai-workflows/lighthouse-1.jpg";
import lighthouse2 from "../../assets/ai-workflows/lighthouse-2.jpg";
import lighthouse3 from "../../assets/ai-workflows/lighthouse-3.jpg";
import parisSunset from "../../assets/ai-workflows/paris-sunset.webp";
import sheetReference from "../../assets/ai-workflows/cheat-sheet-reference.webp";
import sheetVisualDirection from "../../assets/ai-workflows/cheat-sheet-visual-direction.webp";
import sheetPrompting from "../../assets/ai-workflows/cheat-sheet-prompting.webp";
import mbdLogo from "../../assets/ai-workflows/mbd-studio-logo.png";
import handbookCover from "../../assets/ai-workflows/handbook-cover-3d.webp";
import { Navigation } from "../components/Navigation";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import "../../styles/ai-workflows.css";

// Prefer build-time env vars (VITE_SUPABASE_*), but fall back to the public
// project constants committed in info.tsx so checkout works even when the
// Vercel build has no .env.local. Both values are public/anon — safe to ship.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const PRICE = "$9.95";

// Oswald + DM Sans load for this page only: the rest of the site renders in
// the system font, and a global stylesheet link would restyle every page.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Oswald:wght@600;700&display=swap";

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

/** One Stripe checkout for every buy button on the page. */
function useCheckout() {
  const [loading, setLoading] = useState(false);

  async function start() {
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

  return { loading, start };
}

const chapters = [
  { title: "Introduction — You're Still the Designer", page: "03", note: "Why prompting is art direction, not technical writing." },
  { title: "Why AI Results Feel Random", page: "07", note: "Noise, interpretation, and reading results as feedback." },
  { title: "Practical Prompting with AI Models", page: "13", note: "Controlled vs. open prompting, starting with the main idea." },
  { title: "Choosing the Right AI Tool & Model", page: "24", note: "Firefly, GPT Image, Nano Banana, HUMAIN — what each does best." },
  { title: "Editing Images with AI Tools", page: "37", note: "Keep what works, fix what doesn't, skip the endless re-rolls." },
  { title: "Practical Examples and Workflows", page: "53", note: "Example prompts, plus Firefly Boards as a visual project library." },
  { title: "Cheat Sheets", page: "56", note: "Printable references to keep beside your desk." },
  { title: "YouTube Videos", page: "63", note: "Step-by-step tutorials that go deeper." },
];

const sheets = [
  { icon: Camera, title: "Visual direction", note: "Camera angle, framing, lighting, composition, depth of field and perspective — six shots, one subject." },
  { icon: Cpu, title: "AI model guide", note: "Firefly Image 5, GPT Image 2.6, Nano Banana 2.1 and more — matched to what each does best." },
  { icon: Wand2, title: "AI tool guide", note: "Firefly Generations, Image Editor, Boards, Design, AI Assistant and Photoshop — when to reach for each." },
  { icon: Images, title: "Editing + reference images", note: "Change color, change a pose, add a subject. Borrowing an attribute? Mention the reference. Adding a thing? Just name it." },
];

const features = [
  { icon: FileText, title: "Cheat sheets", note: "Six printable references to keep handy." },
  { icon: Lightbulb, title: "Examples", note: "Practical prompts you can adapt." },
  { icon: PlayCircle, title: "Videos", note: "Tutorials that go deeper." },
];

export function AiWorkflowsPage() {
  usePageFonts();
  const { loading, start } = useCheckout();

  return (
    <div className="aiw">
      <div className="aiw-nav">
        <Navigation variant="gradient" currentPage="get-the-goods" />
      </div>

      <main>
        {/* Hero */}
        <section id="top">
          <div className="aiw-hero-glow" />
          <div className="aiw-hero-fade" />
          <p aria-hidden="true" className="aiw-hero-ghost">Prompt</p>

          <div className="aiw-wrap aiw-hero-grid">
            <div>
              <p className="aiw-label aiw-pill">PDF ebook · 60+ pages · {PRICE}</p>
              <h1 className="aiw-display aiw-hero-title">
                New AI <span className="aiw-pink">Workflows</span>
              </h1>
              <div className="aiw-rule" style={{ marginTop: 24 }} />
              <p className="aiw-heading aiw-hero-sub">A creative handbook for designers</p>
              <p className="aiw-body aiw-muted aiw-hero-copy">
                Same prompt, four different lighthouses. Learn why AI results feel random — and how to
                direct them like an art director, choose the right model, and edit your way to polished,
                believable images.
              </p>
              <div className="aiw-actions">
                <button type="button" onClick={start} disabled={loading} className="aiw-btn aiw-btn-primary">
                  {loading ? "Loading…" : `Buy the handbook — ${PRICE}`}
                  <ArrowRight />
                </button>
                <a href="#inside" className="aiw-btn aiw-btn-ghost">
                  See what's inside
                  <ArrowDown />
                </a>
              </div>
              <ul className="aiw-stats">
                <li><span className="aiw-heading">8</span><span className="aiw-caption aiw-muted">Chapters</span></li>
                <li><span className="aiw-heading">9</span><span className="aiw-caption aiw-muted">AI models compared</span></li>
                <li><span className="aiw-heading">6</span><span className="aiw-caption aiw-muted">Cheat sheets</span></li>
              </ul>
            </div>

            {/* Each source image is a full handbook page; the offsets zoom into its photo. */}
            <div className="aiw-collage">
              <div className="aiw-circle aiw-circle-1">
                <img src={lighthouse1} alt="Striped lighthouse beside a winding road at sunset" style={{ width: "267.5%", left: "-24.6%", top: "-41.6%" }} />
              </div>
              <div className="aiw-circle aiw-circle-2">
                <img src={lighthouse2} alt="Aerial view of a coastal road winding to a lighthouse at sunset" style={{ width: "260.9%", left: "-138.8%", top: "-143%" }} />
              </div>
              <div className="aiw-circle aiw-circle-3">
                <img src={lighthouse3} alt="White lighthouse above a curving seaside road at sunset" style={{ width: "275.3%", left: "-20.9%", top: "-238.8%" }} />
              </div>
              <img src={mbdLogo} alt="MBD Studio logo" className="aiw-collage-logo" />
              <div className="aiw-quote">
                <p className="aiw-caption aiw-muted">Same prompt</p>
                <p className="aiw-body">“A winding coastal road leading to a lighthouse at sunset”</p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="aiw-section">
          <div className="aiw-wrap aiw-two aiw-intro">
            <div>
              <p className="aiw-label aiw-pink">01 — Introduction</p>
              <h2 className="aiw-display" style={{ marginTop: 16 }}>You're still <span className="aiw-pink">the designer.</span></h2>
            </div>
            <div className="aiw-intro-copy">
              <p className="aiw-body aiw-lead">
                AI tools can feel random. Type the same prompt twice and you get two completely different
                results — one polished and cinematic, the next overprocessed and awkward.
              </p>
              <p className="aiw-body aiw-muted">
                The difference between average and strong results isn't a magical prompt. It's
                understanding how models interpret direction, how different tools behave, and how to
                guide the result intentionally. Not by overcomplicating prompting. Not by treating AI
                like code. By treating it like a creative process.
              </p>
              <div className="aiw-banner">
                <Paperclip className="aiw-clip" strokeWidth={1.5} />
                <p className="aiw-heading">AI tools are interpretive. They're not exact.</p>
                <p className="aiw-body">That means creativity still matters.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section id="inside" className="aiw-section aiw-chapters">
          <div className="aiw-chapters-fade" />
          <div className="aiw-wrap aiw-two aiw-chapters-grid">
            <div className="aiw-chapters-aside">
              <p className="aiw-label aiw-pink">What's inside</p>
              <h2 className="aiw-display">Eight chapters. <span className="aiw-pink">Zero magic prompts.</span></h2>
              <div className="aiw-shot">
                <img src={parisSunset} alt="Red-haired woman in pink sunglasses and a satin trench on a Paris street at sunset, the Eiffel Tower behind her" loading="lazy" />
                <p className="aiw-caption">Style edits · Chapter 5</p>
              </div>
            </div>
            <ol className="aiw-chapter-list">
              {chapters.map((chapter, index) => (
                <li key={chapter.page} className="aiw-chapter">
                  <span className="aiw-heading aiw-chapter-num">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="aiw-heading">{chapter.title}</h3>
                    <p className="aiw-body aiw-muted">{chapter.note}</p>
                  </div>
                  <span className="aiw-label aiw-muted aiw-chapter-page">p. {chapter.page}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cheat sheets */}
        <section id="cheat-sheets" className="aiw-section aiw-sheets">
          <div className="aiw-sheets-glow" />
          <div className="aiw-wrap">
            <div className="aiw-two aiw-sheets-head">
              <div>
                <p className="aiw-label aiw-pink">04 — Cheat sheets</p>
                <h2 className="aiw-display" style={{ marginTop: 16 }}>
                  Six sheets. <span className="aiw-pink">Keep ’em handy.</span>
                </h2>
                <div className="aiw-rule" />
              </div>
              <p className="aiw-body aiw-sheets-lead">
                Printable, at-a-glance references collected at the back of the handbook — and dropped in
                along the way, right where you need them. Keep them handy and stop guessing what to type
                next.
              </p>
            </div>

            <div className="aiw-sheets-body">
              <figure className="aiw-peek">
                <div className="aiw-peek-blob aiw-peek-blob-a" />
                <div className="aiw-peek-blob aiw-peek-blob-b" />
                <img src={sheetReference} alt="Preview of the Reference Image cheat sheet" className="aiw-peek-1" loading="lazy" />
                <img src={sheetVisualDirection} alt="Preview of the Visual Direction cheat sheet" className="aiw-peek-2" loading="lazy" />
                <img src={sheetPrompting} alt="Preview of the Prompting cheat sheet" className="aiw-peek-3" loading="lazy" />
                <figcaption className="aiw-label">Sneak peek — 3 of 6 sheets</figcaption>
              </figure>

              <ul className="aiw-sheet-list">
                {sheets.map(({ icon: Icon, title, note }) => (
                  <li key={title} className="aiw-sheet">
                    <Icon />
                    <div>
                      <h3 className="aiw-heading">{title}</h3>
                      <p className="aiw-body">{note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" onClick={start} disabled={loading} className="aiw-btn aiw-btn-primary aiw-sheets-cta">
              {loading ? "Loading…" : `All six sheets included — ${PRICE}`}
              <ArrowRight />
            </button>
          </div>
        </section>

        {/* Get your copy */}
        <section id="get" className="aiw-section">
          <div className="aiw-get-glow" />
          <div className="aiw-wrap aiw-two aiw-get">
            <div>
              <p className="aiw-label aiw-pink">Get your copy</p>
              <h2 className="aiw-display">Design faster. <span className="aiw-pink">Design smarter.</span></h2>
              <ul className="aiw-features">
                {features.map(({ icon: Icon, title, note }) => (
                  <li key={title} className="aiw-feature">
                    <Icon />
                    <h3 className="aiw-heading">{title}</h3>
                    <p className="aiw-body">{note}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="aiw-buy">
              <img src={handbookCover} alt="New AI Workflows, Second Edition — handbook cover" className="aiw-buy-cover" loading="lazy" />
              <div className="aiw-buy-top">
                <p className="aiw-label">New AI Workflows · Second Edition</p>
                <div className="aiw-price-row">
                  <p className="aiw-price">{PRICE}</p>
                  <p className="aiw-caption">USD · PDF download link by email</p>
                </div>
              </div>
              <ul className="aiw-checks">
                <li><Check />60+ page handbook, 8 chapters</li>
                <li><Check />6 printable cheat sheets</li>
                <li><Check />Model + tool guides and practical examples</li>
              </ul>
              <div className="aiw-buy-action">
                <button type="button" onClick={start} disabled={loading} className="aiw-btn aiw-btn-dark">
                  <ShoppingCart />
                  {loading ? "Loading…" : `Buy now — ${PRICE}`}
                </button>
                <p className="aiw-caption">Secure checkout.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Author footer */}
      <footer id="author" className="aiw-author">
        <div className="aiw-wrap">
          <div className="aiw-author-grid">
            <img src={mbdLogo} alt="MBD Studio logo" className="aiw-author-logo" loading="lazy" />
            <div>
              <h2 className="aiw-display">Thank you!</h2>
              <p className="aiw-body aiw-author-sub">I'd love to see what you come up with.</p>
            </div>
            <ul className="aiw-links">
              <li>
                <a href="https://youtube.com/@mbd-studio-design" target="_blank" rel="noreferrer">
                  <Youtube />@mbd-studio-design <span className="aiw-tag">Tutorials!</span>
                </a>
              </li>
              <li>
                <a href="https://mbd.studio" target="_blank" rel="noreferrer">
                  <Globe />mbd.studio
                </a>
              </li>
            </ul>
          </div>
          <div className="aiw-legal">
            <p className="aiw-caption">© 2026 MBD Studio. New AI Workflows — A Creative Handbook for Designers.</p>
            <p className="aiw-caption">You're still the designer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
