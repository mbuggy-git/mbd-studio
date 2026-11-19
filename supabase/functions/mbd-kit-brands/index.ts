import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Brand Palette library sync.
//   POST { token, library, deleted } → { ok, library, deleted }
// The browser sends everything it has; this merges it into the row stored for
// that purchase and returns the merged result. Merging here (not in the
// browser) means two devices can never overwrite each other: a brand only
// leaves the library when it was deleted on purpose.
// Env: MBD_SUPABASE_SERVICE_ROLE_KEY.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KIT_SLUG = "kit";
const MAX_BODY_BYTES = 3_000_000;
const MAX_BRANDS = 300;
const MAX_TOMBSTONES = 500;

type Saved = { id: string; name: string; savedAt: number; updatedAt?: number; state: unknown };
type Deleted = Record<string, number>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** When a saved brand last changed (a rename moves updatedAt, not savedAt). */
const stamp = (b: Saved) => Number(b.updatedAt ?? b.savedAt) || 0;

function cleanLibrary(value: unknown): Saved[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (b): b is Saved =>
      !!b && typeof b === "object" &&
      typeof b.id === "string" && b.id.length > 0 && b.id.length < 100 &&
      typeof b.name === "string" &&
      typeof b.savedAt === "number" &&
      !!b.state && typeof b.state === "object",
  );
}

function cleanDeleted(value: unknown): Deleted {
  const out: Deleted = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return out;
  for (const [id, at] of Object.entries(value as Record<string, unknown>)) {
    if (typeof at === "number" && id.length < 100) out[id] = at;
  }
  return out;
}

function merge(stored: Saved[], incoming: Saved[], storedDel: Deleted, incomingDel: Deleted) {
  const deleted: Deleted = { ...storedDel };
  for (const [id, at] of Object.entries(incomingDel)) deleted[id] = Math.max(deleted[id] ?? 0, at);

  const storedById = new Map(stored.map((b) => [b.id, b]));
  const seen = new Set<string>();
  const library: Saved[] = [];
  // The browser's order first (newer copy of each brand wins; a tie keeps the stored one)…
  for (const b of incoming) {
    if (seen.has(b.id)) continue;
    seen.add(b.id);
    const s = storedById.get(b.id);
    library.push(s && stamp(s) >= stamp(b) ? s : b);
  }
  // …then brands this browser hasn't seen yet.
  for (const s of stored) if (!seen.has(s.id)) library.push(s);

  // A delete wins unless the brand was saved again afterwards.
  const kept = library.filter((b) => !(deleted[b.id] !== undefined && deleted[b.id] >= stamp(b)));

  const trimmedDeleted = Object.fromEntries(
    Object.entries(deleted).sort((a, b) => b[1] - a[1]).slice(0, MAX_TOMBSTONES),
  );
  return { library: kept, deleted: trimmedDeleted };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://agzfmgsgcfngpzbcfsbh.supabase.co";
  const serviceKey = Deno.env.get("MBD_SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return json({ error: "Server not configured" }, 500);
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: "Library too large" }, 413);

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Bad request" }, 400);
    }

    const token = typeof body.token === "string" ? body.token : "";
    if (token.length < 20) return json({ ok: false }, 401);

    const { data: purchase } = await supabase
      .from("mbd_purchases")
      .select("id")
      .eq("access_token", token)
      .eq("product_slug", KIT_SLUG)
      .maybeSingle();
    if (!purchase) return json({ ok: false }, 401);

    const { data: row, error: readError } = await supabase
      .from("mbd_kit_brands")
      .select("library, deleted")
      .eq("purchase_id", purchase.id)
      .maybeSingle();
    if (readError) throw readError;

    const merged = merge(
      cleanLibrary(row?.library),
      cleanLibrary(body.library),
      cleanDeleted(row?.deleted),
      cleanDeleted(body.deleted),
    );
    if (merged.library.length > MAX_BRANDS) return json({ error: "Library too large" }, 413);

    const { error: writeError } = await supabase.from("mbd_kit_brands").upsert({
      purchase_id: purchase.id,
      library: merged.library,
      deleted: merged.deleted,
      updated_at: new Date().toISOString(),
    });
    if (writeError) throw writeError;

    return json({ ok: true, ...merged });
  } catch (error) {
    console.error("mbd-kit-brands error:", error);
    return json({ error: "Could not sync brands" }, 500);
  }
});
