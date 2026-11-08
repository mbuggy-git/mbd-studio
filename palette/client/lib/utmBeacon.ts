import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Same beacon as the main site (src/app/utils/utmBeacon.ts): tagged arrivals
// are counted on our own server. One per browser session per link; must
// never break the page.
export function reportUtmClick() {
  try {
    const params = new URLSearchParams(window.location.search);
    const campaign = params.get("utm_campaign");
    if (!campaign) return;
    const content = params.get("utm_content") ?? "";
    const medium = params.get("utm_medium") ?? "";
    const guard = `utm-beacon:${campaign}:${content}:${medium}`;
    if (sessionStorage.getItem(guard)) return;
    sessionStorage.setItem(guard, "1");
    fetch(`${SUPABASE_URL}/functions/v1/make-server-6ab9c767/utm-click`, {
      method: "POST",
      keepalive: true,
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaign, content, medium, path: window.location.pathname }),
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}
