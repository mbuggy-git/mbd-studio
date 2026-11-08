export type Tone = "calm" | "bold"
export type RemixTerm = { name: string; note: string; tone: Tone }
export type IngredientKey = "style" | "influence" | "treatment"
export type Combo = Record<IngredientKey, string>

const t = (name: string, note: string, tone: Tone): RemixTerm => ({ name, note, tone })

export const REMIX_VOCAB: Record<IngredientKey, RemixTerm[]> = {
  style: [
    t("Bauhaus", "primary shapes, strict grids, function as ornament", "bold"),
    t("Art Nouveau", "whiplash curves and botanical ornament", "calm"),
    t("Swiss International", "ruthless grids and objective sans-serif type", "calm"),
    t("Ukiyo-e", "flat woodblock planes and floating-world line", "calm"),
    t("Memphis Group", "squiggles, terrazzo and clashing primaries", "bold"),
    t("Constructivism", "diagonal propaganda energy in red and black", "bold"),
    t("Wabi-sabi", "imperfect, weathered, quietly incomplete", "calm"),
    t("Vaporwave", "pastel digital nostalgia and marble busts", "bold"),
    t("Cyberpunk", "rain-slick neon megacities and chrome", "bold"),
    t("Solarpunk", "lush optimistic eco-futures", "calm"),
    t("Pre-Raphaelite", "jewel-toned romantic realism", "calm"),
    t("Pop Art", "Ben-Day dots, bold outlines, mass culture", "bold"),
    t("Dutch Golden Age", "candlelit still life and deep varnish", "calm"),
    t("Brutalism", "raw concrete mass and blunt geometry", "bold"),
    t("Mid-century Modern", "atomic optimism and walnut-toned simplicity", "calm"),
    t("Y2K Aesthetic", "chrome bubbles and translucent plastic", "bold"),
    t("Bioluminescent Sci-fi", "glowing organic machines", "bold"),
    t("Scandinavian Minimal", "pale timber, soft daylight, restraint", "calm"),
    t("Gothic Revival", "pointed arches, tracery and gloom", "bold"),
    t("Claymation", "thumbprinted, handmade stop-motion forms", "calm"),
    t("Low-poly 3D", "faceted geometry and flat shading", "bold"),
    t("Botanical Illustration", "precise scientific plates with fine linework", "calm"),
    t("Zine Collage", "photocopied cut-and-paste rebellion", "bold"),
    t("De Stijl", "Mondrian blocks of red, yellow, blue", "bold"),
    t("Rococo", "frothy pastel ornament and gilded excess", "calm"),
    t("Afrofuturism", "ancestral pattern fused with cosmic tech", "bold"),
    t("Persian Miniature", "jewel-like detail and flattened perspective", "calm"),
    t("Glitch Art", "corrupted pixels and datamosh tears", "bold"),
    t("Cottagecore", "pastoral linen, wildflowers, slow living", "calm"),
    t("Streamline Moderne", "speed lines and polished aerodynamic curves", "calm"),
    t("Op Art", "vibrating optical patterns", "bold"),
    t("Chinese Ink Wash", "flowing sumi brushwork and mist", "calm"),
  ],
  influence: [
    t("Deep-sea Creatures", "translucent bodies and alien anatomy", "bold"),
    t("1970s NASA Manuals", "technical diagrams and earnest futurism", "calm"),
    t("Medieval Tapestry", "woven narrative bands and millefleur", "calm"),
    t("Tokyo Vending Machines", "glowing grids of colorful product", "bold"),
    t("Victorian Botany", "pressed specimens and glass terrariums", "calm"),
    t("Brutalist Parking Garages", "spiralling concrete and sodium light", "bold"),
    t("Mushroom Foraging", "mycelium, damp moss and spores", "calm"),
    t("Formula 1 Livery", "sponsor stripes and carbon fiber speed", "bold"),
    t("Ancient Egyptian Tombs", "hieroglyphic friezes and lapis gold", "bold"),
    t("Laundromats at 3am", "fluorescent hum and spinning drums", "calm"),
    t("Coral Reefs", "riotous organic color and texture", "bold"),
    t("Soviet Space Posters", "heroic cosmonauts and red stars", "bold"),
    t("Grandmother's Kitchen", "floral oilcloth and worn enamel", "calm"),
    t("Arcade Cabinets", "CRT glow and pixel sprites", "bold"),
    t("Silent Film Era", "intertitles, iris shots, silver grain", "calm"),
    t("Topographic Maps", "contour lines and elevation bands", "calm"),
    t("Haute Couture Runways", "sculptural silhouettes and spotlights", "bold"),
    t("Greenhouse Interiors", "fogged glass and tropical leaves", "calm"),
    t("Tarot Cards", "symbolic figures and ornate borders", "bold"),
    t("Skate Culture", "griptape, DIY graphics, concrete bowls", "bold"),
    t("Lunar Surface", "regolith dust and harsh shadow", "calm"),
    t("Venetian Carnival", "masks, brocade and candlelit canals", "bold"),
    t("Bonsai Gardens", "patient miniature landscapes", "calm"),
    t("Thunderstorms", "electric skies and rain sheets", "bold"),
    t("Ballet Rehearsals", "tulle, rosin and mirrored studios", "calm"),
    t("Circuit Boards", "copper traces and tiny components", "bold"),
    t("Desert Motels", "faded signage and turquoise pools", "calm"),
    t("Origami", "crisp folds and paper geometry", "calm"),
    t("Jellyfish Blooms", "drifting pulsing translucence", "calm"),
    t("Rave Flyers", "acid smileys and chrome type", "bold"),
    t("Cathedral Stained Glass", "lead lines and saturated light", "bold"),
    t("Polar Expeditions", "ice fields and frostbitten canvas", "calm"),
    t("Street Food Markets", "steam, lanterns and handwritten signs", "bold"),
    t("Antique Clockwork", "brass gears and escapements", "calm"),
  ],
  treatment: [
    t("Golden-hour Haze", "warm low sun with soft bloom", "calm"),
    t("Neon Noir", "magenta and cyan cutting through shadow", "bold"),
    t("Overcast Pastel", "flat even light and powdery tones", "calm"),
    t("High-contrast Chiaroscuro", "deep blacks against sculpted light", "bold"),
    t("Risograph Grain", "misregistered inks and speckled texture", "calm"),
    t("Iridescent Chrome", "oil-slick reflections and liquid metal", "bold"),
    t("Foggy Blue Hour", "cool twilight dissolving into mist", "calm"),
    t("Acid Brights", "electric lime, hot pink, ultraviolet", "bold"),
    t("Faded Polaroid", "washed warmth and light leaks", "calm"),
    t("Candlelit Amber", "flickering warm pools of light", "calm"),
    t("Infrared Dream", "pink foliage and surreal false color", "bold"),
    t("Monochrome Ink", "single-hue tonal restraint", "calm"),
    t("Holographic Foil", "rainbow shifts across glossy surfaces", "bold"),
    t("Sun-bleached Matte", "chalky dried-out color, no gloss", "calm"),
    t("Volumetric God Rays", "light shafts through dust or smoke", "bold"),
    t("Duotone Pop", "two punchy inks, nothing else", "bold"),
    t("Velvet Shadows", "soft, plush, low-key darkness", "calm"),
    t("Underwater Caustics", "rippling light patterns on surfaces", "calm"),
    t("Thermal Vision", "heat-map gradients from blue to white", "bold"),
    t("Frosted Glass Diffusion", "milky blur and soft edges", "calm"),
    t("Halftone Print", "visible dot screens and newsprint", "bold"),
    t("Moonlit Silver", "cool silver highlights and ink-blue night", "calm"),
    t("Gritty 35mm Film", "heavy grain and crushed blacks", "bold"),
    t("Bioluminescent Glow", "self-lit teal and violet points", "bold"),
    t("Earthy Terracotta", "baked clay, ochre and sienna", "calm"),
    t("Stormy Desaturation", "slate tones and heavy atmosphere", "bold"),
    t("Glazed Ceramic Sheen", "wet glossy highlights on soft color", "calm"),
    t("Strobe Flash", "harsh direct flash and hard shadows", "bold"),
  ],
}

