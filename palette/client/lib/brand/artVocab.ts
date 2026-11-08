import type { Ratio } from "./types";

/** Minimal shape every chip picker understands. */
export type ChipTerm = { name: string; swatch: string; meaning: string; influence: string; image?: string; phrase?: string };

const c = (name: string, swatch: string, meaning: string, influence: string, phrase?: string, image?: string): ChipTerm => ({
  name,
  swatch,
  meaning,
  influence,
  phrase,
  image,
});

// ——— Color directions ———
export const COLOR_DIRECTIONS: ChipTerm[] = [
  c("Earthy", "linear-gradient(90deg, #6b4a2f 0 25%, #a7744a 25% 50%, #7d8a5a 50% 75%, #e3d5bd 75%)", "Soil, clay, bark and moss.", "Grounds the brand in nature and craft; reads honest and warm."),
  c("Vibrant", "linear-gradient(90deg, #ff3d6e 0 25%, #ffcc00 25% 50%, #00c2ff 50% 75%, #7a2cff 75%)", "High-saturation, high-energy color.", "Instant visibility and youthful energy; needs a calm neutral to rest on."),
  c("Muted", "linear-gradient(90deg, #8c8279 0 25%, #a59a8a 25% 50%, #7d8b8c 50% 75%, #d9d3c9 75%)", "Greyed-down, desaturated hues.", "Sophisticated and calm — lets typography and photography lead."),
  c("Pastel", "linear-gradient(90deg, #ffc8dd 0 25%, #cdb4db 25% 50%, #bde0fe 50% 75%, #fdf0c2 75%)", "Soft, light, sugared tints.", "Gentle and approachable; great for wellness, kids and confectionery."),
  c("Monochromatic", "linear-gradient(90deg, #1f3a5f 0 25%, #3d5a80 25% 50%, #98c1d9 50% 75%, #e0ecf4 75%)", "Many values of one hue.", "Cohesive and confident; hierarchy comes from light and dark."),
  c("Analogous", "linear-gradient(90deg, #e76f51 0 33%, #f4a261 33% 66%, #e9c46a 66%)", "Neighbouring hues on the wheel.", "Harmonious and low-tension — a warm or cool family that flows."),
  c("Complementary", "linear-gradient(90deg, #2a4d8f 0 50%, #f08a24 50%)", "Opposites on the color wheel.", "Maximum vibration and contrast — great for a hero accent."),
  c("Warm", "linear-gradient(90deg, #9e2a2b 0 33%, #e09f3e 33% 66%, #fff3b0 66%)", "Reds, oranges and golds.", "Inviting, appetising and energetic."),
  c("Cool", "linear-gradient(90deg, #12355b 0 33%, #4a7c94 33% 66%, #c7e8f3 66%)", "Blues, teals and cool greens.", "Calm, clean and trustworthy."),
  c("Jewel Tones", "linear-gradient(90deg, #0b6e4f 0 25%, #1d3c87 25% 50%, #6a1b5f 50% 75%, #a4161a 75%)", "Emerald, sapphire, amethyst, ruby.", "Rich, luxurious depth with saturated darks."),
];

// ——— Typography ———
export const TYPE_CLASSIFICATIONS: ChipTerm[] = [
  c("Serif", "linear-gradient(#f3eee4,#f3eee4)", "Letters finished with small strokes (serifs).", "Signals heritage, editorial authority and warmth."),
  c("Sans serif", "linear-gradient(#e8ecf2,#e8ecf2)", "Clean letters without serifs.", "Modern, neutral and highly legible on screens."),
  c("Slab serif", "linear-gradient(#efe2cf,#efe2cf)", "Heavy, block-like serifs.", "Sturdy, rugged and a little retro — great for crafted or industrial brands."),
  c("Script", "linear-gradient(#f8e1ea,#f8e1ea)", "Connected, handwriting-like strokes.", "Personal, romantic or handmade; best used sparingly."),
  c("Display", "linear-gradient(#e9e0ff,#e9e0ff)", "Characterful faces designed for large sizes.", "Gives headlines a strong signature voice."),
  c("Monospace", "linear-gradient(#e2eadf,#e2eadf)", "Every character takes the same width.", "Technical, honest and code-like."),
];

