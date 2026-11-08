import type { BrandState, ImageConcept, LogoConcept } from "./types";
import { colorName, PALETTE_ROLES, primaryOnDark } from "./color";
import { resolveFont } from "./fonts";
import { industryProfile, voiceWords } from "./generate";
import { article, cap, listJoin, pickR, rng } from "./random";
import { ATMOSPHERE, CAMERA, COMPOSITION, DELIVERABLES, LIGHTING, STAGES, type DeliverableKind } from "./artVocab";

/** Only what the user typed. Empty means the prompt names no subject and the image model decides. */
const subjectOf = (c: { subjectOverride?: string }) => (c.subjectOverride ?? "").trim().replace(/\.$/, "");
import { AESTHETICS, CHARACTERISTICS, PERSONALITY } from "./vocab";

const inGroup = (names: string[], group: { terms: { name: string }[] }) => names.filter((n) => group.terms.some((t) => t.name === n));
const lower = (xs: string[]) => xs.map((x) => x.toLowerCase());
const phraseOf = (list: { name: string; phrase?: string }[], name: string) => list.find((x) => x.name === name)?.phrase ?? name.toLowerCase();

export function brandFacts(s: BrandState) {
  const display = resolveFont(s.display, s.traits, "display");
  const body = resolveFont(s.body, s.traits, "body");
  const personality = lower(inGroup(s.traits, PERSONALITY));
  const aesthetics = lower(inGroup(s.traits, AESTHETICS));
  const values = lower(inGroup(s.traits, CHARACTERISTICS));
  const colors = s.palette.map((sw, i) => ({ hex: sw.hex.toUpperCase(), name: colorName(sw.hex), role: PALETTE_ROLES[i] }));
  const logo = s.selectedLogo >= 0 ? s.logoConcepts[s.selectedLogo] : undefined;
  const tagline = s.taglines[s.selectedTagline]?.text ?? s.taglines[0]?.text ?? "";
  const name = s.name.trim() || "Untitled brand";
  const industry = s.industry.trim() || "brand";
  return { display, body, personality, aesthetics, values, colors, logo, tagline, name, industry, profile: industryProfile(s.industry), voice: s.voice.map((v) => v.text.toLowerCase()) };
}

const slotWords = (slot: BrandState["display"]) => lower([...slot.personality, ...slot.shape]);

// ——— Brand DNA ———
export function composeDNA(s: BrandState, seed: number): string {
  const f = brandFacts(s);
  const r = rng(seed + 5);
  const pers = f.personality.length ? listJoin(f.personality.slice(0, 3)) : "considered";
  const aes = f.aesthetics.length ? `${listJoin(f.aesthetics.slice(0, 2))}` : "contemporary";
  const [c0, c1, c2, c3, c4] = f.colors;
  const dWords = slotWords(s.display);
  const opening = pickR(r, [
    `${f.name} is ${article(pers)} ${pers} ${f.industry} with ${article(aes)} ${aes} sensibility${f.values.length ? ` and a commitment to being ${listJoin(f.values.slice(0, 2))}` : ""}.`,
    `Imagine ${f.industry === "brand" ? "a brand" : `${article(f.industry)} ${f.industry}`} that feels ${pers} — that's ${f.name}, shaped by ${article(aes)} ${aes} eye${f.values.length ? ` and ${listJoin(f.values.slice(0, 2))} values` : ""}.`,
  ]);
  const color = pickR(r, [
    `Its palette leads with ${c0.name} (${c0.hex}) and ${c1.name} (${c1.hex}), sparked by ${c2.name} (${c2.hex}) and resting on ${c3.name} (${c3.hex}) with ${c4.name} (${c4.hex}) for depth.`,
    `Color starts with ${c0.name} (${c0.hex}) against ${c3.name} (${c3.hex}), with ${c1.name} (${c1.hex}) as a supporting voice, ${c2.name} (${c2.hex}) as the accent and ${c4.name} (${c4.hex}) anchoring type and detail.`,
  ]);
  const type = `Headlines use ${f.display.name}, ${article(s.display.classification)} ${s.display.classification.toLowerCase()}${dWords.length ? ` with ${listJoin(dWords.slice(0, 3))} character` : ""}, while ${f.body.name} keeps supporting text ${slotWords(s.body).slice(0, 2).join(" and ") || "clear and readable"}.`;
  const logo = f.logo
    ? `The identity leans toward ${article(f.logo.direction)} ${f.logo.direction.toLowerCase()} expressed through ${s.graphicLanguage.length ? listJoin(lower(s.graphicLanguage)) : f.logo.graphic.toLowerCase()} graphic language.`
    : "";
  const tone = `Overall the tone is ${listJoin(f.voice.length ? f.voice : voiceWords(s.traits).slice(0, 3))} — ${pickR(r, ["never generic, always intentional", "confident without shouting", "crafted to be remembered", "warm, specific and unmistakably its own"])}.`;
  return [opening, color, type, logo, tone].filter(Boolean).join(" ");
}

