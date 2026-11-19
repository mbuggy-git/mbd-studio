import type { Swatch, TypeSlot } from "../brand/types";
import { COLOR_DIRECTIONS, TYPE_CLASSIFICATIONS, TYPE_PERSONALITY, TYPE_SHAPE } from "../brand/artVocab";
import { accentsOnDark, generatePalette } from "../brand/color";
import { newSeed, pickR, rng, sampleR, uid, type Rand } from "../brand/random";

export type TypeTab = "display" | "body" | "color";
export type TypeRole = "display" | "body";

/** One font combination being explored: a display face, a body face and its own palette. */
export type TypeOption = {
  id: string;
  display: TypeSlot;
  body: TypeSlot;
  displaySize: number;
  /** Extra display letter-spacing in 1/1000 em (design-tool units). Optional for older saved options. */
  displayTracking?: number;
  palette: Swatch[];
  /**
   * Dark-theme primary, secondary and accent the user has set by hand. A missing or null entry
   * follows the light color (see darkColors). Remixing the whole palette clears these.
   */
  darkPalette?: (string | null)[];
  colorDirection: string | null;
};

/** The dark theme's primary, secondary and accent: the user's own where set, otherwise derived from the light set. */
export function darkColors(o: TypeOption): [string, string, string] {
  const derived = accentsOnDark(o.palette);
  return [0, 1, 2].map((i) => o.darkPalette?.[i] ?? derived[i]) as [string, string, string];
}

export type TypeState = {
  options: TypeOption[];
  activeId: string;
  headline: string;
  body: string;
  /** The library entry this working state was saved to or opened from, if any. */
  savedId?: string | null;
};

export const MAX_OPTIONS = 3;
export const OPTION_LABELS = ["A", "B", "C"];
export const SIZE_MIN = 24;
export const SIZE_MAX = 200;
export const TRACKING_MIN = -150;
export const TRACKING_MAX = 400;

/** Total display letter-spacing in em: the shape's built-in spacing plus the user's kerning. */
export function displaySpacingEm(o: TypeOption, shapeSpacing?: string | number): number {
  const base = typeof shapeSpacing === "string" ? parseFloat(shapeSpacing) || 0 : 0;
  return base + (o.displayTracking ?? 0) / 1000;
}

export const DEFAULT_HEADLINE = "Letters with a point of view";
export const DEFAULT_BODY =
  "Good type is felt before it is read. Pair a confident display face with a quiet, readable companion, then test the combination in light and dark themes before it ever reaches a layout.";

const slot = (classification: string, personality: string[], shape: string[]): TypeSlot => ({
  classification,
  personality,
  shape,
  font: null,
  locked: false,
});
const sw = (hex: string): Swatch => ({ hex, locked: false });

const STARTERS: Omit<TypeOption, "id">[] = [
  {
    display: slot("Serif", ["Elegant", "Editorial"], ["High contrast"]),
    body: slot("Sans serif", ["Friendly"], ["Regular"]),
    displaySize: 88,
    palette: [sw("#954b9d"), sw("#e0a458"), sw("#f2545b"), sw("#f8f1f8"), sw("#2a1230")],
    colorDirection: null,
  },
  {
    display: slot("Display", ["Retro", "Expressive"], ["Heavy"]),
    body: slot("Serif", ["Editorial"], ["Regular"]),
    displaySize: 96,
    palette: [sw("#1f3a5f"), sw("#98c1d9"), sw("#ee6c4d"), sw("#f4f1ea"), sw("#141a24")],
    colorDirection: null,
  },
  {
    display: slot("Sans serif", ["Geometric", "Experimental"], ["Extended", "Bold"]),
    body: slot("Monospace", ["Geometric"], ["Regular"]),
    displaySize: 72,
    palette: [sw("#0b6e4f"), sw("#e9c46a"), sw("#e76f51"), sw("#f5efe2"), sw("#1b1f1a")],
    colorDirection: null,
  },
];

export function createOption(index: number): TypeOption {
  const base = STARTERS[index % STARTERS.length];
  return JSON.parse(JSON.stringify({ ...base, id: uid() })) as TypeOption;
}

/** Clear all: wipes every choice on an option back to a neutral blank slate (keeps its id). */
export function clearOption(o: TypeOption): TypeOption {
  return {
    id: o.id,
    display: slot("Serif", [], []),
    body: slot("Sans serif", [], []),
    displaySize: 88,
    displayTracking: 0,
    palette: [sw("#3f3f46"), sw("#71717a"), sw("#a1a1aa"), sw("#fafafa"), sw("#18181b")],
    colorDirection: null,
  };
}

export function remixSlot(role: TypeRole, current: TypeSlot, r: Rand): TypeSlot {
  if (current.locked) return current;
  return {
    ...current,
    classification:
      role === "body" ? pickR(r, ["Sans serif", "Serif", "Monospace", "Slab serif"]) : pickR(r, TYPE_CLASSIFICATIONS).name,
    personality: sampleR(r, TYPE_PERSONALITY, 2).map((x) => x.name),
    shape: sampleR(r, TYPE_SHAPE, role === "body" ? 1 : 2).map((x) => x.name),
    font: null,
  };
}

/** Surprise Me: new display + body faces and a fresh palette; locked pieces stay. */
export function remixOption(o: TypeOption): TypeOption {
  const r = rng(newSeed());
  return {
    ...o,
    display: remixSlot("display", o.display, r),
    body: remixSlot("body", o.body, r),
    palette: generatePalette(o.colorDirection ?? pickR(r, COLOR_DIRECTIONS).name, o.palette, r),
    darkPalette: undefined,
  };
}

const KEY = "type-palette-v1";

/** Clear all / New palette: one blank option and the default preview copy. */
export function blankState(): TypeState {
  const first = clearOption(createOption(0));
  return { options: [first], activeId: first.id, headline: DEFAULT_HEADLINE, body: DEFAULT_BODY, savedId: null };
}

export function initialState(): TypeState {
  const first = createOption(0);
  return { options: [first], activeId: first.id, headline: DEFAULT_HEADLINE, body: DEFAULT_BODY };
}

export function loadState(): TypeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as TypeState;
      if (Array.isArray(s.options) && s.options.length && typeof s.headline === "string" && typeof s.body === "string") {
        const options = s.options.slice(0, MAX_OPTIONS);
        return { ...s, options, activeId: options.some((o) => o.id === s.activeId) ? s.activeId : options[0].id };
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return initialState();
}

export function saveState(s: TypeState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full or unavailable */
  }
}
