import { projectId, publicAnonKey } from "./supabase/info";

// UTM click beacon — Vercel's UTM breakdown is paywalled, so tagged arrivals
// (YouTube description / pinned comment / end screen / card links, see the
// tubelab repo's docs/mbd-studio-utm-links.md) are counted on our own server
// instead. Fire-and-forget: one beacon per browser session per link, and it
// must never break the page.
export function reportUtmClick() {
  try {
    const params = new URLSearchParams(window.location.search);
    const campaign = params.get("utm_campaign");
    if (!campaign) return;
    const content = params.get("utm_content") ?? "";
    const medium = params.get("utm_medium") ?? "";

    // Session guard so an in-tab reload or route remount doesn't double-count
    // (sessionStorage can throw in private windows — the catch covers it).
    const guard = `utm-beacon:${campaign}:${content}:${medium}`;
    if (sessionStorage.getItem(guard)) return;
    sessionStorage.setItem(guard, "1");

    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/utm-click`, {
      method: "POST",
      keepalive: true,
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaign, content, medium, path: window.location.pathname }),
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}
