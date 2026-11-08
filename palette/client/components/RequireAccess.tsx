import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { captureTokenFromUrl, checkAccess, resendLink, startCheckout } from "../lib/access";
import { APPS_PRODUCT, SITE_URL } from "../lib/config";
import shotBrand from "../assets/shot-brand.jpg";
import shotRemix from "../assets/shot-remix.jpg";

type State = "checking" | "ok" | "locked";

/** Wraps Brand Palette and Creative Remix: shows the apps to buyers, the pitch to everyone else. */
export function RequireAccess({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    captureTokenFromUrl();
    let live = true;
    checkAccess().then((ok) => live && setState(ok ? "ok" : "locked"));
    return () => {
      live = false;
    };
  }, []);

  if (state === "ok") return <>{children}</>;
  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#614a8a]">
        <p className="p-ds-2xl font-caption text-caption text-[#cfcfe6]">Opening…</p>
      </main>
    );
  }
  return <Locked />;
}

function Locked() {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function buy() {
    if (busy) return;
    setBusy(true);
    const url = await startCheckout();
    if (url) window.location.href = url;
    else setBusy(false);
  }

  async function resend(e: FormEvent) {
    e.preventDefault();
    await resendLink(email);
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#614a8a]">
      <div className="mx-auto max-w-[920px] px-ds-xl py-ds-3xl">
        <p className="font-caption text-caption font-medium uppercase tracking-[0.24em] text-[#cfcfe6]">
          Brought to you by{" "}
          <a href={SITE_URL} className="underline underline-offset-4 hover:text-[#f3eefa]">MBD.studio</a>
        </p>
        <h1 className="mt-ds-md font-display text-[48px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#f3eefa] xl:text-[80px]">
          Brand Palette <em className="not-italic text-[#d9cade]">&amp;</em> Creative Remix
        </h1>

        <div className="mt-ds-2xl grid gap-ds-xl lg:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-border bg-[#ccb7ed]">
            <img src={shotBrand} alt="Brand Palette — business, personality and a live brand board" className="block aspect-[16/10] w-full object-cover object-top" loading="lazy" />
            <div className="p-ds-xl">
            <h2 className="font-heading text-[24px] font-semibold text-[#2b2140]">Brand Palette</h2>
            <p className="mt-ds-sm text-body text-[#3d3354]">
              Build a brand from concept to prompt-ready briefs: personality, color, type, logo
              direction, imagery, with a live brand board you can export.
            </p>
            </div>
          </section>
          <section className="overflow-hidden rounded-xl border border-border bg-[#ccb7ed]">
            <img src={shotRemix} alt="Creative Remix — style, influence and mood combined into a concept and prompt" className="block aspect-[16/10] w-full object-cover object-top" loading="lazy" />
            <div className="p-ds-xl">
            <h2 className="font-heading text-[24px] font-semibold text-[#2b2140]">Creative Remix</h2>
            <p className="mt-ds-sm text-body text-[#3d3354]">
              Combine style, influence and mood into concepts you wouldn't have reached on your
              own, then turn the combination into a prompt.
            </p>
            </div>
          </section>
        </div>

        <p className="mt-ds-xl max-w-xl text-body text-[#cfcfe6]">
          Both run in the browser. No account, no AI credits used. One payment, a personal link
          by email, yours to keep.
        </p>

        <div className="mt-ds-lg flex flex-wrap items-center gap-ds-md">
          <button type="button" onClick={buy} disabled={busy} className="ds-button ds-button-primary h-[48px] rounded-full px-ds-xl text-[16px]">
            {busy ? "Opening checkout…" : `Get both apps — ${APPS_PRODUCT.price}`}
          </button>
          <Link to="/" className="font-label text-[16px] text-[#cfcfe6] underline underline-offset-4 hover:text-[#f3eefa]">
            Back to the free Art Direction Palette
          </Link>
        </div>

        <div className="mt-ds-3xl border-t border-border pt-ds-xl">
          <h2 className="font-heading text-[20px] font-semibold text-[#f3eefa]">Already bought the apps?</h2>
          {sent ? (
            <p className="mt-ds-sm text-body text-[#cfcfe6]">
              If that email bought the apps, your link is on its way. Check spam if it hasn't arrived in a few minutes.
            </p>
          ) : (
            <form onSubmit={resend} className="mt-ds-sm flex flex-wrap items-center gap-ds-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email you used at checkout"
                className="ds-input h-[44px] w-full max-w-sm rounded-lg bg-[#f3eefa] px-ds-md text-[#2b2140]"
              />
              <button type="submit" className="ds-button h-[44px] rounded-lg px-ds-lg">Send my link</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
