import type { BrandState, ImageConcept, LockedText, LogoConcept, Ratio } from "./types";
import { findTerm, type NameFlavor } from "./vocab";
import { cap, listJoin, pickR, rng, sampleR, uid, type Rand } from "./random";
import { LIGHTING, CAMERA, COMPOSITION, ATMOSPHERE, LOGO_DIRECTIONS, GRAPHIC_LANGUAGE } from "./artVocab";

// ——— Industry understanding (local, keyword-based) ———
export type IndustryProfile = { nouns: string[]; product: string; scene: string; materials: string; motifs: string[]; persona: string };

const PROFILES: [RegExp, IndustryProfile][] = [
  [/coffee|espresso|caf[eé]|roast/i, { nouns: ["Roast", "Bean", "Brew", "Crema", "Roastery", "Cup"], product: "coffee", scene: "a sunlit café counter", materials: "ceramic cups, roasted beans, steam and kraft paper", motifs: ["coffee bean", "steam curl", "cup silhouette"], persona: "a head roaster with flour-dusted sleeves" }],
  [/tea|matcha|chai/i, { nouns: ["Leaf", "Steep", "Kettle", "Infusion", "Garden"], product: "tea", scene: "a quiet morning tea table", materials: "loose leaves, glass teapots, linen and porcelain", motifs: ["tea leaf", "rising steam", "teapot arc"], persona: "a tea blender in a botanical studio" }],
  [/eyewear|glasses|optic|sunglass|spectacle/i, { nouns: ["Optic", "Lens", "Frame", "Iris", "Sight"], product: "eyewear", scene: "a bright city street", materials: "polished acetate, thin metal and clear glass", motifs: ["twin lens circles", "iris ring", "bridge line"], persona: "a stylish architect squinting into the sun" }],
  [/motor|moto|bike|cycle|scooter/i, { nouns: ["Moto", "Torque", "Machine", "Garage", "Works"], product: "motorcycles", scene: "an empty desert highway at dusk", materials: "brushed aluminium, carbon fiber, leather and chrome", motifs: ["wheel arc", "wing", "piston"], persona: "a rider in a sculpted helmet" }],
  [/skin|beauty|cosmetic|serum|spa|wellness/i, { nouns: ["Ritual", "Glow", "Apothecary", "Skin", "Bath"], product: "skincare", scene: "a calm stone bathroom", materials: "frosted glass, stone, water droplets and botanicals", motifs: ["droplet", "petal", "moon"], persona: "a model with dewy, natural skin" }],
  [/bak|bread|pastr|patisserie|cake/i, { nouns: ["Bakehouse", "Crumb", "Oven", "Loaf", "Larder"], product: "baked goods", scene: "a warm bakery at dawn", materials: "flour, crusty loaves, parchment and wood boards", motifs: ["wheat stalk", "loaf curve", "rolling pin"], persona: "a baker shaping dough" }],
  [/wine|vineyard|winery|vintner|sommelier/i, { nouns: ["Cellar", "Vine", "Vineyard", "Estate", "Reserve"], product: "wine", scene: "a stone cellar with oak barrels and a tasting table", materials: "cut glass, cork, oak and linen", motifs: ["grape vine", "wine glass", "cork and seal"], persona: "a vintner" }],
  [/spirit|distill|gin|whisk|vodka|rum|tequila|mezcal|bourbon/i, { nouns: ["Still", "Barrel", "Distillery", "Cask", "Reserve"], product: "spirits", scene: "a candle-lit tasting room with copper and oak", materials: "cut glass, oak, ice and copper", motifs: ["copper still", "juniper sprig", "oak barrel"], persona: "a master distiller" }],
  [/beer|brew|ale|lager|cider|taproom/i, { nouns: ["Brewing", "Taproom", "Hop", "Barrel", "Works"], product: "beer", scene: "a taproom with steel tanks and warm wood", materials: "glass, steel, hops and wood", motifs: ["hop cone", "barley stalk", "pint glass"], persona: "a head brewer" }],
  [/fashion|apparel|cloth|wear|denim|shoe|sneaker/i, { nouns: ["Atelier", "Thread", "Label", "Studio", "Supply"], product: "apparel", scene: "a concrete studio with soft daylight", materials: "heavy cotton, raw denim, stitching and leather tags", motifs: ["needle and thread", "hanger arc", "woven pattern"], persona: "a model mid-stride" }],
  [/tech|software|app|\bai\b|data|robot|digital/i, { nouns: ["Labs", "Systems", "Signal", "Works", "Cloud"], product: "technology", scene: "a minimal, light-filled workspace", materials: "anodized metal, glass screens and soft-touch plastic", motifs: ["signal wave", "node grid", "spark"], persona: "an engineer sketching on glass" }],
  [/flower|floral|florist|plant|garden/i, { nouns: ["Bloom", "Stem", "Garden", "Flora", "Greenhouse"], product: "flowers", scene: "a glasshouse full of greenery", materials: "petals, stems, terracotta and paper wraps", motifs: ["single bloom", "leaf", "stem curve"], persona: "a florist arranging stems" }],
  [/candle|home|interior|furniture|ceramic/i, { nouns: ["House", "Home", "Hearth", "Objects", "Studio"], product: "home goods", scene: "a warm, sunlit living room", materials: "wax, linen, clay and oak", motifs: ["flame", "arch", "vessel"], persona: "a maker at a pottery wheel" }],
  [/chocolate|cacao|candy|sweet|confection|ice cream/i, { nouns: ["Cacao", "Confectionery", "Sweets", "Parlour"], product: "chocolate", scene: "a marble confectionery counter", materials: "glossy chocolate, foil wrappers, cocoa nibs and marble", motifs: ["cacao pod", "drip", "wrapped square"], persona: "a chocolatier tempering chocolate" }],
];

