import { SUPABASE_ANON_KEY, SUPABASE_URL, APPS_PRODUCT } from "./config";

// Purchase access for Brand Palette + Creative Remix.
// The buyer's personal token arrives as ?t=<token> (from the /kit/<token>
// page or their email) and is kept in localStorage; it's validated against
// mbd-kit-access once per browser session.

const TOKEN_KEY = "mbd-apps-token";
const VALID_KEY = "mbd-apps-valid";
const API = `${SUPABASE_URL}/functions/v1`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
};

function store(key: string, value: string | null, session = false) {
  try {
    const s = session ? sessionStorage : localStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch { /* private windows */ }
}

function read(key: string, session = false): string | null {
  try {
    return (session ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
}

/** Pull ?t= off the URL into storage, then strip it so it isn't shared by copy-paste. */
export function captureTokenFromUrl() {
  const url = new URL(window.location.href);
  const t = url.searchParams.get("t");
  if (!t) return;
  store(TOKEN_KEY, t);
  store(VALID_KEY, null, true);
  url.searchParams.delete("t");
  window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);
}

export async function checkAccess(): Promise<boolean> {
  const token = read(TOKEN_KEY);
  if (!token) return false;
  if (read(VALID_KEY, true) === token) return true;
  try {
    const res = await fetch(`${API}/mbd-kit-access?token=${encodeURIComponent(token)}`, { headers });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.ok) {
      store(VALID_KEY, token, true);
      return true;
    }
    store(TOKEN_KEY, null);
    return false;
  } catch {
    // Network failure with a stored token: don't lock a buyer out offline.
    return read(VALID_KEY, true) === token;
  }
}

export async function startCheckout(): Promise<string | null> {
  const res = await fetch(`${API}/mbd-create-checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: APPS_PRODUCT.slug }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data?.url === "string" ? data.url : null;
}

export async function resendLink(email: string): Promise<void> {
  await fetch(`${API}/mbd-kit-access`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email }),
  }).catch(() => {});
}
