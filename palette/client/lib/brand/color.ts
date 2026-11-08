import type { Swatch } from "./types";
import { pickR, type Rand } from "./random";

export const PALETTE_ROLES = ["Primary", "Secondary", "Accent", "Light neutral", "Deep neutral"];

/** Accepts "#abc", "abc", "#aabbcc" or "aabbcc". Returns normalized "#aabbcc" or null. */
export function normalizeHex(input: string): string | null {
  const v = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(v)) return `#${v.split("").map((ch) => ch + ch).join("")}`.toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(v)) return `#${v}`.toLowerCase();
  return null;
}

export function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.max(0, Math.min(100, s)) / 100;
  const ll = Math.max(0, Math.min(100, l)) / 100;
  const k = (n: number) => (n + hh / 30) % 12;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

export function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Readable text color on top of a swatch. */
export const inkOn = (hex: string) => (luminance(hex) > 0.36 ? "#24182f" : "#fbf8ff");

/** Plain-language color name for prompts and Brand DNA. */
export function colorName(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  if (l < 9) return "near-black";
  if (l > 95 && s < 40) return "soft white";
  if (s < 10) return l > 80 ? "pale grey" : l > 55 ? "stone grey" : l > 28 ? "slate grey" : "charcoal";
  if (h >= 15 && h < 48 && l < 45 && s < 75) return l < 25 ? "dark chocolate brown" : "warm brown";
  if (h >= 30 && h < 60 && l > 82) return s < 45 ? "warm ivory" : "buttercream";
  const hues: [number, string][] = [
    [10, "red"], [22, "coral"], [38, "orange"], [50, "amber"], [62, "golden yellow"], [80, "olive"],
    [110, "leaf green"], [150, "botanical green"], [175, "teal"], [195, "aqua"], [215, "sky blue"],
    [240, "blue"], [262, "indigo"], [285, "violet"], [310, "plum"], [335, "magenta"], [352, "rose"], [361, "red"],
  ];
  const base = hues.find(([max]) => h < max)?.[1] ?? "red";
  const tone = l < 22 ? "deep " : l > 78 ? "pale " : s < 30 ? "muted " : s > 80 && l > 40 && l < 65 ? "vivid " : "";
  return `${tone}${base}`.trim();
}

type Hsl = [number, number, number];

const RECIPES: Record<string, (h: number) => Hsl[]> = {
  Earthy: (h) => [[h, 38, 34], [h + 60, 26, 44], [h - 18, 52, 54], [h + 10, 28, 91], [h, 30, 15]],
  Vibrant: (h) => [[h, 86, 52], [h + 120, 78, 50], [h + 210, 88, 58], [h + 30, 50, 95], [h + 240, 50, 14]],
  Muted: (h) => [[h, 22, 46], [h + 40, 18, 58], [h + 180, 20, 52], [h, 14, 90], [h, 18, 19]],
  Pastel: (h) => [[h, 72, 82], [h + 60, 60, 84], [h + 180, 55, 82], [h + 30, 70, 95], [h + 200, 28, 26]],
  Monochromatic: (h) => [[h, 55, 44], [h, 45, 62], [h, 58, 78], [h, 30, 94], [h, 50, 15]],
  Analogous: (h) => [[h, 62, 47], [h + 30, 56, 55], [h - 30, 54, 58], [h + 15, 35, 93], [h, 40, 14]],
  Complementary: (h) => [[h, 60, 44], [h + 180, 66, 52], [h + 165, 40, 72], [h, 20, 93], [h, 35, 13]],
  Warm: (h) => [[h, 66, 47], [h + 24, 72, 58], [h - 18, 58, 38], [h + 36, 62, 92], [h - 8, 40, 15]],
  Cool: (h) => [[h, 50, 40], [h + 28, 42, 56], [h - 42, 44, 70], [h, 26, 94], [h + 10, 50, 13]],
  "Jewel Tones": (h) => [[h, 66, 32], [h + 120, 60, 30], [h + 240, 55, 36], [h + 40, 36, 92], [h, 30, 11]],
};

const BASE_HUES: Record<string, number[]> = {
  Earthy: [22, 30, 36, 88, 100],
  Warm: [6, 14, 22, 32, 40],
  Cool: [185, 200, 214, 228, 172],
  "Jewel Tones": [150, 220, 285, 345, 40],
};

export const DIRECTION_NAMES = Object.keys(RECIPES);

/**
 * Generates a five-color palette for a direction. Locked swatches are returned untouched;
 * the first locked color anchors the hue so new colors relate to it.
 */
export function generatePalette(direction: string, current: Swatch[], r: Rand): Swatch[] {
  const recipe = RECIPES[direction] ?? RECIPES.Analogous;
  const lockedIndex = current.findIndex((s) => s.locked);
  let base: number;
  if (lockedIndex >= 0) {
    const [lh] = hexToHsl(current[lockedIndex].hex);
    const offset = recipe(0)[lockedIndex][0];
    base = lh - offset;
  } else {
    base = BASE_HUES[direction] ? pickR(r, BASE_HUES[direction]) : Math.floor(r() * 360);
  }
  const fresh = recipe(base).map(([h, s, l]) =>
    hslToHex(h + (r() * 14 - 7), s + (r() * 12 - 6), l + (r() * 8 - 4))
  );
  return ensureReadable(current.map((sw, i) => (sw.locked ? sw : { hex: fresh[i], locked: false })));
}

const TEXT_AA = 4.5;

/** Nudge a color's lightness until it reads against `surface` at `target`, keeping hue and saturation. */
function fitContrast(hex: string, surface: string, target: number, darken: boolean): string {
  let [h, s, l] = hexToHsl(hex);
  let out = hex;
  for (let i = 0; i < 40 && contrastRatio(out, surface) < target; i++) {
    l += darken ? -2 : 2;
    if (l < 0 || l > 100) break;
    out = hslToHex(h, s, l);
  }
  return out;
}

/**
 * The primary, lightened until it reads on the deep neutral — the dark-mode tint of the same hue.
 * Derived, never stored: it follows whatever the primary and deep neutral currently are.
 */
export function primaryOnDark(palette: Swatch[]): string {
  return fitContrast(palette[0].hex, palette[4].hex, TEXT_AA, false);
}

/**
 * Every generated palette is usable as text: the light neutral is kept light and the deep
 * neutral deep, and primary / secondary / accent are darkened until each reads on the light
 * neutral at 4.5:1. Locked swatches are left exactly as the user set them.
 */
export function ensureReadable(palette: Swatch[]): Swatch[] {
  const out = palette.map((sw) => ({ ...sw }));
  const [light, deep] = [out[3], out[4]];
  if (!light.locked) {
    const [h, s] = hexToHsl(light.hex);
    if (luminance(light.hex) < 0.8) light.hex = hslToHex(h, Math.min(s, 30), 94);
  }
  if (!deep.locked) {
    const [h, s] = hexToHsl(deep.hex);
    if (luminance(deep.hex) > 0.03) deep.hex = hslToHex(h, Math.min(s, 40), 9);
  }
  for (const i of [0, 1, 2]) {
    if (!out[i].locked) out[i].hex = fitContrast(out[i].hex, light.hex, TEXT_AA, true);
  }
  return out;
}