export function industryProfile(industry: string): IndustryProfile {
  const hit = PROFILES.find(([re]) => re.test(industry));
  if (hit) return hit[1];
  const words = industry.trim().split(/\s+/).filter(Boolean);
  const product = words.slice(-2).join(" ").toLowerCase() || "products";
  return { nouns: ["Co.", "Studio", "Works", "Supply", "House"], product, scene: "a beautifully styled studio set", materials: "tactile, well-chosen materials", motifs: ["star", "arch", "sun"], persona: "a founder who embodies the brand" };
}

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Rewrites phrases that belong to a *different* industry (motifs, scenes, materials, personas and
 * "<product> product" mentions) into the current industry's equivalents. Used on locked or edited
 * text so a brand that changed business type doesn't keep, e.g., coffee motifs.
 */
export function retargetIndustryText(text: string, industry: string): string {
  if (!text) return text;
  const current = industryProfile(industry);
  let out = text;
  const own = [current.scene, current.materials, current.persona, ...current.motifs].join(" | ").toLowerCase();
  for (const [, p] of PROFILES) {
    if (p === current) continue;
    const swaps: [string, string][] = [
      [p.scene, current.scene],
      [p.materials, current.materials],
      [p.persona, current.persona],
      ...p.motifs.map((m, k) => [m, current.motifs[k % current.motifs.length]] as [string, string]),
    ];
    for (const [from, to] of swaps) {
      if (from === to || own.includes(from.toLowerCase())) continue;
      out = out.replace(new RegExp(`\\b${escapeRe(from)}\\b`, "gi"), to);
    }
    out = out.replace(new RegExp(`\\b${escapeRe(p.product)}( product)\\b`, "gi"), `${current.product}$1`);
  }
  return out;
}

export const INDUSTRY_IDEAS = [
  "specialty coffee company", "boutique eyewear label", "premium botanical tea", "futuristic motorcycle company",
  "small-batch chocolate maker", "natural skincare apothecary", "neighbourhood sourdough bakery", "independent gin distillery",
  "slow-fashion denim label", "hand-poured candle studio", "urban flower shop", "AI-powered travel app",
];

