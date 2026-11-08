/**
 * Brand vocabulary — personality, aesthetics and characteristics.
 * Each term carries hints that other systems read: color direction, font tags, voice words and name flavour.
 */
export type BrandTerm = {
  name: string;
  swatch: string;
  meaning: string;
  influence: string;
  phrase: string;
  color: string;
  fonts: string[];
  voice: string[];
  flavor: NameFlavor;
};

export type NameFlavor = "nature" | "luxe" | "playful" | "bold" | "calm" | "mystic" | "retro" | "modern" | "craft";

export type TermGroup = { id: string; label: string; blurb: string; terms: BrandTerm[] };

const t = (
  name: string,
  swatch: string,
  meaning: string,
  influence: string,
  phrase: string,
  color: string,
  fonts: string[],
  voice: string[],
  flavor: NameFlavor
): BrandTerm => ({ name, swatch, meaning, influence, phrase, color, fonts, voice, flavor });

export const PERSONALITY: TermGroup = {
  id: "personality",
  label: "Personality",
  blurb: "How the brand behaves in a room — the character people remember.",
  terms: [
    t("Playful", "radial-gradient(circle at 30% 30%, #ffd84d 0 22%, transparent 23%), radial-gradient(circle at 70% 65%, #ff6fa8 0 26%, transparent 27%), #7ee0d4", "Light-hearted, curious and quick to smile.", "Rounded letterforms, bouncy shapes and saturated pops of color; copy that winks.", "playful, buoyant", "vibrant", ["rounded", "friendly", "whimsical"], ["cheeky", "bright", "warm"], "playful"),
    t("Confident", "linear-gradient(135deg, #111 0 50%, #e8432e 50%)", "Self-assured and decisive without needing to shout.", "Strong type weights, clear hierarchy and a restrained palette with one decisive accent.", "confident, assured", "complementary", ["bold", "geometric"], ["direct", "assured", "clear"], "bold"),
    t("Sophisticated", "linear-gradient(160deg, #2b2730, #6d5f71 60%, #c9b9a6)", "Cultured, considered and quietly expensive.", "High-contrast serifs, generous margins and muted, refined color.", "sophisticated, refined", "muted", ["elegant", "high contrast", "sophisticated"], ["refined", "measured", "discerning"], "luxe"),
    t("Rebellious", "repeating-linear-gradient(45deg, #111 0 8px, #d7ff3a 8px 16px)", "Rule-breaking and defiant — happy to provoke.", "Distorted or condensed type, clashing color, raw textures and off-grid layouts.", "rebellious, defiant", "vibrant", ["condensed", "experimental", "heavy"], ["defiant", "raw", "unfiltered"], "bold"),
    t("Approachable", "radial-gradient(circle at 50% 60%, #ffb37a 0 35%, transparent 36%), #fff1dc", "Warm, open and easy to talk to.", "Friendly sans serifs, soft corners, warm color and plain-spoken copy.", "approachable, welcoming", "warm", ["friendly", "rounded"], ["friendly", "honest", "helpful"], "calm"),
    t("Optimistic", "linear-gradient(180deg, #ffe066, #ff9a3c)", "Forward-looking and sunny.", "Upward motion, bright warm hues and open, airy compositions.", "optimistic, sunlit", "warm", ["friendly", "geometric"], ["hopeful", "bright", "uplifting"], "playful"),
    t("Mysterious", "radial-gradient(circle at 70% 30%, #6c4ab6 0 10%, transparent 40%), #120d1c", "Withholds a little — invites you to lean in.", "Dark grounds, partial reveals, fine type and cryptic symbols.", "mysterious, enigmatic", "jewel", ["elegant", "light", "high contrast"], ["enigmatic", "hushed", "intriguing"], "mystic"),
    t("Energetic", "conic-gradient(from 0deg, #ff3d6e, #ffcc00, #00d1ff, #ff3d6e)", "Fast, loud and full of momentum.", "Diagonals, heavy italics, high saturation and kinetic layouts.", "energetic, kinetic", "vibrant", ["heavy", "bold", "expressive"], ["punchy", "fast", "electric"], "bold"),
    t("Serene", "linear-gradient(180deg, #dfe9e6, #9fb7b2)", "Calm, unhurried and restorative.", "Light weights, soft cool tones, lots of negative space and slow rhythm.", "serene, tranquil", "cool", ["light", "elegant", "sophisticated"], ["calm", "gentle", "grounded"], "calm"),
    t("Whimsical", "radial-gradient(circle at 25% 70%, #ffc6e0 0 18%, transparent 19%), radial-gradient(circle at 70% 35%, #b5a8ff 0 20%, transparent 21%), #fff6d6", "Storybook charm and a gentle sense of wonder.", "Hand-drawn marks, quirky display type and pastel color with surprise details.", "whimsical, storybook", "pastel", ["whimsical", "script", "rounded"], ["curious", "charming", "dreamy"], "playful"),
    t("Adventurous", "linear-gradient(180deg, #f2a65a 0 40%, #3f6e5a 40% 70%, #24384a 70%)", "Outdoorsy, bold and up for the unknown.", "Rugged slabs, earthy palettes, badges and expansive landscape imagery.", "adventurous, intrepid", "earthy", ["slab serif", "bold", "retro"], ["intrepid", "rugged", "spirited"], "nature"),
    t("Luxurious", "linear-gradient(135deg, #1b1b1b 0 55%, #c9a24a 55% 60%, #1b1b1b 60%)", "Indulgent, rare and crafted for pleasure.", "Thin high-contrast type, deep jewel or black grounds, metallic accents and slow pacing.", "luxurious, opulent", "jewel", ["high contrast", "elegant", "light"], ["indulgent", "rare", "exquisite"], "luxe"),
    t("Unconventional", "linear-gradient(90deg, #f45d48 0 33%, #1f1f1f 33% 66%, #9bd3ff 66%)", "Takes the unexpected route on purpose.", "Unusual type pairings, odd crops and color combinations that shouldn't work — but do.", "unconventional, offbeat", "complementary", ["experimental", "display", "extended"], ["offbeat", "curious", "surprising"], "modern"),
  ],
};

