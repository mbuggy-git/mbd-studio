import type { BrandState, SavedBrand } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";

/**
 * The browser keeps its own copy of everything (so the app works offline),
 * and the saved-brand library is also synced to the buyer's purchase link
 * through mbd-kit-brands. The draft stays in this browser only.
 */
const LIBRARY_KEY = "brand-palette:library:v1";
const DRAFT_KEY = "brand-palette:draft:v1";
const DELETED_KEY = "brand-palette:deleted:v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — ignore */
  }
}

export const loadLibrary = () => read<SavedBrand[]>(LIBRARY_KEY, []);
export const saveLibrary = (items: SavedBrand[]) => write(LIBRARY_KEY, items);
export const loadDraft = () => read<BrandState | null>(DRAFT_KEY, null);
export const saveDraft = (state: BrandState) => write(DRAFT_KEY, state);

/** Deleted brand ids → when, so a delete here also removes the brand on other devices. */
export type DeletedBrands = Record<string, number>;
export const loadDeleted = () => read<DeletedBrands>(DELETED_KEY, {});
export const saveDeleted = (deleted: DeletedBrands) => write(DELETED_KEY, deleted);
export const markDeleted = (id: string) => saveDeleted({ ...loadDeleted(), [id]: Date.now() });

/**
 * Send this browser's library to the server, which merges it with what is
 * stored for the purchase link and returns the result. null = couldn't sync
 * (offline, server down); the local copy is untouched either way.
 */
export async function syncLibrary(
  token: string,
  library: SavedBrand[],
  deleted: DeletedBrands,
): Promise<{ library: SavedBrand[]; deleted: DeletedBrands } | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/mbd-kit-brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ token, library, deleted }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.library)) return null;
    return { library: data.library as SavedBrand[], deleted: (data.deleted ?? {}) as DeletedBrands };
  } catch {
    return null;
  }
}