// ——— Naming ———
const BANKS: Record<NameFlavor, string[]> = {
  nature: ["Fern", "Moss", "Juniper", "Saffron", "Oat", "Willow", "Sorrel", "Briar", "Linden", "Thistle", "Clover", "Alder"],
  luxe: ["Maison", "Aurelle", "Valois", "Sable", "Orris", "Velour", "Aurum", "Opaline", "Vesper", "Seraphine", "Noble"],
  playful: ["Pip", "Fizz", "Bloop", "Zing", "Wiggle", "Sunny", "Pop", "Doodle", "Jolly", "Peachy", "Bop"],
  bold: ["Riot", "Volt", "Grit", "Rogue", "Havoc", "Forge", "Rebel", "Static", "Jolt", "Brute"],
  calm: ["Still", "Haven", "Drift", "Hush", "Tide", "Mellow", "Dune", "Halcyon", "Meadow", "Kindred"],
  mystic: ["Noctis", "Umbra", "Obscura", "Lune", "Oracle", "Nyx", "Vespera", "Arcane", "Eclipse"],
  retro: ["Atomic", "Starlite", "Jet", "Rocket", "Satellite", "Jukebox", "Comet", "Astro", "Neon"],
  modern: ["Nova", "Vela", "Aero", "Lumen", "Kin", "Mode", "Axis", "Form", "Index", "Field"],
  craft: ["Hearth", "Anvil", "Loom", "Kiln", "Ember", "Thimble", "Mill", "Whittle", "Bramble"],
};

const SUFFIXES = ["ora", "ly", "io", "ette", "a", "ery"];

function flavorPool(traits: string[]): NameFlavor[] {
  const flavors = traits.map((n) => findTerm(n)?.flavor).filter(Boolean) as NameFlavor[];
  return flavors.length ? flavors : ["modern", "nature", "craft"];
}

function oneName(r: Rand, flavors: NameFlavor[], nouns: string[]): string {
  const a = pickR(r, BANKS[pickR(r, flavors)]);
  const b = pickR(r, BANKS[pickR(r, flavors)]);
  const noun = pickR(r, nouns);
  const pattern = Math.floor(r() * 7);
  switch (pattern) {
    case 0: return a === b ? `${a} & ${pickR(r, BANKS.nature)}` : `${a} & ${b}`;
    case 1: return `${a} ${noun}`;
    case 2: return `House of ${a}`;
    case 3: return `${a.replace(/[aeiouy]$/i, "")}${pickR(r, SUFFIXES)}`;
    case 4: return `The ${a} ${noun}`;
    case 5: return `${a} No. ${Math.floor(r() * 9) + 1}`;
    default: return a === b ? `${a}field` : `${a}${b.toLowerCase()}`;
  }
}

export function generateNames(industry: string, traits: string[], seed: number, exclude: string[] = []): string[] {
  const r = rng(seed);
  const { nouns } = industryProfile(industry);
  const flavors = flavorPool(traits);
  const out = new Set<string>();
  let guard = 0;
  while (out.size < 5 && guard++ < 80) {
    const n = oneName(r, flavors, nouns);
    if (!exclude.includes(n)) out.add(n);
  }
  return [...out];
}

// ——— Voice & copy ———
export function voiceWords(traits: string[]): string[] {
  const words = traits.flatMap((n) => findTerm(n)?.voice ?? []);
  const unique = [...new Set(words)];
  return unique.length >= 3 ? unique : [...unique, "clear", "warm", "confident"].slice(0, Math.max(3, unique.length));
}

const TAGLINES: ((v: { adj: string; adj2: string; product: string; name: string }) => string)[] = [
  ({ adj }) => `Made to be ${adj}.`,
  ({ product }) => `Small rituals. Big ${product === "coffee" ? "character" : "ideas"}.`,
  ({ adj, product }) => `The ${adj} side of ${product}.`,
  () => "Made slowly. Loved quickly.",
  ({ adj }) => `Quietly ${adj}.`,
  () => "For people who notice.",
  ({ adj2 }) => `Feel the ${adj2} difference.`,
  ({ name, adj }) => `${name}: ${adj} by nature.`,
  ({ product }) => `Honest ${product}, beautifully done.`,
  ({ adj }) => `Designed ${adj}. Made to last.`,
  () => "Built for the long way round.",
  ({ adj2 }) => `Everyday, made ${adj2}.`,
  ({ product }) => `A better story for ${product}.`,
  () => "Crafted for the curious.",
  ({ adj, adj2 }) => `${cap(adj)} at heart. ${cap(adj2)} by design.`,
  () => "Find your ritual.",
];

