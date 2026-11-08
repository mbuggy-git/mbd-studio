import type { CSSProperties } from "react"
import { CATEGORY_ORDER, EXTRA_TERMS, LABEL_OVERRIDES, NEW_CATEGORIES } from "./vocabularyExpansion"

export type CategoryId =
  | "mood"
  | "style"
  | "lighting"
  | "camera"
  | "composition"
  | "color"
  | "texture"
  | "subject"

export type Term = {
  name: string
  definition: string
  phrase: string
  swatch: CSSProperties
  /** Optional photographic example shown in the hover tooltip. */
  image?: string
}

export type Category = {
  id: CategoryId
  label: string
  /** Compact label for tabs and the selection summary. */
  short?: string
  index: string
  blurb: string
  chipClass: string
  dotClass: string
  terms: Term[]
}

const BASE_CATEGORIES: Category[] = [
  {
    id: "mood",
    label: "Mood",
    index: "01",
    blurb: "The emotional temperature — how the image should feel before anyone reads it.",
    chipClass: "aria-pressed:border-secondary aria-pressed:bg-secondary aria-pressed:text-foreground",
    dotClass: "bg-secondary",
    terms: [
      { name: "Cinematic", definition: "Feels like a film still: wide framing, dramatic tension, and a sense of a story caught mid-scene.", phrase: "cinematic, story-driven tension", swatch: { background: "linear-gradient(180deg,#111 0 16%,transparent 16% 84%,#111 84%), linear-gradient(120deg,#16324a,#c8643b)" } },
      { name: "Ethereal", definition: "Delicate, airy and otherworldly — light seems to pass through everything.", phrase: "an ethereal, weightless softness", swatch: { background: "radial-gradient(circle at 30% 30%,#ffffff 0,#e8e4f5 40%,#cfe3ee 100%)" } },
      { name: "Playful", definition: "Light-hearted and energetic, with bouncy shapes, bold color and a sense of fun.", phrase: "playful, buoyant energy", swatch: { background: "radial-gradient(circle at 25% 35%,#ff6b6b 0 14%,transparent 15%), radial-gradient(circle at 70% 60%,#ffd93d 0 18%,transparent 19%), radial-gradient(circle at 52% 22%,#4d96ff 0 9%,transparent 10%), #fdf3e7" } },
      { name: "Mysterious", definition: "Withholds information — deep shadow, partial reveals and an unanswered question.", phrase: "a mysterious, withheld quiet", swatch: { background: "radial-gradient(circle at 70% 40%,#3b4a5a 0,#0d1117 60%)" } },
      { name: "Surreal", definition: "Dream logic made real: impossible scale, unexpected juxtapositions, rendered believably.", phrase: "surreal, dream-logic juxtapositions", swatch: { background: "radial-gradient(circle at 50% 55%,#fefae0 0 12%,transparent 13%), linear-gradient(180deg,#f7c59f 0 55%,#2a6f97 55%)" } },
      { name: "Dreamlike", definition: "Hazy, soft-focus and drifting, as if remembered rather than seen.", phrase: "a dreamlike, hazy drift", swatch: { background: "linear-gradient(135deg,#fbc2eb,#a6c1ee)" } },
      { name: "Nostalgic", definition: "Evokes a warm, slightly faded past — sun-bleached color and familiar objects.", phrase: "warm, nostalgic wistfulness", swatch: { background: "linear-gradient(135deg,#d4a373,#e9c46a 50%,#b5838d)" } },
      { name: "Whimsical", definition: "Charming and imaginative, with a storybook sense of curiosity and delight.", phrase: "whimsical, storybook charm", swatch: { background: "repeating-radial-gradient(circle at 30% 70%,#ffd6e0 0 8px,#c1f0dc 8px 16px,#fff3b0 16px 24px)" } },
    ],
  },
  {
    id: "style",
    label: "Style",
    index: "02",
    blurb: "The visual language and movement the work borrows from.",
    chipClass: "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background",
    dotClass: "bg-foreground",
    terms: [
      { name: "Editorial", definition: "Magazine-grade polish: considered typography, confident cropping and a clear point of view.", phrase: "editorial, magazine-grade polish", swatch: { background: "linear-gradient(#1a1a1a,#1a1a1a) 12% 22%/42% 14% no-repeat, linear-gradient(#1a1a1a,#1a1a1a) 12% 48%/30% 5% no-repeat, linear-gradient(90deg,#f4efe6 0 62%,#1a1a1a 62% 63%,#c96f4a 63%)" } },
      { name: "Brutalist", definition: "Raw, blunt and structural — heavy blocks, exposed grids and no decoration for its own sake.", phrase: "raw brutalist structure", swatch: { background: "linear-gradient(#000,#000) 10% 20%/50% 34% no-repeat, linear-gradient(#ff3b00,#ff3b00) 80% 80%/40% 36% no-repeat, #e6e6e6" } },
      { name: "Minimalist", definition: "Reduced to the essential: few elements, lots of air, and precise placement.", phrase: "pared-back minimalism", swatch: { background: "radial-gradient(circle at 50% 50%,#1a1a1a 0 5px,transparent 6px), #f6f5f2" } },
      { name: "Psychedelic", definition: "Swirling, saturated and hallucinatory, inspired by 1960s poster art.", phrase: "psychedelic, kaleidoscopic swirls", swatch: { background: "conic-gradient(from 0deg,#ff006e,#fb5607,#ffbe0b,#3a86ff,#8338ec,#ff006e)" } },
      { name: "Retro-futurist", definition: "The future as imagined in the past — chrome, sunsets, grids and space-age optimism.", phrase: "retro-futurist chrome optimism", swatch: { background: "radial-gradient(circle at 50% 46%,#ffb347 0 22%,transparent 23%), linear-gradient(180deg,#1b0033 0 52%,#ff4f9a 52% 54%,#1b0033 54% 60%,#ff8a3d 60% 62%,#24004d 62%)" } },
      { name: "Art Deco", definition: "1920s glamour: geometric symmetry, sunbursts, gold lines and luxurious materials.", phrase: "geometric Art Deco glamour", swatch: { background: "repeating-conic-gradient(from -90deg at 50% 100%,#c9a227 0 6deg,#141414 6deg 12deg)" } },
      { name: "Neo-noir", definition: "Modern film noir — rain-slick streets, hard shadows, moral ambiguity and a single hot accent.", phrase: "neo-noir shadow and rain-slick tension", swatch: { background: "repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 4px,transparent 4px 10px), linear-gradient(115deg,#0a0a0a 0 45%,#d7263d 45% 48%,#0a0a0a 48%)" } },
      { name: "Risograph", definition: "The look of riso printing: overlapping spot inks, slight misregistration and grainy fills.", phrase: "risograph print character with misregistered spot inks", swatch: { background: "radial-gradient(circle at 40% 45%,rgba(255,72,176,.85) 0 30%,transparent 31%), radial-gradient(circle at 60% 56%,rgba(0,120,191,.8) 0 30%,transparent 31%), #f5f0e1" } },
    ],
  },
  {
    id: "lighting",
    label: "Lighting",
    index: "03",
    blurb: "Where the light comes from, how hard it is, and what it reveals.",
    chipClass: "aria-pressed:border-warning aria-pressed:bg-warning aria-pressed:text-warning-foreground",
    dotClass: "bg-warning",
    terms: [
      { name: "Volumetric", definition: "Visible beams of light cutting through haze, dust or fog — light you can almost touch.", phrase: "volumetric light shafts cutting through atmospheric haze", swatch: { background: "linear-gradient(160deg,rgba(255,240,200,.75) 0 8%,transparent 32%), repeating-linear-gradient(110deg,rgba(255,255,255,.18) 0 6px,transparent 6px 22px), linear-gradient(180deg,#2b3a42,#0f1a20)" } },
      { name: "Chiaroscuro", definition: "Strong contrast between light and dark, as in Caravaggio — forms carved out of shadow.", phrase: "dramatic chiaroscuro contrast", swatch: { background: "radial-gradient(circle at 35% 40%,#f2d3a8 0,#7a4b2a 25%,#0a0806 55%)" } },
      { name: "Backlit", definition: "The light source sits behind the subject, creating glowing edges and silhouettes.", phrase: "glowing backlight that halos the silhouette", swatch: { background: "radial-gradient(circle at 50% 55%,#111 0 22%,#fff2c6 24%,#f5a65b 45%,#3a2a3d 80%)" } },
      { name: "Neon", definition: "Saturated, electric glow from colored tubes — nightlife, signage and cyber moods.", phrase: "saturated neon glow", swatch: { background: "radial-gradient(ellipse at 62% 42%,#ff2fd6 0 6%,rgba(255,47,214,.35) 18%,transparent 40%), radial-gradient(ellipse at 30% 70%,#00e5ff 0 4%,rgba(0,229,255,.3) 16%,transparent 35%), #0b0618" } },
      { name: "Diffused", definition: "Soft, even, shadowless light, like an overcast sky or a large softbox.", phrase: "soft, diffused even light", swatch: { background: "linear-gradient(180deg,#f3f1ec,#dfe3e6)" } },
      { name: "Golden Hour", definition: "The warm, low, flattering light just after sunrise or before sunset.", phrase: "warm golden-hour sunlight", swatch: { background: "linear-gradient(180deg,#ffcf71 0%,#f79d65 45%,#b5527f 100%)" } },
      { name: "Rim Lighting", definition: "A thin line of light tracing the subject's outline, separating it from the background.", phrase: "crisp rim lighting tracing every edge", swatch: { background: "radial-gradient(circle at 50% 50%,#0c0c0c 0 28%,#ffe9b8 29% 31%,#0c0c0c 35%)" } },
    ],
  },
  {
    id: "composition",
    label: "Composition",
    index: "04",
    blurb: "How the frame is organised and where the eye travels first.",
    chipClass: "aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-primary-foreground",
    dotClass: "bg-accent",
    terms: [
      { name: "Asymmetrical", definition: "Deliberately off-balance — visual weight on one side creates tension and movement.", phrase: "an asymmetrical, off-balance layout", swatch: { background: "radial-gradient(circle at 74% 34%,#5a6f7c 0 22%,transparent 23%), linear-gradient(#5a6f7c,#5a6f7c) 14% 84%/12% 14% no-repeat, #eef0f1" } },
      { name: "Centered", definition: "The subject sits dead centre — calm, iconic, confrontational.", phrase: "a centered, symmetrical frame", swatch: { background: "radial-gradient(circle at 50% 50%,#7a5a3e 0 20%,transparent 21%), #f1ece4" } },
      { name: "Isometric", definition: "A 3D view with no vanishing point, where parallel lines stay parallel — diagram-like and tidy.", phrase: "an isometric, axonometric viewpoint", swatch: { background: "repeating-linear-gradient(30deg,#9fb0bb 0 1px,transparent 1px 14px), repeating-linear-gradient(150deg,#9fb0bb 0 1px,transparent 1px 14px), #f7f8f9" } },
      // Close-up, Dynamic Perspective and Negative Space now live in Camera & Framing.
    ],
  },
  {
    id: "color",
    label: "Color",
    index: "05",
    blurb: "The palette strategy — how many hues, how loud, how they relate.",
    chipClass: "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground",
    dotClass: "bg-primary",
    terms: [
      { name: "Monochromatic", definition: "Many tints and shades of a single hue — cohesive and moody.", phrase: "a monochromatic tonal palette", swatch: { background: "linear-gradient(90deg,#0f2a3d 0 25%,#2f5d7c 25% 50%,#6c97b5 50% 75%,#b9d2e3 75%)" } },
      { name: "Duotone", definition: "Two contrasting inks replace the full spectrum — graphic and punchy.", phrase: "a bold duotone treatment", swatch: { background: "linear-gradient(135deg,#ff5e62 0 50%,#1e2a78 50%)" } },
      { name: "Iridescent", definition: "Colors that shift with the angle, like a soap bubble or oil on water.", phrase: "iridescent, shifting hues", swatch: { background: "linear-gradient(120deg,#a8edea,#fed6e3,#d4fc79,#96e6a1,#c2e9fb)" } },
      { name: "Pastel", definition: "Soft, light, low-saturation hues — gentle, sweet and approachable.", phrase: "soft pastel tones", swatch: { background: "linear-gradient(90deg,#ffd6e0 0 25%,#c1f0dc 25% 50%,#fff3b0 50% 75%,#cfe1ff 75%)" } },
      { name: "Vibrant", definition: "Highly saturated, high-energy color that demands attention.", phrase: "vibrant, saturated color", swatch: { background: "linear-gradient(90deg,#ff0054 0 25%,#ffbd00 25% 50%,#00c2a8 50% 75%,#390099 75%)" } },
      { name: "Muted", definition: "Desaturated, greyed-down hues — sophisticated, calm and understated.", phrase: "a muted, desaturated palette", swatch: { background: "linear-gradient(90deg,#a3a18f 0 25%,#b7a99a 25% 50%,#8e9aa3 50% 75%,#c9bfae 75%)" } },
      { name: "Gradient", definition: "Smooth transitions between hues — fluid, modern and luminous.", phrase: "smooth blended gradients", swatch: { background: "linear-gradient(135deg,#ff9a8b,#ff6a88 50%,#7f53ac)" } },
    ],
  },
  {
    id: "texture",
    label: "Texture",
    index: "06",
    blurb: "The surface quality — what it would feel like under your fingertips.",
    chipClass: "aria-pressed:border-success aria-pressed:bg-success aria-pressed:text-success-foreground",
    dotClass: "bg-success",
    terms: [
      { name: "Grainy", definition: "Visible noise or film grain that adds warmth, analog character and grit.", phrase: "visible film grain", swatch: { background: "repeating-radial-gradient(circle at 17% 32%,rgba(0,0,0,.2) 0 1px,transparent 1px 3px), linear-gradient(135deg,#d9c7a7,#a98b6b)" } },
      { name: "Glossy", definition: "Wet-look, high-shine surfaces with crisp specular highlights.", phrase: "high-gloss reflective surfaces", swatch: { background: "linear-gradient(180deg,rgba(255,255,255,.7) 0 38%,rgba(255,255,255,0) 40%), radial-gradient(circle at 50% 120%,#ff3d5a,#8c0019)" } },
      { name: "Metallic", definition: "Brushed or polished metal — chrome, steel, gold — reflective and premium.", phrase: "brushed metallic finishes", swatch: { background: "linear-gradient(135deg,#8e9eab 0%,#eef2f3 30%,#8e9eab 50%,#f5f7fa 70%,#6b7a86 100%)" } },
      { name: "Tactile", definition: "Surfaces that invite touch — paper, clay, fabric, handmade imperfections.", phrase: "tactile, handmade materiality", swatch: { background: "repeating-linear-gradient(45deg,rgba(0,0,0,.07) 0 2px,transparent 2px 6px), repeating-linear-gradient(-45deg,rgba(0,0,0,.07) 0 2px,transparent 2px 6px), #d8c9b4" } },
      { name: "Distressed", definition: "Worn, scratched and weathered — history and grit baked into the surface.", phrase: "distressed, weathered wear", swatch: { background: "radial-gradient(circle at 20% 30%,#e9e2d4 0 8%,transparent 9%), radial-gradient(circle at 70% 65%,#e9e2d4 0 12%,transparent 13%), radial-gradient(circle at 45% 82%,#e9e2d4 0 5%,transparent 6%), #3d5a6c" } },
      { name: "Halftone", definition: "Images built from dots of varying size, recalling comics and vintage print.", phrase: "halftone dot patterning", swatch: { background: "radial-gradient(circle,#1a1a1a 0 2.5px,transparent 3px) 0 0/10px 10px, #f2e8d5" } },
      { name: "Translucent", definition: "Semi-see-through materials — frosted glass, resin, gels — layered light.", phrase: "translucent, layered materials", swatch: { background: "linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,.15)) 30% 30%/55% 55% no-repeat, linear-gradient(135deg,#7fb7be,#d3a588)" } },
    ],
  },
]

