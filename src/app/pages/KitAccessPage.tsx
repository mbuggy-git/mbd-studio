import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// /kit/<token> — the buyer's personal page: opens the hosted apps (/palette/brand,
// /palette/remix) with their token.
// /kit          — no token: "lost your link" form that re-sends the email.

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;
const ACCESS_URL = `${SUPABASE_URL}/functions/v1/mbd-kit-access`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
};

const button =
  "inline-flex items-center justify-center rounded-full bg-[#5816dd] text-white px-8 py-4 text-lg font-bold shadow-[0px_10px_15px_0px_rgba(0,0,0,0.25),0px_4px_6px_0px_rgba(0,0,0,0.15)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed";

type Access =
  | { state: "loading" }
  | { state: "denied" }
  | { state: "ok" };

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" />
        <div className="max-w-[760px] mx-auto px-6 py-20 lg:py-28 text-center">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await fetch(ACCESS_URL, { method: "POST", headers, body: JSON.stringify({ email }) });
    } catch {
      /* same message either way */
    }
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <p className="text-white/95 text-[20px] leading-relaxed">
        If that email bought the kit, your link is on its way. Check spam if it
        hasn't arrived in a few minutes.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 justify-center">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email you used at checkout"
        className="rounded-full px-6 py-4 text-lg w-full sm:w-[360px] bg-white text-[#1a1a1a] outline-none focus:ring-4 focus:ring-white/40"
      />
      <button type="submit" disabled={busy} className={button}>
        {busy ? "Sending…" : "Send my link"}
      </button>
    </form>
  );
}

export function KitAccessPage() {
  const { token } = useParams<{ token?: string }>();
  const [access, setAccess] = useState<Access>({ state: token ? "loading" : "denied" });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${ACCESS_URL}?token=${encodeURIComponent(token)}`, { headers })
      .then(async (r) => {
        const data = r.ok ? await r.json() : null;
        if (cancelled) return;
        if (data?.ok) setAccess({ state: "ok" });
        else setAccess({ state: "denied" });
      })
      .catch(() => !cancelled && setAccess({ state: "denied" }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (access.state === "loading") {
    return (
      <Shell>
        <p className="text-white/95 text-xl">Opening your kit…</p>
      </Shell>
    );
  }

  if (access.state === "ok") {
    return (
      <Shell>
        <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
          Your apps
        </h1>
        <p className="mt-4 text-white/95 text-xl sm:text-2xl font-medium">
          Bookmark this page — it's yours and it doesn't expire. Opening an app once on a
          device remembers you there.
        </p>
        <div className="mt-12 flex flex-col items-center gap-6">
          <a href={`/palette/brand?t=${encodeURIComponent(token!)}`} className={button}>
            Open Brand Palette →
          </a>
          <a
            href={`/palette/remix?t=${encodeURIComponent(token!)}`}
            className="text-white font-bold underline underline-offset-4 hover:text-white/90 text-lg"
          >
            Open Creative Remix
          </a>
          <Link to="/palette" className="text-white/80 underline underline-offset-4 hover:text-white">
            Art Direction Palette (free)
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
        {token ? "That link didn't work" : "Open your apps"}
      </h1>
      <p className="mt-4 mb-10 text-white/95 text-xl sm:text-2xl font-medium">
        Enter the email you bought with and we'll send your personal link again.
      </p>
      <ResendForm />
      <p className="mt-12 text-white/80">
        Don't have the apps yet?{" "}
        <Link to="/palette/brand" reloadDocument className="font-bold underline underline-offset-4 hover:text-white">
          See Brand Palette &amp; Creative Remix
        </Link>
      </p>
    </Shell>
  );
}