// ——— Logo prompts ———
export function logoPrompt(s: BrandState, lc: LogoConcept): string {
  const f = brandFacts(s);
  const stage = s.stage === "explore" ? "Show this as an exploratory sketch direction with 2–3 variations, not a final logo." : s.stage === "develop" ? "Refine into a clean, balanced version with color and single-color variants." : "Render as a polished, final vector-style logo with precise geometry.";
  return [
    `Logo design for “${f.name}”, ${article(f.industry)} ${f.industry}.`,
    `Direction: ${lc.direction.toLowerCase()} — ${lc.description}`,
    [lc.graphic ? `Graphic language: ${lc.graphic.toLowerCase()}` : "", f.personality.length ? `personality: ${listJoin(f.personality.slice(0, 3))}` : ""].filter(Boolean).join("; ") + ".",
    `Typography reference: ${f.display.name}${[s.display.classification.toLowerCase(), ...slotWords(s.display).slice(0, 3)].filter(Boolean).length ? ` (${[s.display.classification.toLowerCase(), ...slotWords(s.display).slice(0, 3)].filter(Boolean).join(", ")})` : ""}.`,
    `Colors: ${f.colors.slice(0, 3).map((c) => `${c.name} ${c.hex}`).join(", ")} on ${f.colors[3].name} ${f.colors[3].hex}.`,
    `Flat, vector-style artwork centered on a plain background; no mockups, no extra words beyond the brand name. ${stage}`,
  ].join(" ");
}

// ——— Image prompts ———
export function imagePrompt(s: BrandState, c: ImageConcept): string {
  const f = brandFacts(s);
  const kindPhrase: Record<string, string> = { Product: "Product photograph", Portrait: "Portrait photograph", Lifestyle: "Lifestyle photograph", Illustration: "Illustration", Mixed: "Mixed-media image" };
  const mood = [...f.personality.slice(0, 2), ...f.aesthetics.slice(0, 1)];
  return [
    `${kindPhrase[c.kind] ?? "Image"} for ${f.name}, ${mood.length ? `${article(mood[0])} ${listJoin(mood)} ` : ""}${f.industry}.`,
    subjectOf(c) ? `Subject: ${subjectOf(c)}.` : "",
    `${cap(phraseOf(LIGHTING, c.lighting))}, ${phraseOf(CAMERA, c.camera)}, ${phraseOf(COMPOSITION, c.composition)}; ${phraseOf(ATMOSPHERE, c.atmosphere)} atmosphere.`,
    `Color story: ${f.colors[0].name} (${f.colors[0].hex}) and ${f.colors[1].name} (${f.colors[1].hex}) with ${f.colors[2].name} (${f.colors[2].hex}) accents on ${f.colors[3].name} (${f.colors[3].hex}).`,
    c.kind === "Illustration" ? `Style: ${s.graphicLanguage.length ? listJoin(lower(s.graphicLanguage)) : "clean, ownable"} illustration.` : `Materials and styling: ${f.profile.materials}.`,
    c.kind === "Product"
      ? `Aspect ratio ${c.ratio}. The packaging carries a plain, unprinted label or a blank panel where the logo will be placed later; no legible text or watermarks in frame.`
      : `Aspect ratio ${c.ratio}. No text, logos or watermarks in frame.`,
  ].join(" ");
}