export type CopyContext = { name: string; industry: string; traits: string[] };

export function generateTaglines(ctx: CopyContext, seed: number, current: LockedText[]): LockedText[] {
  const r = rng(seed);
  const words = voiceWords(ctx.traits);
  const product = industryProfile(ctx.industry).product;
  const lockedTexts = current.filter((x) => x.locked).map((x) => x.text);
  const pool = sampleR(r, TAGLINES, TAGLINES.length)
    .map((fn) => fn({ adj: pickR(r, words), adj2: pickR(r, words), product, name: ctx.name || "The brand" }))
    .filter((line) => !lockedTexts.includes(line));
  let i = 0;
  return Array.from({ length: 5 }, (_, k) => (current[k]?.locked ? current[k] : { text: pool[i++] ?? "Made with intent.", locked: false }));
}

export function generateDescription(ctx: CopyContext, seed: number): string {
  const r = rng(seed + 11);
  const traits = ctx.traits.slice(0, 3).map((x) => x.toLowerCase());
  const p = industryProfile(ctx.industry);
  const words = voiceWords(ctx.traits);
  const opener = pickR(r, [
    `${ctx.name} is ${traits.length ? `a ${listJoin(traits)}` : "a thoughtful"} ${ctx.industry || "brand"}`,
    `Meet ${ctx.name}, ${traits.length ? `a ${listJoin(traits)}` : "a thoughtful"} take on ${p.product}`,
  ]);
  const close = pickR(r, [
    `that treats every detail as part of the experience.`,
    `for people who care how things are made — and how they make you feel.`,
    `built around ${pickR(r, words)}, ${pickR(r, words)} moments.`,
  ]);
  return `${opener} ${close}`;
}

export function generateMarketing(ctx: CopyContext, seed: number): string {
  const r = rng(seed + 23);
  const p = industryProfile(ctx.industry);
  const [a, b, c] = sampleR(r, voiceWords(ctx.traits), 3);
  return pickR(r, [
    `At ${ctx.name}, ${p.product} is never an afterthought. We start with ${p.materials}, then shape every detail to feel ${a} and ${b}. The result is something you'll want to come back to — ${c}, considered and unmistakably ours.`,
    `${ctx.name} was made for the moments in between. Picture ${p.scene}: everything ${a}, nothing rushed. That's the feeling we bottle into every piece of ${p.product} — ${b} in spirit, ${c} in the details.`,
    `Some brands shout. ${ctx.name} invites you closer. Built from ${p.materials}, our ${p.product} is ${a} without trying too hard and ${b} without the fuss. Come for the craft; stay for the ${c} character.`,
  ]);
}

export function generateVoice(traits: string[], seed: number, current: LockedText[]): LockedText[] {
  const r = rng(seed + 37);
  const locked = current.filter((x) => x.locked).map((x) => x.text.toLowerCase());
  const pool = sampleR(r, voiceWords(traits), 8).filter((w) => !locked.includes(w));
  let i = 0;
  return Array.from({ length: 3 }, (_, k) => (current[k]?.locked ? current[k] : { text: cap(pool[i++] ?? "Clear"), locked: false }));
}

// ——— Logo concepts ———
const DEFAULT_DIRECTIONS = ["Wordmark", "Monogram", "Combination Mark"];
const DEFAULT_GRAPHIC = ["Minimal", "Geometric", "Organic"];

const TITLES: Record<string, string[]> = {
  Wordmark: ["The Signature", "Tailored Wordmark", "Spaced Wordmark"],
  Monogram: ["The Seal Monogram", "Interlocked Initials", "Stamp Monogram"],
  "Combination Mark": ["Symbol + Name", "The Lockup", "Paired Mark"],
  Emblem: ["The Badge", "Heritage Emblem", "Round Seal"],
  Symbol: ["The Icon", "Abstract Mark", "Standalone Symbol"],
  Typographic: ["Stacked Type", "Split Composition", "Cropped Letterform"],
};