export const TYPE_PERSONALITY: ChipTerm[] = [
  c("Elegant", "linear-gradient(135deg,#2b2730,#c9b9a6)", "Graceful proportions and fine detail.", "Leans toward high-contrast serifs and light weights."),
  c("Whimsical", "radial-gradient(circle,#ffc6e0 0 30%,#fff6d6 31%)", "Quirky and storybook.", "Favors soft, irregular display faces and scripts."),
  c("Expressive", "linear-gradient(110deg,#ff5f6d,#845ec2)", "Big gestures and personality.", "Favors dramatic display faces and strong contrast."),
  c("Geometric", "conic-gradient(#111 0 25%,#eee 25% 50%,#111 50% 75%,#eee 75%)", "Built from circles, squares and straight lines.", "Favors constructed sans serifs."),
  c("Editorial", "repeating-linear-gradient(180deg,#f4efe6 0 6px,#d8d1c4 6px 7px)", "Magazine authority.", "Favors refined serifs with strong italics."),
  c("Friendly", "radial-gradient(circle,#ffb37a 0 40%,#fff1dc 41%)", "Open, warm and easy to read.", "Favors humanist and rounded sans serifs."),
  c("Retro", "linear-gradient(180deg,#f3d9a4,#8c5a3c)", "Echoes a past decade.", "Favors slabs, groovy display faces and vintage scripts."),
  c("Experimental", "repeating-linear-gradient(45deg,#111 0 4px,#0ff 4px 8px)", "Unusual construction.", "Favors variable, extended or deconstructed faces."),
  c("Sophisticated", "linear-gradient(160deg,#1b1b1b,#6d5f71)", "Cultured restraint.", "Favors classic serifs and precise grotesques."),
];

export const TYPE_SHAPE: ChipTerm[] = [
  c("Light", "linear-gradient(#fafafa,#fafafa)", "Thin strokes.", "Airy, delicate and premium at large sizes."),
  c("Regular", "linear-gradient(#e6e6e6,#e6e6e6)", "Book weight.", "Balanced and readable."),
  c("Bold", "linear-gradient(#555,#555)", "Heavy strokes.", "Confident and attention-grabbing."),
  c("Heavy", "linear-gradient(#111,#111)", "Black / ultra weights.", "Loud, poster-like presence."),
  c("Condensed", "repeating-linear-gradient(90deg,#222 0 3px,#eee 3px 6px)", "Narrow letters.", "Urgent, sporty and space-efficient."),
  c("Extended", "repeating-linear-gradient(90deg,#222 0 10px,#eee 10px 16px)", "Wide letters.", "Futuristic, stable and architectural."),
  c("Rounded", "radial-gradient(circle,#7ee0d4 0 45%,#effaf8 46%)", "Soft terminals.", "Friendly, playful and approachable."),
  c("High contrast", "linear-gradient(90deg,#111 0 15%,#eee 15% 80%,#111 80%)", "Thick-thin stroke variation.", "Fashion, luxury and editorial drama."),
];

// ——— Logo & graphic language ———
export const LOGO_DIRECTIONS: ChipTerm[] = [
  c("Wordmark", "linear-gradient(#f3eee4,#f3eee4)", "The full name set as the logo.", "Best when the name is distinctive; relies on custom spacing and letter details."),
  c("Monogram", "radial-gradient(circle,#2b2730 0 45%,#ccb7ed 46%)", "Initials interlocked into a compact mark.", "Feels heritage or luxury; scales down beautifully for stamps and favicons."),
  c("Combination Mark", "linear-gradient(90deg,#614a8a 0 30%,#f3eee4 30%)", "A symbol paired with the wordmark.", "Flexible: the symbol can later stand alone once recognized."),
  c("Emblem", "radial-gradient(circle,#f3eee4 0 40%,#2b2730 41% 50%,#f3eee4 51%)", "Name enclosed in a badge, seal or crest.", "Traditional, crafted or collegiate; great on packaging and merch."),
  c("Symbol", "conic-gradient(from 45deg,#e8432e 0 25%,#111 25% 50%,#e8432e 50% 75%,#111 75%)", "An abstract or pictorial icon.", "Iconic and language-free — needs a strong idea behind it."),
  c("Typographic", "repeating-linear-gradient(180deg,#111 0 6px,#eee 6px 12px)", "Type arranged as a graphic composition.", "Stacked, cropped or split letters that become a pattern."),
];