export const INGREDIENTS: { key: IngredientKey; label: string; hint: string }[] = [
  { key: "style", label: "Style", hint: "Movement · aesthetic · technique" },
  { key: "influence", label: "Influence", hint: "Subject · era · unexpected concept" },
  { key: "treatment", label: "Mood & Treatment", hint: "Light · color · texture · atmosphere" },
]

export const findTerm = (key: IngredientKey, name: string) =>
  REMIX_VOCAB[key].find((term) => term.name === name) ?? REMIX_VOCAB[key][0]

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

export function randomTerm(key: IngredientKey, exclude?: string, tone?: Tone): string {
  let pool = REMIX_VOCAB[key].filter((term) => term.name !== exclude)
  if (tone) {
    const toned = pool.filter((term) => term.tone === tone)
    if (toned.length) pool = toned
  }
  return pick(pool).name
}

/**
 * Remix unlocked ingredients. Mostly complementary (shared tone), but ~30% of the
 * time — or always when `wild` — the treatment deliberately contrasts the style.
 */
export function remix(current: Combo, locked: Record<IngredientKey, boolean>, wild = false): Combo {
  const next = { ...current }
  const contrast = wild || Math.random() < 0.3
  if (!locked.style) next.style = randomTerm("style", current.style)
  const styleTone = findTerm("style", next.style).tone
  const flip: Tone = styleTone === "calm" ? "bold" : "calm"
  if (!locked.influence) {
    next.influence = randomTerm("influence", current.influence, wild ? flip : undefined)
  }
  if (!locked.treatment) {
    next.treatment = randomTerm("treatment", current.treatment, contrast ? flip : styleTone)
  }
  return next
}