export const AESTHETICS: TermGroup = {
  id: "aesthetics",
  label: "Aesthetics",
  blurb: "The visual world the brand lives in — movements, eras and design languages.",
  terms: [
    t("Editorial", "linear-gradient(90deg, #111 0 2px, transparent 2px) 8px 0/100% 100% no-repeat, repeating-linear-gradient(180deg, #f4efe6 0 6px, #d8d1c4 6px 7px)", "Magazine-grade: confident crops, typographic hierarchy and a point of view.", "Serif headlines, strict grids, pull-quotes and photography given room to breathe.", "editorial, magazine-grade", "muted", ["editorial", "serif", "high contrast"], ["articulate", "curated", "assured"], "modern"),
    t("Minimalist", "radial-gradient(circle at 50% 50%, #1a1a1a 0 8%, transparent 9%), #f2f0ec", "Reduced to the essential.", "Few elements, precise spacing, neutral palette and a single typeface family.", "minimalist, pared-back", "monochromatic", ["geometric", "light", "sans serif"], ["clear", "precise", "quiet"], "modern"),
    t("Maximalist", "conic-gradient(from 45deg, #e94f37, #f6c90e, #3a86ff, #8338ec, #2ec4b6, #e94f37)", "More is more — layered, abundant and joyful.", "Pattern on pattern, many colors, mixed type styles and dense, decorated layouts.", "maximalist, abundant", "vibrant", ["display", "expressive", "heavy"], ["exuberant", "lavish", "bold"], "playful"),
    t("Retro-futurist", "linear-gradient(180deg, #ff6b9a 0 35%, #ffb35c 35% 50%, #2b1055 50%)", "The future as imagined in the past.", "Chrome, sunset gradients, extended sans serifs and space-age optimism.", "retro-futurist, space-age", "vibrant", ["extended", "geometric", "retro"], ["visionary", "bold", "optimistic"], "retro"),
    t("Botanical", "radial-gradient(ellipse at 30% 70%, #4e7d4f 0 25%, transparent 26%), radial-gradient(ellipse at 70% 30%, #8fb27c 0 22%, transparent 23%), #f1ede1", "Plant life as design language.", "Leaf forms, green and earth palettes, delicate illustration and natural textures.", "botanical, verdant", "earthy", ["elegant", "serif", "organic"], ["natural", "fresh", "nurturing"], "nature"),
    t("Brutalist", "linear-gradient(90deg, #8a8a8a 0 40%, #cfcfcf 40% 42%, #5c5c5c 42%)", "Raw, blunt and structural.", "Heavy grotesques, exposed grids, system defaults and no decoration for its own sake.", "brutalist, raw", "monochromatic", ["heavy", "monospace", "condensed"], ["blunt", "raw", "honest"], "bold"),
    t("Art Deco", "repeating-conic-gradient(from 0deg at 50% 100%, #c9a24a 0 10deg, #14213d 10deg 20deg)", "1920s glamour and geometric symmetry.", "Sunbursts, stepped forms, gold linework and tall, elegant display type.", "Art Deco, geometric glamour", "jewel", ["display", "geometric", "high contrast"], ["glamorous", "poised", "elegant"], "luxe"),
    t("Psychedelic", "radial-gradient(circle, #ff4ecd 0 15%, #ffd23f 15% 30%, #3bceac 30% 45%, #6a4c93 45% 60%, #ff4ecd 60%)", "Swirling, saturated and mind-expanding.", "Melting lettering, vibrating complementary color and fluid, organic forms.", "psychedelic, kaleidoscopic", "complementary", ["display", "expressive", "experimental"], ["trippy", "vivid", "free"], "mystic"),
    t("Nostalgic", "linear-gradient(180deg, #f3d9a4, #d89b6a 60%, #8c5a3c)", "A warm, slightly faded past.", "Vintage type, sun-bleached color, grain and familiar, comforting motifs.", "nostalgic, sun-faded", "warm", ["retro", "serif", "script"], ["warm", "familiar", "sincere"], "retro"),
    t("Organic Modern", "radial-gradient(ellipse at 40% 60%, #c8a98a 0 30%, transparent 31%), linear-gradient(#ece6dc, #ece6dc)", "Natural materials meet clean modern lines.", "Soft blob shapes, sand and clay tones, clean sans serifs and tactile surfaces.", "organic modern, tactile", "earthy", ["geometric", "light", "friendly"], ["grounded", "honest", "calm"], "craft"),
    t("Avant-garde", "linear-gradient(120deg, #f2f2f2 0 45%, #111 45% 55%, #ff2e2e 55%)", "Experimental and ahead of its time.", "Unexpected layouts, art-school type, stark contrast and conceptual imagery.", "avant-garde, experimental", "monochromatic", ["experimental", "display", "extended"], ["provocative", "daring", "conceptual"], "modern"),
    t("Contemporary", "linear-gradient(135deg, #e9e6f2 0 50%, #7a6bd1 50%)", "Current, clean and culturally fluent.", "Modern grotesques, flexible systems and a fresh, balanced palette.", "contemporary, current", "analogous", ["sans serif", "geometric", "regular"], ["fresh", "clear", "fluent"], "modern"),
  ],
};

