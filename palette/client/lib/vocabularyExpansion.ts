import type { Category, CategoryId, Term } from "./vocabulary"

/**
 * Expanded vocabulary. Add new terms to EXTRA_TERMS (for an existing category)
 * or add a whole category to NEW_CATEGORIES and list its id in CATEGORY_ORDER.
 */

export const CATEGORY_ORDER: CategoryId[] = [
  "mood",
  "style",
  "lighting",
  "camera",
  "composition",
  "color",
  "texture",
  "subject",
]

export const LABEL_OVERRIDES: Partial<Record<CategoryId, { label: string; short: string; blurb?: string }>> = {
  style: {
    label: "Styles & Aesthetics",
    short: "Style",
    blurb: "The visual language, art movements and aesthetic blends the work borrows from.",
  },
  color: {
    label: "Colors & Color Treatments",
    short: "Color",
    blurb: "Palette strategies, color relationships and the more unusual finishes.",
  },
}

export const EXTRA_TERMS: Partial<Record<CategoryId, Term[]>> = {
  style: [
    { name: "Surreal Romance", definition: "Love-story tenderness staged inside dream logic — moonlit embraces, floating petals, impossible skies.", phrase: "surreal romance with dreamlike, tender staging", swatch: { background: "linear-gradient(135deg,#3b2a6b,#c86fb4 60%,#f6c1d9)" } },
    { name: "Tropical Serenity", definition: "Calm island stillness: palm shadows, clear turquoise water and unhurried warmth.", phrase: "tropical serenity with palm shadows and still turquoise water", swatch: { background: "linear-gradient(160deg,#7fd6cf,#2f9e9a 60%,#1d5f5c)" } },
    { name: "Expressive Sketch", definition: "Loose, gestural pencil or ink lines that show the hand and the speed of drawing.", phrase: "an expressive, loose gestural sketch style", swatch: { background: "repeating-linear-gradient(70deg,rgba(0,0,0,.35) 0 1px,transparent 1px 7px), #f4f1ea" } },
    { name: "Zen Brushwork", definition: "Single-breath ink strokes in the sumi-e tradition — the ensō circle, restraint, and empty paper.", phrase: "zen ink brushwork with confident single strokes", swatch: { background: "radial-gradient(circle at 50% 50%,transparent 0 30%,#1a1a1a 31% 40%,transparent 41%), #efe8da" } },
    { name: "Minimalist Botanical", definition: "One plant or leaf, cleanly isolated on a quiet ground — botany as calm graphic form.", phrase: "minimalist botanical forms on a quiet ground", swatch: { background: "radial-gradient(ellipse at 50% 60%,#6f9a6a 0 18%,transparent 19%), #f3f1ec" } },
    { name: "Digital Abstract", definition: "Rendered, non-figurative forms — flowing tubes, gradients and synthetic light made in software.", phrase: "digital abstract forms with fluid rendered geometry", swatch: { background: "linear-gradient(135deg,#0b1f5c,#2f6bff 50%,#00e0ff)" } },
    { name: "Avant-garde Fashion", definition: "Experimental, sculptural clothing shot as art — silhouettes that challenge the body's outline.", phrase: "avant-garde fashion with sculptural silhouettes", swatch: { background: "linear-gradient(90deg,#d9d9d9 0 40%,#f5f5f5 40% 60%,#9a9a9a 60%)" } },
    { name: "Victorian Surrealism", definition: "19th-century engravings, lace and portraiture collaged into uncanny, impossible scenes.", phrase: "Victorian surrealism with antique collage elements", swatch: { background: "linear-gradient(135deg,#3d2b1f,#a67c52 55%,#e8d5b5)" } },
    { name: "Whimsical Illustration", definition: "Storybook illustration with soft magic, curious characters and gentle, playful color.", phrase: "whimsical storybook illustration", swatch: { background: "radial-gradient(circle at 30% 30%,#ffe08a 0 12%,transparent 13%), linear-gradient(135deg,#b8a6f0,#86d3c4)" } },
    { name: "Contemplative Minimalism", definition: "Spare spaces and slow light designed for stillness — the image as a pause.", phrase: "contemplative minimalism with quiet, slow light", swatch: { background: "linear-gradient(180deg,#e9e2d6 0 70%,#b9a88e 70%)" } },
    { name: "Abstract Expressionism", definition: "Large, energetic gestures of paint — emotion expressed through scribble, drip and bold color fields.", phrase: "abstract expressionist gestural paint", swatch: { background: "linear-gradient(120deg,#c62828 0 30%,#1e3a8a 30% 62%,#f5f0e6 62%)" } },
  ],
  lighting: [
    { name: "Lantern Glow", definition: "A small, warm, handheld light pooling softly in darkness — intimate and storybook.", phrase: "warm lantern glow pooling in surrounding darkness", swatch: { background: "radial-gradient(circle at 50% 55%,#ffd27a 0 8%,rgba(255,170,60,.45) 22%,#120c08 55%)" } },
    { name: "Dramatic Directional Lighting", definition: "One strong source from a clear direction, carving deep shadows and sculpting form.", phrase: "dramatic directional lighting from a single strong source", swatch: { background: "linear-gradient(110deg,#f1d9b5 0 30%,#3a2a20 60%,#0a0806)" } },
    { name: "Direct Sunlight", definition: "Unfiltered sun: crisp, hard-edged shadows and bright, high-contrast highlights.", phrase: "crisp direct sunlight casting hard-edged shadows", swatch: { background: "repeating-linear-gradient(135deg,#bdb6aa 0 10px,#f4efe4 10px 26px)" } },
    { name: "Filtered Forest Light", definition: "Sun breaking through a canopy into dappled shafts and pools of green-gold light.", phrase: "filtered forest light breaking through the canopy", swatch: { background: "linear-gradient(160deg,rgba(255,240,170,.8) 0 10%,transparent 35%), linear-gradient(180deg,#365c2a,#14260f)" } },
    { name: "Bright Diffused Light", definition: "Abundant, soft daylight with gentle shadows — airy, clean and optimistic.", phrase: "bright, airy diffused daylight", swatch: { background: "linear-gradient(180deg,#ffffff,#ece9e2)" } },
    { name: "Dramatic Side Lighting", definition: "Light raking in from the side so texture and contour read strongly against shadow.", phrase: "dramatic side lighting raking across the subject", swatch: { background: "linear-gradient(90deg,#f3e2c8 0 22%,#4a3a2e 48%,#080808)" } },
    { name: "Diffused Glow", definition: "Soft bloom and haze around highlights — light that seems to radiate from within.", phrase: "a soft diffused glow with gentle light bloom", swatch: { background: "radial-gradient(circle at 50% 45%,#fff8ee 0,#f5d9e6 45%,#c9b6e4 100%)" } },
    { name: "Dramatic Spotlight", definition: "A tight cone of light isolating the subject on a dark stage.", phrase: "a dramatic spotlight isolating the subject in darkness", swatch: { background: "radial-gradient(ellipse at 50% 75%,#fff4d8 0 14%,rgba(255,244,216,.2) 30%,#050505 55%)" } },
    { name: "Split Side Lighting", definition: "Light hits exactly half the face, leaving the other half in shadow — bold and enigmatic.", phrase: "split lighting dividing the face into light and shadow", swatch: { background: "linear-gradient(90deg,#e8e2d8 0 50%,#111 50%)" } },
    { name: "Ring Illumination", definition: "A circular light around the lens: even, shadowless faces and ring-shaped catchlights in the eyes.", phrase: "even ring-light illumination with circular catchlights", swatch: { background: "radial-gradient(circle,transparent 0 26%,#ffffff 28% 36%,transparent 38%), #1d2a44" } },
    { name: "Diffused Natural Light", definition: "Window or overcast daylight softened through sheer curtains — honest and flattering.", phrase: "soft diffused natural window light", swatch: { background: "linear-gradient(90deg,#fbfaf7,#e6e1d7)" } },
    { name: "Rembrandt Lighting", definition: "A classic portrait setup: key light high and to the side, leaving a small triangle of light on the shadowed cheek.", phrase: "Rembrandt lighting with a triangle of light on the shadowed cheek", swatch: { background: "radial-gradient(circle at 34% 38%,#e9c9a0 0,#6b4a33 30%,#0c0a08 62%)" } },
    { name: "Softbox Lighting", definition: "Studio light through a large diffusing box — controlled, wrap-around and commercial.", phrase: "clean softbox studio lighting", swatch: { background: "linear-gradient(#f7f7f7,#f7f7f7) 50% 40%/44% 56% no-repeat, #1b1b1b" } },
  ],
  composition: [
    { name: "Rule of Thirds", definition: "Key elements placed on the lines and crossings of a three-by-three grid for natural balance.", phrase: "a rule-of-thirds arrangement", swatch: { background: "radial-gradient(circle at 66% 34%,#5a6f7c 0 9%,transparent 10%), linear-gradient(90deg,transparent 33%,rgba(90,111,124,.35) 33% 34%,transparent 34% 66%,rgba(90,111,124,.35) 66% 67%,transparent 67%), linear-gradient(180deg,transparent 33%,rgba(90,111,124,.35) 33% 34%,transparent 34% 66%,rgba(90,111,124,.35) 66% 67%,transparent 67%), #eef0f1" } },
    { name: "Leading Lines", definition: "Roads, rails or edges that guide the eye straight toward the subject.", phrase: "strong leading lines guiding the eye", swatch: { background: "conic-gradient(from 160deg at 50% 30%,#eef0f1 0 10deg,#5a6f7c 10deg 14deg,#eef0f1 14deg 26deg,#5a6f7c 26deg 30deg,#eef0f1 30deg)" } },
    { name: "Frame Within a Frame", definition: "Doorways, windows or arches that enclose the subject and add depth.", phrase: "a frame-within-a-frame composition", swatch: { background: "linear-gradient(#eef0f1,#eef0f1) 50% 50%/50% 56% no-repeat, linear-gradient(#5a6f7c,#5a6f7c) 50% 50%/70% 76% no-repeat, #eef0f1" } },
    { name: "Layered Depth", definition: "Distinct foreground, midground and background planes stacked to create space.", phrase: "layered foreground, midground and background depth", swatch: { background: "linear-gradient(180deg,#d7dde1 0 40%,#9fb0bb 40% 65%,#5a6f7c 65% 85%,#2f3d45 85%)" } },
  ],
  color: [
    { name: "Purple and Orange Palette", definition: "A warm-cool complementary pairing — dusky violet set against glowing orange.", phrase: "a purple and orange palette", swatch: { background: "linear-gradient(135deg,#5b2a86 0 50%,#ff8c32 50%)" } },
    { name: "Muted Grey Tones", definition: "Soft, quiet greys with barely-there color — calm, sober and sophisticated.", phrase: "muted grey tones", swatch: { background: "linear-gradient(90deg,#5e6266 0 25%,#8a8e92 25% 50%,#b3b5b7 50% 75%,#d8d9da 75%)" } },
    { name: "Blue and Gold Palette", definition: "Deep blue paired with metallic or warm gold — regal, celestial and luxurious.", phrase: "a regal blue and gold palette", swatch: { background: "linear-gradient(135deg,#0f2557 0 60%,#d4a72c 60%)" } },
    { name: "Turquoise and Coral", definition: "Tropical complementary hues: cool sea turquoise against warm living coral.", phrase: "a turquoise and coral palette", swatch: { background: "linear-gradient(135deg,#1fb5ac 0 50%,#ff7f66 50%)" } },
    { name: "Iridescent Coral Orange", definition: "Coral and orange that shimmer and shift toward pink and gold as the angle changes.", phrase: "iridescent coral-orange sheen", swatch: { background: "linear-gradient(120deg,#ff9a76,#ffcf8a 35%,#ff7aa8 65%,#ffb36b)" } },
    { name: "Prismatic Color Spectrum", definition: "Light split into the full rainbow, like a prism or a lens flare.", phrase: "a prismatic color spectrum", swatch: { background: "linear-gradient(90deg,#ff3b3b,#ff9f1c,#ffe14d,#3ddc84,#3a86ff,#8f5cff)" } },
    { name: "Purple and Pink Blend", definition: "Analogous violet and pink melting into each other — romantic, dreamy and soft.", phrase: "a blended purple and pink palette", swatch: { background: "linear-gradient(135deg,#7b3fe4,#e85fb6)" } },
    { name: "Neon Color Palette", definition: "Fluorescent, electric hues — hot pink, acid green, cyan — that seem to emit light.", phrase: "an electric neon color palette", swatch: { background: "linear-gradient(90deg,#ff2bd6 0 33%,#39ff14 33% 66%,#00f0ff 66%), #000" } },
    { name: "Black and White", definition: "No hue at all — tone, contrast and shape carry everything.", phrase: "a black and white tonal treatment", swatch: { background: "linear-gradient(90deg,#0d0d0d 0 50%,#f2f2f2 50%)" } },
    { name: "Warm Amber Tones", definition: "Honeyed oranges and browns — firelight, whisky and late afternoon warmth.", phrase: "warm amber tones", swatch: { background: "linear-gradient(135deg,#ffbf47,#d9822b 50%,#7a3e12)" } },
    { name: "Crimson Red Palette", definition: "Deep, saturated reds dominate — passion, danger and drama.", phrase: "a dominant crimson red palette", swatch: { background: "linear-gradient(135deg,#4a0010,#b3001b 50%,#e63946)" } },
    { name: "Golden Yellow and Green", definition: "Sunny yellow against fresh green — meadows, citrus and spring energy.", phrase: "a golden yellow and green palette", swatch: { background: "linear-gradient(135deg,#f6c445 0 50%,#4c9a2a 50%)" } },
    { name: "Analogous Colors", definition: "Neighbouring hues on the color wheel — harmonious, low-tension and cohesive.", phrase: "a harmonious analogous color scheme", swatch: { background: "linear-gradient(90deg,#2a9d8f 0 33%,#3fa7c9 33% 66%,#457b9d 66%)" } },
    { name: "Complementary Colors", definition: "Opposites on the color wheel placed together for maximum vibration and contrast.", phrase: "bold complementary color contrast", swatch: { background: "linear-gradient(135deg,#1d4ed8 0 50%,#f59e0b 50%)" } },
    { name: "Holographic", definition: "Foil-like rainbow sheen with metallic pastels that shift across the surface.", phrase: "a holographic foil sheen", swatch: { background: "linear-gradient(115deg,#c3f0ff,#f6c5ff 30%,#d6ffcf 55%,#ffe7b8 75%,#c9d2ff)" } },
  ],
}