// ——— Creative briefs ———
/** Infer what kind of asset a free-text request describes. */
export function detectKind(text: string): DeliverableKind {
  const q = text.toLowerCase();
  if (/storyboard|video|film|commercial|animatic|reel|tiktok|motion/.test(q)) return "storyboard";
  if (/logo|mark|monogram|wordmark|icon/.test(q)) return "logo";
  if (/portrait|headshot|model/.test(q)) return "portrait";
  if (/packag|label|box|bottle|can design/.test(q)) return "packaging";
  if (/campaign|series/.test(q)) return "campaign";
  if (/board/.test(q)) return "board";
  if (/poster|advert|\bad\b|banner|flyer|social|post|layout|billboard|menu/.test(q)) return "layout";
  if (/photo|shot|still life|product/.test(q)) return "photo";
  return "layout";
}

export function deliverableInfo(s: BrandState): { kind: DeliverableKind; request: string; label: string } {
  const d = DELIVERABLES.find((x) => x.id === s.deliverable) ?? DELIVERABLES[0];
  const custom = s.customRequest.trim();
  const kind = d.kind === "custom" ? detectKind(custom) : d.kind;
  return { kind, request: custom || d.request || "a brand asset", label: d.label };
}

const DELIVERABLE_TEXT: Record<DeliverableKind, string> = {
  board: "A single brand artboard showing the name, logo direction, the five-color palette with hex labels, display and body type specimens, the tagline, imagery samples and supporting graphic elements.",
  logo: "Three distinct logo concepts, each shown in full color, single color and reversed on the deep neutral.",
  photo: "A set of three to four product photographs that share lighting, styling and color so they read as one series.",
  portrait: "A set of three brand portraits with consistent lighting, wardrobe in palette colors and a shared backdrop treatment.",
  layout: "One finished layout with a clear headline, a supporting line, the logo and a call to action.",
  packaging: "Front-of-pack design plus one side panel, showing how logo, color and type work on the physical object.",
  campaign: "A hero key visual plus three adaptations: a square social post, a 9:16 story and a wide web banner.",
  storyboard: "A 6–8 frame storyboard for a 15–30 second brand film. For each frame include a sketch-style still, a shot type and camera move, approximate duration, on-screen text or voice-over, and a note on sound or music, ending on a logo and tagline end card.",
  custom: "The requested asset, fully consistent with the identity below.",
};

const LAYOUT_TEXT: Record<DeliverableKind, string> = {
  board: "Use an editorial grid with generous margins, clear section labels and balanced white space; the board should feel like a designer's artboard, not a dashboard.",
  logo: "Present each concept centered on its own panel with ample clear space and a small caption naming the direction.",
  photo: "Keep compositions clean with room for later copy; avoid busy props that compete with the product.",
  portrait: "Frame subjects consistently and leave negative space on one side for typography.",
  layout: "Build a strong typographic hierarchy: one dominant headline, one supporting line, then logo and call to action.",
  packaging: "Respect a clear front-of-pack hierarchy: brand, product name, key descriptor, then legal details.",
  campaign: "Keep one recognizable visual idea across every format and adapt the crop rather than the concept.",
  storyboard: "Lay the frames out in a numbered grid that reads left to right, with consistent frame proportions (16:9 or 9:16) and the shot notes directly beneath each frame; the sequence should build clearly from an opening hook to the final brand reveal.",
  custom: "Use a clear hierarchy and keep generous space around the brand name.",
};