export const GRAPHIC_LANGUAGE: ChipTerm[] = [
  c("Geometric", "conic-gradient(#111 0 25%,#eee 25% 50%,#111 50% 75%,#eee 75%)", "Circles, grids and precise angles.", "Systems, patterns and icons built from simple shapes."),
  c("Organic", "radial-gradient(ellipse at 40% 60%,#c8a98a 0 30%,#ece6dc 31%)", "Soft, natural, irregular forms.", "Blobs, leaves and flowing curves that feel alive."),
  c("Illustrated", "radial-gradient(circle at 30% 40%,#ffb37a 0 18%,transparent 19%),radial-gradient(circle at 70% 60%,#7ee0d4 0 22%,transparent 23%),#fff6d6", "Drawn scenes and characters.", "Storytelling illustration across packaging and campaigns."),
  c("Minimal", "radial-gradient(circle,#1a1a1a 0 8%,#f2f0ec 9%)", "One idea, very few marks.", "Lines and dots used sparingly; negative space does the work."),
  c("Vintage", "linear-gradient(180deg,#f3d9a4,#8c5a3c)", "Old print and signage cues.", "Badges, rules, ornaments and worn ink textures."),
  c("Expressive", "linear-gradient(110deg,#ff5f6d,#ffc371 50%,#845ec2)", "Gestural, energetic marks.", "Brushstrokes, scribbles and bold, emotive color."),
  c("Abstract", "linear-gradient(120deg,#f2f2f2 0 45%,#111 45% 55%,#7a6bd1 55%)", "Non-figurative shapes.", "Conceptual forms that suggest rather than depict."),
];

// ——— Imagery ———
export const IMAGE_KINDS: ChipTerm[] = [
  c("Product", "radial-gradient(circle at 50% 42%,#3b2f2a 0 26%,transparent 27%),linear-gradient(#efe9df 0 64%,#d9d0c2 64%)", "The product itself is the picture: packshots, hero angles and close-ups of material and detail, usually on a clean or seamless background.", "Best when what you sell is the proof — texture, form and finish do the talking. Use it for shop pages, packaging and launch hero images.", "product photography"),
  c("Portrait", "radial-gradient(circle at 50% 38%,#c9a085 0 20%,transparent 21%),radial-gradient(ellipse at 50% 92%,#7b5a8f 0 42%,transparent 43%),#e7dcef", "People as the face of the brand: founders, makers, customers, models. Expression, styling and gaze set the tone before any copy is read.", "Best for brands built on trust, craft or community. Use it for About pages, campaigns and social where a human face carries the personality.", "portrait photography"),
  c("Lifestyle", "linear-gradient(180deg,#f3e1c6 0 55%,#c98d5e 55% 78%,#6e4b36 78%)", "The brand inside a real moment — in use, in a room, in a hand, in daylight. The product is present but the scene is the subject.", "Best for showing who it's for and how it feels to live with. Use it for homepage heroes, social and editorial spreads.", "lifestyle photography"),
  c("Illustration", "radial-gradient(circle at 30% 40%,#ffb37a 0 18%,transparent 19%),radial-gradient(circle at 70% 60%,#7ee0d4 0 22%,transparent 23%),#fff6d6", "Drawn rather than photographed: flat, textured, painterly or vector. Characters, scenes and symbols you fully own.", "Best when photography can't show the idea (services, software, abstract benefits) or when a distinct drawn world is the brand. Use it for onboarding, packaging and spot art.", "illustration"),
  c("Mixed", "linear-gradient(135deg,#efe9df 0 50%,transparent 50%),radial-gradient(circle at 72% 30%,#ffb37a 0 14%,transparent 15%),linear-gradient(135deg,transparent 0 50%,#ccb7ed 50%)", "Photography combined with graphics, type or collage: cut-outs, drawn marks over photos, layered textures.", "Best for editorial, energetic brands that want range without losing a signature. Use it for campaigns, zines and social series.", "mixed-media imagery"),
];