export const CHARACTERISTICS: TermGroup = {
  id: "characteristics",
  label: "Brand characteristics",
  blurb: "What the brand stands for — values that show up in every material choice.",
  terms: [
    t("Handcrafted", "repeating-linear-gradient(100deg, #d8c3a5 0 3px, #c4ab88 3px 5px)", "Made by hand, with visible care.", "Hand-lettering, stamps, uncoated papers, imperfect edges and craft textures.", "handcrafted, small-batch", "earthy", ["script", "slab serif", "retro"], ["crafted", "honest", "personal"], "craft"),
    t("Innovative", "linear-gradient(135deg, #00e5ff, #6a5cff 60%, #1a1446)", "Inventive and pushing forward.", "Precise geometric type, digital gradients and modular, systematic graphics.", "innovative, forward-thinking", "cool", ["geometric", "extended", "monospace"], ["inventive", "sharp", "forward"], "modern"),
    t("Sustainable", "linear-gradient(180deg, #a9c79a, #5f8a5a)", "Kind to people and planet.", "Earth tones, recycled textures, honest materials and calm, humane type.", "sustainable, earth-conscious", "earthy", ["friendly", "organic", "rounded"], ["responsible", "honest", "caring"], "nature"),
    t("Premium", "linear-gradient(135deg, #0f0f12 0 70%, #b8a07a 70%)", "High quality and worth the price.", "Restraint, rich dark tones, fine detailing and impeccable spacing.", "premium, high-end", "jewel", ["elegant", "high contrast", "sophisticated"], ["assured", "exacting", "refined"], "luxe"),
    t("Accessible", "radial-gradient(circle at 50% 50%, #ffcf56 0 30%, #4f9dff 30%)", "For everyone — clear and inclusive.", "Highly legible type, strong contrast, simple language and welcoming color.", "accessible, inclusive", "vibrant", ["friendly", "sans serif", "regular"], ["clear", "inclusive", "warm"], "calm"),
    t("Experimental", "repeating-radial-gradient(circle at 30% 40%, #111 0 3px, #f0f 3px 6px, #0ff 6px 9px)", "Treats every launch as a test.", "Variable type, generative graphics, unusual materials and evolving systems.", "experimental, exploratory", "complementary", ["experimental", "monospace", "display"], ["curious", "bold", "exploratory"], "modern"),
    t("Timeless", "linear-gradient(180deg, #f3eee4, #cbbfa9)", "Built to look right for decades.", "Classic serifs, balanced proportions and a restrained, durable palette.", "timeless, enduring", "muted", ["serif", "elegant", "regular"], ["enduring", "steady", "classic"], "luxe"),
    t("Expressive", "linear-gradient(110deg, #ff5f6d, #ffc371 50%, #845ec2)", "Emotional and full of personality.", "Gestural marks, dramatic type scale, bold color and visible energy.", "expressive, emotive", "vibrant", ["expressive", "display", "script"], ["vivid", "emotive", "spirited"], "playful"),
  ],
};

export const BRAND_GROUPS: TermGroup[] = [PERSONALITY, AESTHETICS, CHARACTERISTICS];

export const ALL_TERMS: BrandTerm[] = BRAND_GROUPS.flatMap((g) => g.terms);

export const findTerm = (name: string) => ALL_TERMS.find((x) => x.name === name);

export const groupOf = (name: string) => BRAND_GROUPS.find((g) => g.terms.some((x) => x.name === name));

/** Coherent starting sets that the surprise engine can lean on. */
export const TRAIT_PRESETS: string[][] = [
  ["Sophisticated", "Serene", "Botanical", "Timeless", "Sustainable"],
  ["Rebellious", "Energetic", "Brutalist", "Experimental"],
  ["Whimsical", "Optimistic", "Nostalgic", "Handcrafted"],
  ["Mysterious", "Luxurious", "Art Deco", "Premium"],
  ["Adventurous", "Confident", "Retro-futurist", "Innovative"],
  ["Approachable", "Playful", "Contemporary", "Accessible"],
  ["Unconventional", "Psychedelic", "Expressive", "Experimental"],
  ["Serene", "Organic Modern", "Minimalist", "Handcrafted"],
];