function motifFor(state: Pick<BrandState, "industry" | "traits">, r: Rand) {
  const extra: string[] = [];
  if (state.traits.includes("Botanical")) extra.push("leaf sprig");
  if (state.traits.includes("Art Deco")) extra.push("sunburst");
  if (state.traits.includes("Mysterious")) extra.push("crescent moon");
  if (state.traits.includes("Retro-futurist")) extra.push("orbit ring");
  return pickR(r, [...industryProfile(state.industry).motifs, ...extra]);
}

export function describeLogo(direction: string, graphic: string, name: string, motif: string, r: Rand): string {
  const initials = name.split(/[\s&]+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("") || "B";
  const g = graphic.toLowerCase();
  const gin = g ? ` with ${g} construction` : "";
  const gsh = g ? `a few ${g} shapes` : "a few simple shapes";
  // Plain descriptions a designer would brief with: what the mark is, how it's built, where it works.
  const map: Record<string, string[]> = {
    Wordmark: [
      `The full name set as a single wordmark, letter-spacing tuned by hand. A small ${motif} detail can live in one letterform. ${g ? `${cap(g)} in feel; must` : "Must"} stay legible at small sizes.`,
      `A confident wordmark with one custom ligature joining two letters. ${g ? `${cap(g)} styling` : "Clean styling"}, generous spacing, no symbol — the lettering is the brand.`,
    ],
    Monogram: [
      `The initials “${initials}” drawn as one interlocking monogram${gin}. Works alone on stamps, favicons and corners of packaging.`,
      `A compact “${initials}” monogram inside a simple frame, strokes matched to the brand typeface. Built to sit small and read instantly.`,
    ],
    "Combination Mark": [
      `A simple ${motif} symbol beside the name, both sharing one stroke weight so they lock up as a unit. The symbol must also work on its own.`,
      `The name with a small ${motif} glyph above it. ${g ? `${cap(g)} shapes, no` : "No"} detail that disappears below 24 px; the glyph becomes the app icon.`,
    ],
    Emblem: [
      `The name set around a central ${motif} inside a ring, with a short line underneath for a place or founding year. ${g ? `${cap(g)} detailing; made` : "Made"} for labels, seals and merchandise.`,
      `A badge: the name arched over a ${motif}, contained in a clean circular or shield outline. Reads as a mark of origin.`,
    ],
    Symbol: [
      `An abstract ${motif} reduced to ${gsh}. No letters; it has to be memorable at favicon size and ownable in one color.`,
      `A single iconic mark drawn from a ${motif}, simplified until it works as a silhouette. Pairs with the wordmark but stands alone.`,
    ],
    Typographic: [
      `The name set as a typographic composition across two lines, in the brand display face, with a ${g ? `${g} ` : ""}rule or bar separating the lines. Pure type, no symbol.`,
      `A type-only lockup: the name in the brand display face with one deliberate typographic move, such as a shifted baseline or an oversized initial. ${g ? `${cap(g)} and restrained.` : "Restrained."}`,
    ],
  };
  return pickR(r, map[direction] ?? map.Wordmark);
}

export function generateLogoConcept(state: BrandState, index: number, seed: number, keepId?: string, pin?: { direction?: string; graphic?: string }): LogoConcept {
  const r = rng(seed + index * 101);
  // Only three concepts exist, so they follow the three most recently picked directions — that way a
  // newly picked direction always shows up instead of being ignored once three are already selected.
  const dirs = DEFAULT_DIRECTIONS;
  const graphics = DEFAULT_GRAPHIC;
  const direction = pin?.direction ?? (dirs.length >= 3 ? dirs[index % dirs.length] : index < dirs.length ? dirs[index] : pickR(r, [...dirs, ...DEFAULT_DIRECTIONS]));
  const graphic = pin?.graphic ?? graphics[index % graphics.length];
  const motif = motifFor(state, r);
  return {
    id: keepId ?? uid(),
    title: pickR(r, TITLES[direction] ?? TITLES.Wordmark),
    direction,
    graphic,
    description: describeLogo(direction, graphic, state.name, motif, r),
    promptOverride: null,
    locked: false,
    seed,
    pinDirection: pin?.direction,
    pinGraphic: pin?.graphic,
  };
}

/** The card's own choices, if any, carried into a rewrite. */
export const pinsOf = (lc: LogoConcept) => ({ direction: lc.pinDirection, graphic: lc.pinGraphic });

/** A fresh pair for one card, never the pair it already has. */
export function freshPair(r: Rand, current?: { direction: string; graphic: string }): { direction: string; graphic: string } {
  const dirs = LOGO_DIRECTIONS.map((d) => d.name);
  const gfx = GRAPHIC_LANGUAGE.map((g) => g.name);
  for (let i = 0; i < 20; i++) {
    const pair = { direction: pickR(r, dirs), graphic: pickR(r, gfx) };
    if (!current || pair.direction !== current.direction || pair.graphic !== current.graphic) return pair;
  }
  return { direction: pickR(r, dirs), graphic: pickR(r, gfx) };
}

/** Three new ideas: distinct directions, fresh wording. */
export function regenerateLogos(state: BrandState, seed: number): LogoConcept[] {
  const r = rng(seed);
  const dirs = sampleR(r, LOGO_DIRECTIONS, 3).map((d) => d.name);
  const gfx = sampleR(r, GRAPHIC_LANGUAGE, 3).map((g) => g.name);
  return state.logoConcepts.map((lc, i) => (lc.locked ? lc : generateLogoConcept(state, i, seed + i * 7, lc.id, { direction: dirs[i % dirs.length], graphic: gfx[i % gfx.length] })));
}

// ——— Image concepts ———
export function subjectFor(kind: string, industry: string, r: Rand): string {
  const p = industryProfile(industry);
  const options: Record<string, string[]> = {
    Product: [`the signature ${p.product} product on a sculpted stone plinth`, `a styled still life of ${p.product} with ${p.materials}`, `the hero ${p.product} product floating against a seamless backdrop`],
    Portrait: [`${p.persona}`, `a confident customer holding the ${p.product} product`, `${p.persona}, captured mid-gesture`],
    Lifestyle: [`friends sharing ${p.product} in ${p.scene}`, `a quiet personal ritual with ${p.product} in ${p.scene}`, `${p.product} as part of an unhurried weekend morning`],
    Illustration: [`an illustrated scene of ${p.scene} with ${pickR(r, p.motifs)} motifs`, `a patterned illustration built from ${pickR(r, p.motifs)} shapes`, `a storybook illustration of ${p.persona}`],
    Mixed: [`a photograph of ${p.product} layered with cut-paper shapes in the brand colors`, `a collage combining ${p.materials} with bold graphic forms`, `a portrait framed by hand-drawn ${pickR(r, p.motifs)} marks`],
  };
  return pickR(r, options[kind] ?? options.Product);
}

const KIND_DEFAULT_RATIO: Record<string, Ratio> = { Product: "4:5", Portrait: "3:4", Lifestyle: "3:2", Illustration: "1:1", Mixed: "4:5" };

export function generateImageConcept(state: BrandState, index: number, seed: number, prev?: ImageConcept): ImageConcept {
  const r = rng(seed + index * 53);
  const kinds = state.imageKinds.length ? state.imageKinds : ["Product", "Lifestyle", "Portrait"];
  const kind = kinds[index % kinds.length];
  return {
    id: prev?.id ?? uid(),
    kind,
    subject: subjectFor(kind, state.industry, r),
    ratio: prev?.ratio ?? KIND_DEFAULT_RATIO[kind] ?? "4:5",
    lighting: pickR(r, LIGHTING).name,
    camera: pickR(r, CAMERA).name,
    composition: pickR(r, COMPOSITION).name,
    atmosphere: pickR(r, ATMOSPHERE).name,
    promptOverride: null,
    locked: false,
    seed,
  };
}