export const LIGHTING: ChipTerm[] = [
  c("Soft diffused light", "linear-gradient(180deg,#f7f3ee,#ddd5cc)", "Even, gentle light with soft shadows.", "Calm, clean and flattering — the default for premium product work.", "soft diffused light with gentle shadows"),
  c("Dramatic directional light", "linear-gradient(110deg,#f2e3c9 0 30%,#1b1712 70%)", "One strong source carving form.", "Adds sculpture, mood and premium tension.", "dramatic directional light carving deep shadows"),
  c("Golden hour", "linear-gradient(180deg,#ffd27a,#e9855a 60%,#6d3b47)", "Warm, low sun before sunset.", "Nostalgic warmth and optimism.", "warm golden-hour sunlight"),
  c("Rim lighting", "radial-gradient(circle at 50% 50%,#111 0 40%,#f5e6c8 42%,#111 48%)", "A bright outline separating subject from background.", "Drama and silhouette — great on dark grounds.", "crisp rim lighting outlining the subject"),
  c("Natural daylight", "linear-gradient(90deg,#fffaf0,#e7eef2)", "Honest window or outdoor light.", "Authentic, fresh and approachable.", "natural window daylight"),
  c("Cinematic lighting", "linear-gradient(135deg,#0d2b3e,#14596b 50%,#e8894a)", "Graded, story-driven light like a film still.", "Narrative mood with teal-and-amber depth.", "cinematic, story-driven lighting"),
  c("Dramatic spotlight", "radial-gradient(ellipse at 50% 40%,#f7efd8 0 18%,#111 45%)", "A tight pool of light on a dark stage.", "Isolates a hero product or person theatrically.", "a dramatic spotlight on a dark stage"),
];

export const CAMERA: ChipTerm[] = [
  c("Low angle", "conic-gradient(from 160deg at 50% 100%,#3d5a80 0 40deg,#cfe1ef 40deg)", "Camera below, looking up.", "Heroic, powerful and aspirational.", "a low-angle view looking up"),
  c("High angle", "conic-gradient(from -20deg at 50% 0%,#3d5a80 0 40deg,#cfe1ef 40deg)", "Camera above, looking down.", "Observational, gentle and contextual.", "a high-angle view looking down"),
  c("Eye level", "linear-gradient(180deg,#cfe1ef 0 50%,#3d5a80 50%)", "Lens at the subject's eye height.", "Direct, honest and relatable.", "a direct eye-level view"),
  c("Overhead", "radial-gradient(circle,#e8c9a0 0 25%,#f4efe6 26%)", "Straight down — flat lay.", "Graphic, organized and pattern-like.", "an overhead flat-lay view"),
  c("Three-quarter view", "linear-gradient(120deg,#ddd 0 40%,#888 40% 60%,#ddd 60%)", "Subject turned about 45°.", "Shows both face and depth — the classic product angle.", "a three-quarter view"),
  c("Close-up", "radial-gradient(circle,#c99a7a 0 55%,#3b2a22 56%)", "Tightly cropped on the subject.", "Intimate, emotional and detailed.", "an intimate close-up"),
  c("Macro", "radial-gradient(circle,#6b4a2f 0 20%,#a7744a 21% 40%,#3a2516 41%)", "Extreme detail at tiny scale.", "Reveals texture and craft invisible to the eye.", "an extreme macro detail"),
  c("Wide shot", "linear-gradient(180deg,#cfe1ef 0 60%,#7d8a5a 60%)", "Subject small within a large scene.", "Context, scale and sense of place.", "a wide establishing shot"),
];

export const COMPOSITION: ChipTerm[] = [
  c("Centered", "radial-gradient(circle,#614a8a 0 22%,#f3eefa 23%)", "Subject dead center.", "Iconic, calm and confrontational.", "a centered composition"),
  c("Asymmetrical", "radial-gradient(circle at 72% 40%,#614a8a 0 20%,#f3eefa 21%)", "Weight placed off-center.", "Tension, movement and editorial energy.", "an asymmetrical, off-center composition"),
  c("Negative space", "radial-gradient(circle at 85% 80%,#614a8a 0 8%,#f3eefa 9%)", "Lots of empty room around the subject.", "Premium calm — and space for copy.", "generous negative space"),
  c("Dynamic perspective", "conic-gradient(from 200deg at 10% 90%,#614a8a 0 20deg,#f3eefa 20deg 40deg,#614a8a 40deg 60deg,#f3eefa 60deg)", "Strong diagonals and depth.", "Kinetic, immersive energy.", "a dynamic, diagonal perspective"),
  c("Symmetrical", "linear-gradient(90deg,#614a8a 0 20%,#f3eefa 20% 80%,#614a8a 80%)", "Mirrored balance.", "Order, ritual and architectural poise.", "a perfectly symmetrical composition"),
  c("Editorial", "repeating-linear-gradient(180deg,#f4efe6 0 6px,#d8d1c4 6px 7px)", "Magazine-style framing with room for type.", "Considered crops that anticipate headlines.", "an editorial layout-ready composition"),
];