export const isContrasting = (combo: Combo) =>
  findTerm("style", combo.style).tone !== findTerm("treatment", combo.treatment).tone

const lower = (s: string) => s.toLowerCase()

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function buildConcept(combo: Combo, subject: string): string {
  const s = findTerm("style", combo.style)
  const i = findTerm("influence", combo.influence)
  const m = findTerm("treatment", combo.treatment)
  const what = subject.trim() || "a visual"
  const clash = isContrasting(combo)
  const templates = [
    `Imagine ${what} where ${s.name} meets ${lower(i.name)} — ${s.note}, reimagined through ${i.note}, bathed in ${lower(m.name)}.`,
    `${what.charAt(0).toUpperCase() + what.slice(1)} as if ${lower(i.name)} were redesigned by a ${s.name} studio, finished with ${m.note}.`,
    `A ${s.name} take on ${lower(i.name)}: ${i.note}, rendered with ${s.note} and soaked in ${lower(m.name)}.`,
  ]
  const base = templates[hash(combo.style + combo.influence + combo.treatment) % templates.length]
  return clash ? `${base} The tension between the two moods is the point.` : base
}

export function buildRemixPrompt(combo: Combo, subject: string, seed: number): string {
  const s = findTerm("style", combo.style)
  const i = findTerm("influence", combo.influence)
  const m = findTerm("treatment", combo.treatment)
  const what = subject.trim() || "an editorial key visual"
  const openers = [
    `Create ${what} in the ${s.name} style, drawing unexpected inspiration from ${lower(i.name)}.`,
    `A striking ${what} that fuses ${s.name} design language with the world of ${lower(i.name)}.`,
    `${what.charAt(0).toUpperCase() + what.slice(1)}, art-directed as a collision of ${s.name} and ${lower(i.name)}.`,
  ]
  const compositions = [
    "Bold asymmetrical composition with generous negative space and a clear focal hierarchy.",
    "Centered, iconic composition with layered depth from foreground to background.",
    "Dynamic low-angle perspective with strong leading lines pulling the eye inward.",
    "Close, intimate framing with crisp detail on the hero element and soft falloff behind.",
  ]
  const finishes = [
    "Highly detailed, intentional, gallery-quality finish.",
    "Polished, award-winning art direction, sharp focus, rich material detail.",
    "Cohesive visual storytelling, professional finish, 4k detail.",
  ]
  const clash = isContrasting(combo)
    ? ` Lean into the contrast between the ${s.tone === "calm" ? "restrained" : "loud"} style and the ${m.tone === "calm" ? "soft" : "intense"} treatment.`
    : ""
  const h = hash(combo.style + combo.influence + combo.treatment) + seed
  return [
    openers[h % openers.length],
    `Style cues: ${s.note}. Motifs and textures borrowed from ${lower(i.name)} — ${i.note}.`,
    `Lighting and color: ${lower(m.name)}, ${m.note}.${clash}`,
    compositions[(h + 1) % compositions.length],
    finishes[(h + 2) % finishes.length],
  ].join(" ")
}
