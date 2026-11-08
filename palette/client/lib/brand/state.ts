import type { BrandState, SectionId, TypeSlot } from "./types";
import { newSeed, pickR, rng, sampleR, uid } from "./random";
import { generatePalette } from "./color";
import {
  generateDescription,
  generateImageConcept,
  generateLogoConcept,
  generateMarketing,
  generateNames,
  generateTaglines,
  generateVoice,
  regenerateLogos,
  retargetIndustryText,
  subjectFor,
} from "./generate";
import { AESTHETICS, CHARACTERISTICS, findTerm, PERSONALITY, TRAIT_PRESETS } from "./vocab";
import { COLOR_DIRECTIONS, GRAPHIC_LANGUAGE, LOGO_DIRECTIONS, TYPE_CLASSIFICATIONS, TYPE_PERSONALITY, TYPE_SHAPE } from "./artVocab";

const slot = (classification: string, personality: string[], shape: string[]): TypeSlot => ({ classification, personality, shape, font: null, locked: false });

export function createSampleBrand(): BrandState {
  const base: BrandState = {
    id: uid(),
    industry: "specialty coffee company",
    name: "Ember & Oat",
    nameLocked: false,
    nameSuggestions: [],
    traits: ["Approachable", "Sophisticated", "Organic Modern", "Handcrafted"],
    traitsLocked: false,
    colorDirection: "Earthy",
    palette: [
      { hex: "#4a2c1d", locked: false },
      { hex: "#4f7a52", locked: false },
      { hex: "#c9824f", locked: false },
      { hex: "#f3ece0", locked: false },
      { hex: "#1d1612", locked: false },
    ],
    display: slot("Serif", ["Editorial", "Elegant"], ["Regular", "High contrast"]),
    body: slot("Sans serif", ["Friendly"], ["Regular"]),
    logoDirections: ["Wordmark", "Monogram", "Emblem"],
    graphicLanguage: ["Organic", "Minimal"],
    logoConcepts: [],
    selectedLogo: 0,
    taglines: [],
    selectedTagline: 0,
    description: { text: "", locked: false },
    marketing: { text: "", locked: false },
    voice: [],
    imageKinds: ["Product", "Lifestyle"],
    imageConcepts: [],
    dna: { override: null, locked: false, seed: 1 },
    deliverable: "exploration-board",
    customRequest: "",
    stage: "explore",
    fullBrief: { override: null, locked: false, seed: 1 },
    miniPrompt: { override: null, locked: false, seed: 1 },
  };
  base.nameSuggestions = ["Ember & Oat", ...generateNames(base.industry, base.traits, 7, ["Ember & Oat"]).slice(0, 4)];
  base.logoConcepts = [0, 1, 2].map((i) => generateLogoConcept(base, i, 41 + i));
  base.imageConcepts = [0, 1].map((i) => generateImageConcept(base, i, 13 + i));
  return refreshCopy(base, 3);
}

/**
 * A fresh, empty brand: every section is reset (no industry, name, traits, copy or picks). The palette
 * and type slots fall back to neutral defaults because the UI always needs five swatches and two slots.
 * Gets a new id so a previously saved brand is never overwritten by the empty one.
 */
export function createBlankBrand(): BrandState {
  const base: BrandState = {
    ...createSampleBrand(),
    id: uid(),
    industry: "",
    name: "",
    nameLocked: false,
    nameSuggestions: [],
    traits: [],
    traitsLocked: false,
    colorDirection: null,
    palette: ["#2b2b2b", "#6b6b6b", "#a3a3a3", "#efefef", "#141414"].map((hex) => ({ hex, locked: false })),
    // Nothing chosen: the board previews the top recommendation until the user picks.
    display: slot("", [], []),
    body: slot("", [], []),
    logoDirections: [],
    graphicLanguage: [],
    logoConcepts: [],
    selectedLogo: 0,
    taglines: [],
    selectedTagline: 0,
    description: { text: "", locked: false },
    marketing: { text: "", locked: false },
    voice: [],
    imageKinds: [],
    imageConcepts: [],
    dna: { override: null, locked: false, seed: newSeed() },
    customRequest: "",
    assetRequest: "",
    fullBrief: { override: null, locked: false, seed: 1 },
    miniPrompt: { override: null, locked: false, seed: 1 },
    contentIndustry: "",
    contentSync: CONTENT_SYNC_VERSION,
  };
  // Concept slots stay available (built from neutral defaults) so Regenerate still works after clearing.
  base.logoConcepts = [0, 1, 2].map((i) => generateLogoConcept(base, i, newSeed() + i));
  base.imageConcepts = [0, 1].map((i) => generateImageConcept(base, i, newSeed() + i));
  return base;
}