const STAGE_TEXT = {
  explore: "Stage: EXPLORE. Produce several distinct directions, samples and possibilities for evaluation. This is not finalized artwork — range and variety matter more than polish.",
  develop: "Stage: DEVELOP. Refine the approved direction into cohesive, consistent designs. Fewer options, more polish and system thinking.",
  produce: "Stage: PRODUCE. Create polished, final-quality assets strictly consistent with the established identity. No new directions.",
};

/** Previous section-by-section brief format, kept for reference and reuse. */
export function composeStructuredBrief(s: BrandState, seed: number): string {
  const f = brandFacts(s);
  const d = deliverableInfo(s);
  const r = rng(seed + 71);
  const role = pickR(r, ["You are a senior brand designer and art director.", "Act as an experienced identity designer collaborating with me.", "You are the lead designer on this identity project."]);
  const lines = [
    "OBJECTIVE",
    `${role} Create ${d.request} for ${f.name}.`,
    "",
    "BRAND",
    `Name: ${f.name}`,
    `Industry: ${f.industry}`,
    f.tagline ? `Tagline: “${f.tagline}”` : "",
    "",
    "CREATIVE VISION & PERSONALITY",
    composeDNA(s, s.dna.seed),
    "",
    "COLOR PALETTE — use these exact values",
    ...f.colors.map((c) => `• ${c.role}: ${c.hex} (${c.name})`),
    "",
    "TYPOGRAPHY",
    `• Display / brand: ${f.display.name} — ${s.display.classification.toLowerCase()}${slotWords(s.display).length ? `, ${slotWords(s.display).join(", ")}` : ""}.`,
    `• Supporting / body: ${f.body.name} — ${s.body.classification.toLowerCase()}${slotWords(s.body).length ? `, ${slotWords(s.body).join(", ")}` : ""}.`,
    "",
    "LOGO & GRAPHIC LANGUAGE",
    f.logo ? `• Selected direction: ${f.logo.title} (${f.logo.direction.toLowerCase()}). ${f.logo.description}` : "",
    `• Graphic language: ${s.graphicLanguage.length ? listJoin(lower(s.graphicLanguage)) : "to be explored"}.`,
    "",
    "IMAGERY & ART DIRECTION",
    ...s.imageConcepts.map((c, i) => `• Concept ${i + 1} (${c.ratio}, ${c.kind.toLowerCase()}): ${subjectOf(c) ? `${subjectOf(c)}; ` : ""}${c.lighting.toLowerCase()}, ${c.camera.toLowerCase()}, ${c.composition.toLowerCase()} composition, ${c.atmosphere.toLowerCase()} atmosphere.`),
    "",
    "DELIVERABLES",
    DELIVERABLE_TEXT[d.kind],
    "",
    "LAYOUT & PRESENTATION",
    LAYOUT_TEXT[d.kind],
    "",
    STAGE_TEXT[s.stage],
    "",
    "EDITABILITY",
    "Where the tool supports it, keep all text as live, editable text layers and keep the logo, color swatches and graphic elements on separate layers. Do not flatten typography into images.",
  ];
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").replace(/\n{3,}/g, "\n\n");
}