const cameraTerms: Term[] = [
  { name: "Low-angle Shot", definition: "The camera sits below the subject looking up, making it feel taller, stronger or more heroic.", phrase: "a low-angle shot looking up at the subject", swatch: { background: "conic-gradient(from 150deg at 50% 100%,#e8e2d8 0 30deg,#7a5a3e 30deg 34deg,#e8e2d8 34deg 60deg)" } },
  { name: "High-angle Shot", definition: "The camera looks down on the subject, making it feel smaller, vulnerable or observed.", phrase: "a high-angle shot looking down on the scene", swatch: { background: "conic-gradient(from -30deg at 50% 0%,#e8e2d8 0 30deg,#7a5a3e 30deg 34deg,#e8e2d8 34deg 60deg)" } },
  { name: "Eye-level Shot", definition: "The lens meets the subject at eye height — neutral, direct and relatable.", phrase: "a direct eye-level shot", swatch: { background: "linear-gradient(180deg,#e8e2d8 0 49%,#7a5a3e 49% 51%,#e8e2d8 51%)" } },
  { name: "Overhead / Bird's-eye View", definition: "Looking straight down from above, turning the scene into a pattern or map.", phrase: "an overhead bird's-eye view", swatch: { background: "radial-gradient(circle at 30% 30%,#f4a261 0 8%,transparent 9%), radial-gradient(circle at 70% 60%,#e76f51 0 8%,transparent 9%), linear-gradient(135deg,#f1e3c6 0 55%,#4cb5c4 55%)" } },
  { name: "Worm's-eye View", definition: "An extreme upward view from ground level, making surroundings tower overhead.", phrase: "a dramatic worm's-eye view from ground level", swatch: { background: "conic-gradient(from 0deg at 50% 50%,#3f5566 0 20deg,#cfe3ee 20deg 70deg,#3f5566 70deg 110deg,#cfe3ee 110deg 160deg,#3f5566 160deg 200deg,#cfe3ee 200deg 250deg,#3f5566 250deg 290deg,#cfe3ee 290deg 340deg,#3f5566 340deg)" } },
  { name: "Dutch Angle", definition: "The camera is tilted so the horizon slants — unease, tension and disorientation.", phrase: "a tilted Dutch angle", swatch: { background: "linear-gradient(-18deg,#e8e2d8 0 48%,#7a5a3e 48% 52%,#2f3d45 52%)" } },
  { name: "Three-quarter View", definition: "The subject is turned roughly 45° from camera, showing both the face and its depth.", phrase: "a three-quarter view of the subject", swatch: { background: "radial-gradient(ellipse 30% 40% at 46% 50%,#d9b99b 0 98%,transparent 100%), linear-gradient(90deg,#efe8dc,#c9bba8)" } },
  { name: "Profile View", definition: "A pure side view — the silhouette of brow, nose and chin reads like a cameo.", phrase: "a clean profile view", swatch: { background: "radial-gradient(ellipse 22% 38% at 42% 50%,#2b2b2b 0 98%,transparent 100%), #e8e2d8" } },
  { name: "Extreme Close-up", definition: "A single detail — an eye, a texture, a fingertip — fills the entire frame.", phrase: "an extreme close-up on a single detail", swatch: { background: "radial-gradient(circle at 50% 50%,#111 0 14%,#4a6b54 15% 34%,#d8c3a5 35%)" } },
  { name: "Close-up", definition: "Tight framing on a detail — intimacy, texture and emotion over context.", phrase: "an intimate close-up crop", swatch: { background: "radial-gradient(circle at 50% 50%,#2b2b2b 0 16%,#5a6f7c 17% 40%,#d9cbb6 41% 100%)" } },
  { name: "Medium Shot", definition: "The subject framed from about the waist up — personal but with gesture and context.", phrase: "a waist-up medium shot", swatch: { background: "radial-gradient(circle at 50% 30%,#7a5a3e 0 12%,transparent 13%), linear-gradient(#7a5a3e,#7a5a3e) 50% 100%/44% 52% no-repeat, #ece6dc" } },
  { name: "Wide Shot", definition: "The full subject within its environment — place and scale become part of the story.", phrase: "a wide shot showing the subject within its environment", swatch: { background: "linear-gradient(#2b2b2b,#2b2b2b) 50% 70%/4% 14% no-repeat, linear-gradient(180deg,#f2c58a 0 64%,#b9855a 64%)" } },
  { name: "Extreme Wide Shot", definition: "The subject is tiny inside a vast landscape — scale, solitude and epic space.", phrase: "an extreme wide shot with a tiny figure in a vast landscape", swatch: { background: "linear-gradient(#2b2b2b,#2b2b2b) 62% 70%/1.5% 5% no-repeat, linear-gradient(180deg,#cfe0ea 0 58%,#d9a873 58%)" } },
  { name: "Macro Photography", definition: "Lens-to-subject close enough to reveal tiny worlds — droplets, pollen, fibres — larger than life.", phrase: "macro photography revealing minute detail", swatch: { background: "radial-gradient(circle at 40% 45%,rgba(255,255,255,.9) 0 6%,rgba(255,255,255,.2) 14%,transparent 22%), radial-gradient(circle at 50% 50%,#9bd36b,#2f6d2b)" } },
  { name: "Shallow Depth of Field", definition: "Only a thin slice is sharp; everything else melts into creamy blur and bokeh.", phrase: "a shallow depth of field with soft bokeh", swatch: { background: "radial-gradient(circle at 25% 30%,rgba(255,240,200,.7) 0 8%,transparent 12%), radial-gradient(circle at 75% 25%,rgba(255,240,200,.5) 0 6%,transparent 10%), radial-gradient(circle at 50% 60%,#fff 0 7%,transparent 8%), linear-gradient(135deg,#6a8f4e,#2e4a22)" } },
  { name: "Deep Focus", definition: "Everything from the nearest rock to the far horizon is crisp and readable.", phrase: "deep focus with sharp detail from foreground to horizon", swatch: { background: "linear-gradient(180deg,#a9c6dc 0 35%,#566b78 35% 55%,#7d9aa6 55% 75%,#6b5a46 75%)" } },
  { name: "Symmetrical Framing", definition: "The frame mirrors perfectly left to right — formal, hypnotic and very deliberate.", phrase: "perfectly symmetrical framing", swatch: { background: "linear-gradient(90deg,#7a5a3e 0 20%,#e8e2d8 20% 80%,#7a5a3e 80%)" } },
  { name: "Off-center Composition", definition: "The subject sits well away from centre, letting space and imbalance do the talking.", phrase: "an off-center composition", swatch: { background: "radial-gradient(circle at 22% 60%,#7a5a3e 0 12%,transparent 13%), #f1ece4" } },
  { name: "Negative Space", definition: "Empty area used as an active element — the silence that makes the subject speak.", phrase: "generous negative space", swatch: { background: "radial-gradient(circle at 84% 80%,#1a1a1a 0 5%,transparent 6%), #f5f3ef" } },
  { name: "Dynamic Perspective", definition: "Extreme angles and converging lines that pull the viewer into motion.", phrase: "a dynamic, low-angle perspective", swatch: { background: "repeating-conic-gradient(from 10deg at 8% 100%,#e8e2d8 0 6deg,#7a5a3e 6deg 8deg)" } },
]