/**
 * Changes the business type and re-derives everything that was written for the old one:
 * unlocked image subjects, logo concept descriptions (motifs) and copy. Locked items stay as they are.
 * Seeds are reused so typing the industry doesn't reshuffle unrelated choices.
 */
export const CONTENT_SYNC_VERSION = 2;

export function applyIndustry(s: BrandState, industry: string): BrandState {
  const fix = (t: string) => retargetIndustryText(t, industry);
  const fixLive = (l: BrandState["dna"]) => (l.override === null ? l : { ...l, override: fix(l.override) });
  const next: BrandState = {
    ...s,
    industry,
    contentIndustry: industry,
    contentSync: CONTENT_SYNC_VERSION,
    dna: fixLive(s.dna),
    fullBrief: fixLive(s.fullBrief),
    miniPrompt: fixLive(s.miniPrompt),
  };
  next.imageConcepts = s.imageConcepts.map((c, i) =>
    c.locked || c.promptOverride !== null
      ? { ...c, subject: fix(c.subject), promptOverride: c.promptOverride === null ? null : fix(c.promptOverride) }
      : { ...c, subject: subjectFor(c.kind, industry, rng(c.seed + i * 53)) }
  );
  next.logoConcepts = s.logoConcepts.map((lc, i) =>
    lc.locked
      ? { ...lc, description: fix(lc.description), promptOverride: lc.promptOverride === null ? null : fix(lc.promptOverride) }
      : generateLogoConcept(next, i, lc.seed, lc.id)
  );
  const refreshed = refreshCopy(next, s.dna.seed + 3);
  return {
    ...refreshed,
    description: refreshed.description.locked ? { ...refreshed.description, text: fix(refreshed.description.text) } : refreshed.description,
    marketing: refreshed.marketing.locked ? { ...refreshed.marketing, text: fix(refreshed.marketing.text) } : refreshed.marketing,
  };
}

/** Regenerates every unlocked piece of copy. Locked pieces are untouched. */
export function refreshCopy(s: BrandState, seed: number): BrandState {
  const ctx = { name: s.name || "The brand", industry: s.industry, traits: s.traits };
  return {
    ...s,
    taglines: generateTaglines(ctx, seed, s.taglines),
    description: s.description.locked ? s.description : { text: generateDescription(ctx, seed), locked: false },
    marketing: s.marketing.locked ? s.marketing : { text: generateMarketing(ctx, seed), locked: false },
    voice: generateVoice(s.traits, seed, s.voice),
  };
}

export function surpriseTraits(seed: number): string[] {
  const r = rng(seed);
  if (r() < 0.35) return pickR(r, TRAIT_PRESETS);
  return [
    ...sampleR(r, PERSONALITY.terms, 2),
    ...sampleR(r, AESTHETICS.terms, r() < 0.5 ? 1 : 2),
    ...sampleR(r, CHARACTERISTICS.terms, 1),
  ].map((x) => x.name);
}