/** A focused prompt that only carries brand information relevant to the requested asset. */
function composeDeliverableMini(s: BrandState, seed: number): string {
  const f = brandFacts(s);
  const d = deliverableInfo(s);
  const r = rng(seed + 97);
  const stageShort = STAGES.find((x) => x.id === s.stage)?.label ?? "Explore";
  const stageLine = s.stage === "explore" ? "Show a few varied options." : s.stage === "develop" ? "Keep it cohesive and refined." : "Final, polished quality.";
  const mood = listJoin([...f.personality.slice(0, 2), ...f.aesthetics.slice(0, 1)]);
  const palette = `${f.colors[0].name} ${f.colors[0].hex}, ${f.colors[1].name} ${f.colors[1].hex} and ${f.colors[2].name} ${f.colors[2].hex} accents on ${f.colors[3].name} ${f.colors[3].hex}`;
  const concept = s.imageConcepts.find((c) => (d.kind === "portrait" ? c.kind === "Portrait" : c.kind === "Product")) ?? s.imageConcepts[0];
  const opener = pickR(r, ["Create", "Design", "Generate"]);

  if (d.kind === "photo" || d.kind === "portrait") {
    return [
      `${opener} ${d.request} for ${f.name}, ${article(mood || "a")} ${mood || "distinctive"} ${f.industry}.`,
      concept && subjectOf(concept) ? `Subject: ${subjectOf(concept)}.` : "",
      concept ? `${cap(phraseOf(LIGHTING, concept.lighting))}, ${phraseOf(CAMERA, concept.camera)}, ${phraseOf(COMPOSITION, concept.composition)}, ${phraseOf(ATMOSPHERE, concept.atmosphere)} atmosphere.` : "",
      `Color: ${palette}.`,
      `Materials and props: ${f.profile.materials}.`,
      `${stageLine} No text or logos in frame.`,
    ].filter(Boolean).join(" ");
  }
  if (d.kind === "logo") {
    return [
      `${opener} ${d.request} for “${f.name}”, ${article(f.industry)} ${f.industry}.`,
      f.logo ? `Direction: ${f.logo.direction.toLowerCase()} — ${f.logo.description}` : "",
      s.graphicLanguage.length ? `Graphic language: ${listJoin(lower(s.graphicLanguage))}.` : "",
      `Letterform reference: ${f.display.name}.`,
      `Colors: ${palette}.`,
      `Flat vector style on a plain background. ${stageLine}`,
    ].filter(Boolean).join(" ");
  }
  return [
    `${opener} ${d.request} for ${f.name}, ${article(mood || "a")} ${mood || "distinctive"} ${f.industry}.`,
    f.tagline ? `Headline or sign-off: “${f.tagline}”.` : "",
    `Palette: ${palette}, with ${f.colors[4].name} ${f.colors[4].hex} for type. On dark surfaces, use ${primaryOnDark(s.palette).toUpperCase()} as the primary.`,
    `Typography: ${f.display.name} for headlines, ${f.body.name} for supporting text.`,
    f.logo ? `Logo: ${f.logo.direction.toLowerCase()} placed with clear space.` : "",
    concept && d.kind !== "board" ? `Imagery: ${subjectOf(concept) ? `${subjectOf(concept)}, ` : ""}${concept.lighting.toLowerCase()}, ${concept.atmosphere.toLowerCase()} mood.` : "",
    d.kind === "board" ? `Include palette swatches with hex labels, type specimens and imagery samples on one artboard.` : "",
    `${LAYOUT_TEXT[d.kind]} ${stageShort} stage: ${stageLine} Keep text editable where supported.`,
  ].filter(Boolean).join(" ");
}

// ——— Full creative brief (art-director voice) ———

const STAGE_GUIDANCE: Record<BrandState["stage"], string[]> = {
  explore: [
    "Since this is the exploration stage, show several distinct directions side by side rather than one finished design. Range and variety matter more than polish — nothing should read as final artwork.",
    "This is an early exploration, so give me a few clearly different routes I can compare. Treat everything as a sample or possibility, not finished artwork.",
  ],
  develop: [
    "We're in the development stage: refine the chosen direction into a cohesive system, with fewer options and more consistency across every element.",
    "The direction is approved, so focus on development — tighten the system, make every element feel related, and resolve the details.",
  ],
  produce: [
    "This is the production stage: create polished, final-quality assets that stay strictly consistent with the identity described here. Please don't introduce new directions.",
    "We're ready for production, so everything should be final quality and faithful to the established identity — no new directions or experiments.",
  ],
};