const subjectTerms: Term[] = [
  { name: "Wooden Architecture", definition: "Timber structures — beams, slats and joinery — warm, crafted and natural.", phrase: "wooden architecture with exposed timber joinery", swatch: { background: "repeating-linear-gradient(90deg,#8a5a34 0 6px,#b07a4c 6px 9px,#9c6a40 9px 14px)" } },
  { name: "Profile Portrait", definition: "A person seen in side profile, the outline of the face as the main graphic shape.", phrase: "a profile portrait", swatch: { background: "radial-gradient(ellipse 22% 38% at 42% 50%,#5b4a6b 0 98%,transparent 100%), #f2c6d6" } },
  { name: "Flowing Silk", definition: "Lengths of silk caught mid-motion — rippling folds, sheen and movement.", phrase: "flowing silk fabric caught mid-motion", swatch: { background: "repeating-linear-gradient(120deg,#9b0f24 0 10px,#d6354f 10px 18px,#7a0a1b 18px 26px)" } },
  { name: "Layered Textures", definition: "Stacked paper, fabric or materials whose edges and depths become the subject.", phrase: "layered, stacked textures", swatch: { background: "linear-gradient(180deg,#cfe3ee 0 25%,#9fc3d8 25% 50%,#6f9fbd 50% 75%,#4a7a99 75%)" } },
  { name: "Curved Paper Sculptures", definition: "Folded and curved paper forms — soft shadows, crisp edges, handmade precision.", phrase: "curved paper sculptures with soft shadows", swatch: { background: "radial-gradient(circle at 20% 100%,transparent 0 40%,#ffffff 41% 48%,transparent 49%), radial-gradient(circle at 80% 0%,transparent 0 40%,#ffffff 41% 48%,transparent 49%), #d9d6d0" } },
  { name: "Isolated Figure", definition: "One solitary person alone in a large space — reflective, lonely or heroic.", phrase: "a single isolated figure", swatch: { background: "linear-gradient(#111,#111) 50% 72%/4% 16% no-repeat, linear-gradient(180deg,#1b2a4a 0 70%,#2f4a2a 70%)" } },
  { name: "Floating Bubbles", definition: "Soap bubbles drifting in the air, their thin skins full of reflected color.", phrase: "floating iridescent bubbles", swatch: { background: "radial-gradient(circle at 30% 40%,transparent 0 12%,rgba(200,240,255,.8) 13% 15%,transparent 16%), radial-gradient(circle at 68% 62%,transparent 0 16%,rgba(255,210,240,.8) 17% 19%,transparent 20%), #0e0e1a" } },
  { name: "Geometric Sculpture", definition: "A crisp sculptural object built from geometric primitives — cubes, arcs, spheres.", phrase: "a geometric sculpture", swatch: { background: "linear-gradient(#2a9d8f,#2a9d8f) 50% 34%/30% 30% no-repeat, linear-gradient(#e8d9c0,#e8d9c0) 50% 80%/56% 34% no-repeat, #f4efe6" } },
  { name: "Floral Cityscape", definition: "Blooms in the foreground with a city skyline behind — nature softening the urban.", phrase: "a floral cityscape with blooms framing the skyline", swatch: { background: "radial-gradient(circle at 20% 85%,#ff7aa8 0 8%,transparent 9%), radial-gradient(circle at 60% 90%,#ffd166 0 7%,transparent 8%), linear-gradient(180deg,#bcd8ec 0 40%,#6b7f92 40% 75%,#3f6b3a 75%)" } },
  { name: "Tiered Platforms", definition: "Stacked steps and levels — stage-like plinths that give objects a hierarchy.", phrase: "tiered platforms and stepped plinths", swatch: { background: "linear-gradient(#ffffff,#ffffff) 50% 30%/30% 20% no-repeat, linear-gradient(#e6e1d8,#e6e1d8) 50% 55%/55% 22% no-repeat, linear-gradient(#cfc8bc,#cfc8bc) 50% 82%/80% 24% no-repeat, #f4f1ec" } },
  { name: "Centered Astronaut", definition: "A lone astronaut placed dead-centre — wonder, isolation and the unknown.", phrase: "a centered astronaut figure", swatch: { background: "radial-gradient(circle at 50% 40%,#f2f2f2 0 10%,#ff7a1a 11% 18%,transparent 19%), linear-gradient(180deg,#9fc8e8 0 60%,#5c8a3e 60%)" } },
  { name: "Balanced Stones", definition: "Smooth stones stacked in quiet equilibrium — patience, calm and precision.", phrase: "precariously balanced stones", swatch: { background: "radial-gradient(ellipse 18% 9% at 50% 30%,#3d3d3d 0 98%,transparent 100%), radial-gradient(ellipse 24% 11% at 50% 50%,#2b2b2b 0 98%,transparent 100%), radial-gradient(ellipse 30% 13% at 50% 72%,#1c1c1c 0 98%,transparent 100%), #d9d4cc" } },
]

export const NEW_CATEGORIES: Category[] = [
  {
    id: "camera",
    label: "Camera & Framing",
    short: "Camera",
    index: "",
    blurb: "Where the lens sits, how close it gets and what stays in focus.",
    chipClass: "aria-pressed:border-destructive aria-pressed:bg-destructive aria-pressed:text-destructive-foreground",
    dotClass: "bg-destructive",
    terms: cameraTerms,
  },
  {
    id: "subject",
    label: "Subjects & Visual Concepts",
    short: "Subjects",
    index: "",
    blurb: "Optional motifs to weave in — they add to your brief, never replace it.",
    chipClass: "aria-pressed:border-[#5f5f7a] aria-pressed:bg-[#5f5f7a] aria-pressed:text-primary-foreground",
    dotClass: "bg-[#5f5f7a]",
    terms: subjectTerms,
  },
]