/** Most common color hint among traits, or a random direction. */
export function directionFromTraits(traits: string[], r: () => number): string {
  const counts: Record<string, number> = {};
  for (const t of traits) {
    const hint = findTerm(t)?.color;
    if (hint) counts[hint] = (counts[hint] ?? 0) + 1;
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const map: Record<string, string> = { jewel: "Jewel Tones" };
  if (ranked.length && r() < 0.75) {
    const key = ranked[0][0];
    return map[key] ?? key[0].toUpperCase() + key.slice(1);
  }
  return pickR(r, COLOR_DIRECTIONS).name;
}

/** Global Surprise Me: invents a new direction while respecting every lock. Industry text is kept. */
export function surpriseBrand(s: BrandState): BrandState {
  const seed = newSeed();
  const r = rng(seed);
  let next: BrandState = { ...s };
  if (!s.traitsLocked) next.traits = surpriseTraits(seed);
  if (!s.nameLocked) {
    next.nameSuggestions = generateNames(s.industry, next.traits, seed + 1);
    next.name = next.nameSuggestions[0];
  }
  const direction = directionFromTraits(next.traits, r);
  next.colorDirection = direction;
  next.palette = generatePalette(direction, s.palette, r);
  const typeSlot = (cur: TypeSlot, role: "display" | "body"): TypeSlot =>
    cur.locked
      ? cur
      : {
          ...cur,
          classification: role === "body" ? pickR(r, ["Sans serif", "Serif", "Sans serif", "Monospace"]) : pickR(r, TYPE_CLASSIFICATIONS).name,
          personality: sampleR(r, TYPE_PERSONALITY, 2).map((x) => x.name),
          shape: sampleR(r, role === "body" ? TYPE_SHAPE.filter((x) => ["Light", "Regular", "Rounded"].includes(x.name)) : TYPE_SHAPE, role === "body" ? 1 : 2).map((x) => x.name),
          font: null,
        };
  next.display = typeSlot(s.display, "display");
  next.body = typeSlot(s.body, "body");
  const anyLogoLocked = s.logoConcepts.some((l) => l.locked);
  if (!anyLogoLocked) {
    next.logoDirections = sampleR(r, LOGO_DIRECTIONS, 3).map((x) => x.name);
    next.graphicLanguage = sampleR(r, GRAPHIC_LANGUAGE, 2).map((x) => x.name);
  }
  next.logoConcepts = regenerateLogos(next, seed + 3);
  next.imageConcepts = s.imageConcepts.map((c, i) => (c.locked ? c : generateImageConcept(next, i, seed + 9 + i, c)));
  next = refreshCopy(next, seed + 5);
  next.dna = s.dna.locked ? s.dna : { ...s.dna, seed: seed + 6 };
  return next;
}

export type SectionMeta = { count: string; done: boolean };

export function sectionMeta(s: BrandState, savedCount: number): Record<SectionId, SectionMeta> {
  return {
    concept: { count: `${[s.industry.trim(), s.name.trim()].filter(Boolean).length}/2`, done: !!(s.industry.trim() && s.name.trim()) },
    personality: { count: String(s.traits.length), done: s.traits.length >= 3 },
    color: { count: s.colorDirection ? "1" : "0", done: s.colorDirection !== null },
    type: { count: `${[s.display.font, s.body.font].filter(Boolean).length}/2`, done: !!(s.display.font || s.body.font) },
    logo: { count: `${s.logoConcepts.length} concepts`, done: s.logoDirections.length > 0 && s.logoConcepts.length > 0 },
    copy: { count: `${s.taglines.length} lines`, done: s.taglines.length > 0 },
    imagery: { count: `${s.imageConcepts.length}`, done: s.imageKinds.length > 0 && s.imageConcepts.length > 0 },
    briefs: { count: "3", done: [s.dna, s.fullBrief, s.miniPrompt].some((l) => l.override !== null) },
    library: { count: String(savedCount), done: savedCount > 0 },
  };
}

/** Locks were removed from the UI; drafts saved earlier may still carry them. */
export function clearLocks(s: BrandState): BrandState {
  const live = <T extends { locked: boolean }>(x: T): T => ({ ...x, locked: false });
  return {
    ...s,
    nameLocked: false,
    traitsLocked: false,
    palette: s.palette.map(live),
    display: live(s.display),
    body: live(s.body),
    logoConcepts: s.logoConcepts.map(live),
    taglines: s.taglines.map(live),
    voice: s.voice.map(live),
    description: live(s.description),
    marketing: live(s.marketing),
    imageConcepts: s.imageConcepts.map(live),
    dna: live(s.dna),
    fullBrief: live(s.fullBrief),
    miniPrompt: live(s.miniPrompt),
  };
}