function visionLine(s: BrandState, r: ReturnType<typeof rng>): string {
  const f = brandFacts(s);
  const pers = f.personality.slice(0, 3);
  const aes = f.aesthetics.slice(0, 2);
  const values = f.values.slice(0, 2);
  const voice = (f.voice.length ? f.voice : voiceWords(s.traits)).slice(0, 2);
  const feel = pers.length ? listJoin(pers) : "considered and distinctive";
  const look = aes.length ? `${article(aes[0])} ${listJoin(aes)} aesthetic` : "a contemporary, ownable aesthetic";
  const colorDir = s.colorDirection ? `, ${article(s.colorDirection.toLowerCase())} ${s.colorDirection.toLowerCase()} color sensibility` : "";
  return pickR(r, [
    `a brand that feels ${feel}, expressed through ${look}${colorDir}${values.length ? ` and a genuine commitment to being ${listJoin(values)}` : ""}. The voice should come across as ${listJoin(voice.length ? voice : ["confident", "warm"])}`,
    `${look} with a ${feel} personality${colorDir}${values.length ? `, grounded in ${listJoin(values)} values` : ""}. It should feel ${listJoin(voice.length ? voice : ["intentional", "memorable"])} rather than generic`,
  ]);
}

function includesFor(s: BrandState, kind: DeliverableKind): string[] {
  const f = brandFacts(s);
  const palette = `Color palette with these exact hex values: ${f.colors.map((c) => `${c.role} ${c.hex} (${c.name})`).join(", ")}`;
  const dWords = slotWords(s.display);
  const bWords = slotWords(s.body);
  const typeLine = `Typography exploration based on ${f.display.name} for headlines (${s.display.classification.toLowerCase()}${dWords.length ? `, ${dWords.slice(0, 3).join(", ")}` : ""}) and ${f.body.name} for supporting text (${s.body.classification.toLowerCase()}${bWords.length ? `, ${bWords.slice(0, 2).join(", ")}` : ""})`;
  const graphic = s.graphicLanguage.length ? listJoin(lower(s.graphicLanguage)) : f.logo?.graphic?.toLowerCase() || "ownable";
  const logoLine = f.logo
    ? `Logo or graphic language concepts building on ${article(f.logo.direction)} ${f.logo.direction.toLowerCase()} — ${f.logo.description.replace(/\.$/, "")} — with ${graphic} graphic elements`
    : `Logo or graphic language concepts using ${graphic} graphic elements`;
  const concept = s.imageConcepts[0];
  const imageryLine = concept
    ? `Relevant imagery or illustration samples${subjectOf(concept) ? `, such as ${subjectOf(concept)},` : ""} with ${concept.lighting.toLowerCase()} and ${article(concept.atmosphere)} ${concept.atmosphere.toLowerCase()} atmosphere`
    : "Relevant imagery or illustration samples that share one lighting and color story";
  const personality = "A short description of the brand's visual personality";

  if (kind === "photo" || kind === "portrait") {
    const c = s.imageConcepts.find((x) => (kind === "portrait" ? x.kind === "Portrait" : x.kind === "Product")) ?? concept;
    return [
      `${palette}, carried through props, surfaces${kind === "portrait" ? ", wardrobe" : ""} and backdrop`,
      c ? `Lighting and camera direction: ${phraseOf(LIGHTING, c.lighting)}, ${phraseOf(CAMERA, c.camera)} and ${phraseOf(COMPOSITION, c.composition)}` : "A consistent lighting and camera direction across the set",
      `Styling and materials: ${f.profile.materials}`,
      imageryLine,
      personality,
    ];
  }
  if (kind === "logo") return [palette, logoLine, `Letterform exploration based on ${f.display.name} (${s.display.classification.toLowerCase()})`, "Each concept shown in full color, single color and reversed", personality];
  if (kind === "storyboard") {
    const c = s.imageConcepts.find((x) => x.kind === "Lifestyle") ?? concept;
    return [
      `${palette}, used to grade every scene and for on-screen text`,
      `A shot-by-shot sequence${c ? `${subjectOf(c) ? ` featuring ${subjectOf(c)},` : ""} with ${phraseOf(LIGHTING, c.lighting)} and ${phraseOf(CAMERA, c.camera)}` : ""}`,
      `On-screen typography in ${f.display.name} for titles and ${f.body.name} for captions${f.tagline ? `, closing on the tagline “${f.tagline}”` : ""}`,
      f.logo ? `A logo end card using the ${f.logo.direction.toLowerCase()} direction, plus any animated graphic elements in a ${graphic} style` : `A logo end card and ${graphic} animated graphic elements`,
      `Notes on pacing, transitions, music and sound that match a ${f.personality.slice(0, 2).join(" and ") || "distinctive"} tone`,
      personality,
    ];
  }
  return [palette, typeLine, logoLine, imageryLine, personality];
}

