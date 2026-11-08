import type { BrandState, SavedBrand } from "./types";

/** Browser-local persistence only. Nothing is synced to a server or the cloud. */
const LIBRARY_KEY = "brand-palette:library:v1";
const DRAFT_KEY = "brand-palette:draft:v1";

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
