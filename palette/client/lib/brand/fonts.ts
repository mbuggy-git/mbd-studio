import type { CSSProperties } from "react";
import type { TypeSlot } from "./types";
import { findTerm } from "./vocab";

export type FontInfo = {
  name: string;
  classification: string;
  tags: string[];
  stack: string;
  note: string;
  body?: boolean;
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, 'Helvetica Neue', Arial, sans-serif";
const SLAB = "Rockwell, 'Courier New', Georgia, serif";
const SCRIPT = "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', cursive";
const MONO = "'Space Mono', ui-monospace, Menlo, monospace";

const f = (name: string, classification: string, tags: string[], fallback: string, note: string, body = false): FontInfo => ({
  name,
  classification,
  tags,
  stack: `'${name}', ${fallback}`,
  note,
  body,
});

/** Open-source families (all published on Google Fonts) chosen for reliable licensing and previews. */
export const FONTS: FontInfo[] = [
  f("Playfair Display", "Serif", ["elegant", "high contrast", "editorial", "sophisticated", "bold"], "'Didot', 'Bodoni 72', " + SERIF, "Transitional display serif with dramatic thick–thin strokes."),
  f("Fraunces", "Serif", ["whimsical", "retro", "expressive", "editorial", "rounded", "friendly", "heavy"], SERIF, "“Wonky” soft serif with old-style warmth and optical sizes."),
  f("Cormorant Garamond", "Serif", ["elegant", "light", "high contrast", "sophisticated"], "Garamond, " + SERIF, "Delicate, calligraphic Garamond for large, quiet headlines."),
  f("DM Serif Display", "Serif", ["editorial", "high contrast", "bold", "elegant"], SERIF, "Punchy, high-contrast headline serif."),
  f("Bodoni Moda", "Serif", ["high contrast", "elegant", "sophisticated", "editorial"], "'Bodoni 72', 'Didot', " + SERIF, "Fashion-grade Didone with razor hairlines."),
  f("Libre Baskerville", "Serif", ["editorial", "regular", "sophisticated"], "Baskerville, " + SERIF, "Classic Baskerville tuned for screen reading.", true),
  f("Lora", "Serif", ["friendly", "regular", "editorial"], SERIF, "Brushed, contemporary serif — warm in paragraphs.", true),
  f("EB Garamond", "Serif", ["sophisticated", "elegant", "regular", "light"], "Garamond, " + SERIF, "Timeless book face for long-form copy.", true),
  f("Manrope", "Sans serif", ["geometric", "friendly", "regular", "sophisticated"], SANS, "Modern geometric grotesque, crisp at small sizes.", true),
  f("DM Sans", "Sans serif", ["geometric", "friendly", "regular", "rounded"], SANS, "Low-contrast geometric sans with friendly curves.", true),
  f("Space Grotesk", "Sans serif", ["geometric", "experimental", "retro", "bold", "regular"], SANS, "Quirky grotesque with technical character.", true),
  f("Work Sans", "Sans serif", ["friendly", "regular", "light"], SANS, "Open, workhorse sans for clear interfaces.", true),
  f("Josefin Sans", "Sans serif", ["geometric", "retro", "elegant", "light", "extended"], "Futura, " + SANS, "Vintage geometric with a 1920s lilt."),
  f("Nunito", "Sans serif", ["rounded", "friendly", "whimsical"], SANS, "Rounded terminals — soft and approachable.", true),
  f("Syne", "Sans serif", ["experimental", "extended", "expressive", "heavy"], SANS, "Art-center grotesque that stretches wide at heavy weights."),
  f("Bricolage Grotesque", "Sans serif", ["expressive", "friendly", "condensed", "bold", "editorial"], SANS, "Characterful grotesque with ink-trap personality."),
  f("Archivo", "Sans serif", ["condensed", "bold", "heavy", "geometric"], "'Arial Narrow', " + SANS, "Grotesque family with condensed widths for posters.", true),
  f("Unbounded", "Display", ["extended", "geometric", "rounded", "heavy", "experimental"], SANS, "Wide, rounded display sans — futuristic and bold."),
  f("Roboto Slab", "Slab serif", ["regular", "bold", "friendly"], SLAB, "Sturdy, neutral slab for headlines or text.", true),
  f("Zilla Slab", "Slab serif", ["editorial", "friendly", "bold"], SLAB, "Contemporary slab with a journalistic edge.", true),
  f("Arvo", "Slab serif", ["retro", "geometric", "bold"], SLAB, "Geometric slab with mid-century character."),
  f("Rokkitt", "Slab serif", ["retro", "condensed", "heavy"], SLAB, "Condensed slab inspired by vintage display type."),
  f("Pacifico", "Script", ["retro", "rounded", "whimsical", "bold", "friendly"], SCRIPT, "Brushy surf-shop script."),
  f("Caveat", "Script", ["whimsical", "friendly", "expressive"], SCRIPT, "Casual handwriting — personal, quick notes."),
  f("Dancing Script", "Script", ["elegant", "whimsical", "regular"], SCRIPT, "Lively connected script with bouncing baseline."),
  f("Great Vibes", "Script", ["elegant", "high contrast", "sophisticated", "light"], SCRIPT, "Formal calligraphic script for luxury accents."),
  f("Abril Fatface", "Display", ["high contrast", "heavy", "editorial", "expressive"], "'Didot', 'Bodoni 72', " + SERIF, "Fat-face Didone for loud editorial headlines."),
  f("Bebas Neue", "Display", ["condensed", "bold", "heavy", "geometric"], "Impact, 'Arial Narrow', " + SANS, "Tall all-caps sans — sporty and urgent."),
  f("Righteous", "Display", ["retro", "rounded", "geometric", "expressive"], SANS, "Streamlined Art Deco-meets-70s display face."),
  f("Shrikhand", "Display", ["retro", "heavy", "whimsical", "expressive", "rounded"], SERIF, "Juicy, italic display with Gujarati-inspired curves."),
  f("Monoton", "Display", ["retro", "experimental", "extended"], SANS, "Inline neon-tube display — headlines only."),
  f("Space Mono", "Monospace", ["retro", "experimental", "geometric", "regular"], MONO, "Geometric mono with retro-tech charm.", true),
  f("JetBrains Mono", "Monospace", ["regular", "experimental", "geometric"], MONO, "Developer mono with tall x-height.", true),
  f("IBM Plex Mono", "Monospace", ["sophisticated", "regular", "editorial"], MONO, "Corporate-grade mono with typewriter roots.", true),
  f("DM Mono", "Monospace", ["light", "friendly", "geometric"], MONO, "Soft, light mono pairing with DM Sans.", true),
];

const norm = (s: string) => s.toLowerCase();

/** Scores the catalog against a slot's chips plus the brand's selected traits. */
export function recommendFonts(slot: TypeSlot, traits: string[], role: "display" | "body", limit = 5): FontInfo[] {
  const wanted = [...slot.personality, ...slot.shape].map(norm);
  const traitTags = traits.flatMap((name) => findTerm(name)?.fonts ?? []).map(norm);
  const scored = FONTS.map((font) => {
    let score = 0;
    if (font.classification === slot.classification) score += 6;
    for (const w of wanted) if (font.tags.includes(w)) score += 2;
    for (const tt of traitTags) {
      if (font.tags.includes(tt)) score += 0.6;
      if (norm(font.classification) === tt) score += 1;
    }
    if (role === "body") score += font.body ? 3 : -4;
    return { font, score };
  });
  return scored.sort((a, b) => b.score - a.score || a.font.name.localeCompare(b.font.name)).slice(0, limit).map((s) => s.font);
}

export const findFont = (name: string) => FONTS.find((x) => x.name === name);

export function resolveFont(slot: TypeSlot, traits: string[], role: "display" | "body"): FontInfo {
  return (slot.font && findFont(slot.font)) || recommendFonts(slot, traits, role, 1)[0];
}

/** Inline preview style derived from runtime slot choices. */
export function previewStyle(slot: TypeSlot, font: FontInfo): CSSProperties {
  const sh = slot.shape;
  const weight = sh.includes("Heavy") ? 900 : sh.includes("Bold") ? 700 : sh.includes("Light") ? 300 : 400;
  return {
    fontFamily: font.stack,
    fontWeight: weight,
    letterSpacing: sh.includes("Extended") ? "0.08em" : sh.includes("Condensed") ? "-0.03em" : undefined,
    fontStretch: sh.includes("Condensed") ? "condensed" : sh.includes("Extended") ? "expanded" : undefined,
  };
}

export const googleFontsUrl = (name: string) => `https://fonts.google.com/specimen/${name.replace(/ /g, "+")}`;

/** Loads a catalog family from Google Fonts at runtime so brand previews render in the real face. */
export function ensureFontLoaded(name: string) {
  if (typeof document === "undefined" || !name) return;
  if (document.querySelector(`link[data-brand-font="${name}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.brandFont = name;
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@300;400;700;900&display=swap`;
  document.head.appendChild(link);
}
/** A search link only — it does not imply the family is in the Adobe Fonts library. */
export const adobeFontsSearchUrl = (query: string) => `https://fonts.adobe.com/search?query=${encodeURIComponent(query)}`;