export const CATEGORIES: Category[] = CATEGORY_ORDER.map((id) => {
  const base = BASE_CATEGORIES.find((c) => c.id === id) ?? NEW_CATEGORIES.find((c) => c.id === id)
  if (!base) return null
  const override = LABEL_OVERRIDES[id]
  return {
    ...base,
    ...(override ?? {}),
    blurb: override?.blurb ?? base.blurb,
    terms: [...base.terms, ...(EXTRA_TERMS[id] ?? [])],
  }
})
  .filter((c): c is Category => c !== null)
  .map((c, i) => ({ ...c, index: String(i + 1).padStart(2, "0") }))

export const TERM_INDEX: Record<string, { term: Term; category: Category }> = Object.fromEntries(
  CATEGORIES.flatMap((category) => category.terms.map((term) => [term.name, { term, category }])),
)

export const SURPRISE_PRESETS: string[][] = [
  ["Mysterious", "Neo-noir", "Chiaroscuro", "Close-up", "Duotone", "Grainy"],
  ["Nostalgic", "Retro-futurist", "Golden Hour", "Dynamic Perspective", "Gradient", "Glossy"],
  ["Playful", "Risograph", "Diffused", "Asymmetrical", "Vibrant", "Halftone"],
  ["Ethereal", "Minimalist", "Backlit", "Negative Space", "Pastel", "Translucent"],
  ["Cinematic", "Art Deco", "Rim Lighting", "Centered", "Monochromatic", "Metallic"],
  ["Surreal", "Psychedelic", "Neon", "Isometric", "Iridescent", "Glossy"],
  ["Whimsical", "Brutalist", "Volumetric", "Asymmetrical", "Muted", "Distressed"],
  ["Dreamlike", "Editorial", "Diffused", "Close-up", "Muted", "Tactile"],
  ["Cinematic", "Surreal", "Volumetric", "Negative Space", "Monochromatic", "Grainy"],
  ["Whimsical", "Retro-futurist", "Neon", "Isometric", "Pastel", "Glossy"],
]