/** A professional, art-director-style creative brief built from the current brand. */
export function composeFullBrief(s: BrandState, seed: number): string {
  const f = brandFacts(s);
  const d = deliverableInfo(s);
  const r = rng(seed + 71);
  const industry = f.industry === "brand" ? "brand" : f.industry;
  const intro = `I'm a designer developing ${article(industry)} ${industry} called ${f.name}${f.tagline ? `, with the tagline “${f.tagline}”` : ""}.`;
  const vision = `My creative vision is ${visionLine(s, r)}.`;
  const help = pickR(r, [
    "Help me establish a visual direction for this brand.",
    "Help me establish a clear, ownable visual direction for this brand.",
  ]);
  const create = `Create ${d.request} that includes:`;
  const items = includesFor(s, d.kind).map((x) => `- ${x}`);
  const format = `${DELIVERABLE_TEXT[d.kind]} ${LAYOUT_TEXT[d.kind]}`;
  const polish = "Keep the presentation polished, cohesive, and easy to evaluate.";
  const stage = pickR(r, STAGE_GUIDANCE[s.stage]);
  const edit = "Use clearly organized, editable elements wherever supported — live text layers, separate layers for the logo, swatches and graphic elements, and no typography flattened into images.";
  return [intro, vision, help, [create, ...items].join("\n"), format, polish, stage, edit].join("\n\n");
}

// ——— Mini asset prompt ———

/**
 * A focused prompt for one specific asset. Uses the Prompt Studio asset request when present,
 * otherwise falls back to the selected deliverable.
 */
export function composeMiniPrompt(s: BrandState, seed: number): string {
  const request = s.assetRequest?.trim() ?? "";
  if (!request) return composeDeliverableMini(s, seed);

  const f = brandFacts(s);
  const kind = detectKind(request);
  const r = rng(seed + 131);
  const mood = listJoin([...f.personality.slice(0, 2), ...f.aesthetics.slice(0, 1)]) || "distinctive";
  const subject = cap(request.replace(/[.\s]+$/, ""));
  const concept = s.imageConcepts.find((c) => (kind === "portrait" ? c.kind === "Portrait" : c.kind === "Product")) ?? s.imageConcepts[0];
  const treatment = concept
    ? `${cap(phraseOf(LIGHTING, concept.lighting))}, ${phraseOf(CAMERA, concept.camera)}, ${phraseOf(COMPOSITION, concept.composition)}, with ${article(phraseOf(ATMOSPHERE, concept.atmosphere))} ${phraseOf(ATMOSPHERE, concept.atmosphere)} atmosphere.`
    : "";
  const palette = `${f.colors[0].name} ${f.colors[0].hex} and ${f.colors[1].name} ${f.colors[1].hex}, with ${f.colors[2].name} ${f.colors[2].hex} accents on ${f.colors[3].name} ${f.colors[3].hex}`;
  const stageLine = s.stage === "explore" ? "Show a few varied takes." : s.stage === "develop" ? "Keep it cohesive and refined." : "Final, polished quality.";
  const lead = pickR(r, [`${subject}, art-directed for ${f.name},`, `${subject} for ${f.name},`]);

  if (kind === "photo" || kind === "portrait") {
    return [
      `${lead} ${article(mood)} ${mood} ${f.industry}.`,
      treatment,
      `Color story: ${palette}, carried through props and surfaces.`,
      `Styling and materials: ${f.profile.materials}.`,
      `${stageLine} No added text, logos or watermarks.`,
    ].filter(Boolean).join(" ");
  }
  if (kind === "logo") {
    return [
      `${subject} for “${f.name}”, ${article(f.industry)} ${f.industry} that feels ${mood}.`,
      f.logo ? `Build on the ${f.logo.direction.toLowerCase()} direction — ${f.logo.description}` : "",
      s.graphicLanguage.length ? `Graphic language: ${listJoin(lower(s.graphicLanguage))}.` : "",
      `Letterform reference: ${f.display.name}. Colors: ${palette}.`,
      `Flat vector artwork on a plain background. ${stageLine}`,
    ].filter(Boolean).join(" ");
  }
  return [
    `${lead} ${article(mood)} ${mood} ${f.industry}.`,
    treatment ? `Visual treatment: ${treatment}` : "",
    `Palette: ${palette}, with ${f.colors[4].name} ${f.colors[4].hex} for type. On dark surfaces, use ${primaryOnDark(s.palette).toUpperCase()} as the primary.`,
    `Typography: ${f.display.name} for headlines and ${f.body.name} for supporting text.`,
    f.tagline ? `Headline or sign-off: “${f.tagline}”.` : "",
    f.logo ? `Place the ${f.logo.direction.toLowerCase()} logo with generous clear space.` : "",
    `${stageLine} Keep text editable where supported.`,
  ].filter(Boolean).join(" ");
}