export const ATMOSPHERE: ChipTerm[] = [
  c("Airy", "linear-gradient(180deg,#ffffff,#e7eef2)", "Light, open and breathable.", "High-key tones and lightness.", "airy"),
  c("Dramatic", "linear-gradient(135deg,#111,#5a1e2c)", "Bold contrast and tension.", "Deep shadows and a theatrical feel.", "dramatic"),
  c("Intimate", "radial-gradient(circle,#e8b48a 0 30%,#3b2a22 70%)", "Close, warm and personal.", "Shallow depth and warm, low light.", "intimate"),
  c("Energetic", "conic-gradient(#ff3d6e,#ffcc00,#00d1ff,#ff3d6e)", "Fast and full of motion.", "Movement, saturation and blur.", "energetic"),
  c("Dreamy", "linear-gradient(180deg,#f7d6e6,#cbbcf6)", "Hazy, soft and drifting.", "Bloom, haze and pastel softness.", "dreamy"),
  c("Luxurious", "linear-gradient(135deg,#1b1b1b 0 60%,#c9a24a 60%)", "Rich and indulgent.", "Rich materials and slow, considered styling.", "luxurious"),
  c("Playful", "radial-gradient(circle at 30% 30%,#ffd84d 0 22%,transparent 23%),#7ee0d4", "Fun and spontaneous.", "Bright props, color and humor.", "playful"),
];

export const RATIOS: { id: Ratio; label: string; w: number; h: number }[] = [
  { id: "1:1", label: "1:1 square", w: 1, h: 1 },
  { id: "4:5", label: "4:5 portrait", w: 4, h: 5 },
  { id: "3:4", label: "3:4 portrait", w: 3, h: 4 },
  { id: "9:16", label: "9:16 vertical", w: 9, h: 16 },
  { id: "16:9", label: "16:9 landscape", w: 16, h: 9 },
  { id: "3:2", label: "3:2 landscape", w: 3, h: 2 },
];

// ——— Creative briefs ———
export type DeliverableKind = "board" | "logo" | "photo" | "portrait" | "layout" | "packaging" | "campaign" | "storyboard" | "custom";

export const DELIVERABLES: { id: string; label: string; kind: DeliverableKind; request: string }[] = [
  { id: "exploration-board", label: "Full brand exploration board", kind: "board", request: "a full brand exploration board" },
  { id: "finished-board", label: "Finished brand board", kind: "board", request: "a finished, presentation-ready brand board" },
  { id: "logo", label: "Logo concepts", kind: "logo", request: "a set of logo concepts" },
  { id: "product", label: "Product photography", kind: "photo", request: "product photography" },
  { id: "portraits", label: "Portraits", kind: "portrait", request: "brand portrait photography" },
  { id: "social", label: "Social media advertisement", kind: "layout", request: "a social media advertisement" },
  { id: "poster", label: "Poster", kind: "layout", request: "a poster" },
  { id: "packaging", label: "Packaging", kind: "packaging", request: "packaging design" },
  { id: "campaign", label: "Marketing campaign", kind: "campaign", request: "a multi-asset marketing campaign" },
  { id: "storyboard", label: "Video storyboard", kind: "storyboard", request: "a video storyboard for a short brand film" },
  { id: "website", label: "Website", kind: "layout", request: "a website design — home page and one inner page" },
  { id: "custom", label: "Custom", kind: "custom", request: "" },
];

export const STAGES = [
  { id: "explore" as const, label: "Explore", blurb: "Directions, samples and possibilities for evaluation — not finalized artwork." },
  { id: "develop" as const, label: "Develop", blurb: "Refine an approved direction into cohesive designs." },
  { id: "produce" as const, label: "Produce", blurb: "Polished assets consistent with the established identity." },
];