// ——— Firefly Builder design system ———
/**
 * One paragraph in the shape Builder's design-system panel expects: surface, type color,
 * dominant brand color, supporting and accent colors (all with hexes so nothing is guessed),
 * headline and body fonts, corner radius and overall feel. Paste it as the design-system prompt
 * and every page Builder generates carries this brand.
 */
export function composeBuilderPrompt(s: BrandState): string {
  const f = brandFacts(s);
  const [primary, secondary, accent, light, deep] = f.colors;
  const words = [...f.personality.slice(0, 2), ...f.aesthetics.slice(0, 1), ...f.values.slice(0, 1)];
  const all = [...s.traits].map((t) => t.toLowerCase());
  const tight = ["brutalist", "editorial", "minimalist", "art deco", "luxurious", "sophisticated"].some((w) => all.includes(w));
  const round = ["playful", "whimsical", "approachable", "optimistic", "organic modern", "botanical"].some((w) => all.includes(w));
  const radius = tight && !round ? "tight radii" : round && !tight ? "generously rounded corners" : "softly rounded corners";
  const feel = words.length ? listJoin(words) : "clear, confident";
  const dark = primaryOnDark(s.palette).toUpperCase();
  const logo = f.logo ? ` The logo is ${article(f.logo.direction)} ${f.logo.direction.toLowerCase()}${s.graphicLanguage.length ? ` with ${listJoin(lower(s.graphicLanguage))} graphic elements` : ""}.` : "";
  const imagery = s.imageConcepts.length
    ? ` Imagery is ${listJoin(lower(s.imageConcepts.map((c) => c.kind)))} with ${s.imageConcepts[0].lighting.toLowerCase()}.`
    : "";
  return [
    `${cap(feel)} ${f.industry}: ${light.name} ${light.hex} as the page surface, ${deep.name} ${deep.hex} for type, ${primary.name} ${primary.hex} as the dominant brand color, ${secondary.name} ${secondary.hex} supporting and ${accent.name} ${accent.hex} as a sharp accent (on dark surfaces use ${dark} as the primary).`,
    `${f.display.name} for display and headings over ${f.body.name} body, labels and captions, with ${radius} for ${article(feel.split(", ")[0])} ${feel.split(", ")[0]} feel.${logo}${imagery}`,
  ].join(" ");
}
