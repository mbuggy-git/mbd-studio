import { CATEGORIES, type CategoryId } from "./vocabulary"

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("")
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Each category plays a distinct role in the finished prompt. */
const SENTENCES: Record<CategoryId, ((list: string) => string)[]> = {
  subject: [
    (l) => `The scene features ${l}.`,
    (l) => `Visual motifs include ${l}.`,
    (l) => `Woven into the image: ${l}.`,
  ],
  style: [
    (l) => `Rendered with ${l}.`,
    (l) => `The visual language draws on ${l}.`,
    (l) => `Art-directed with ${l}.`,
  ],
  camera: [
    (l) => `Captured as ${l}.`,
    (l) => `The camera frames it with ${l}.`,
    (l) => `Photographed using ${l}.`,
  ],
  composition: [
    (l) => `Composed as ${l}.`,
    (l) => `The layout favors ${l}.`,
    (l) => `Structurally, the image uses ${l}.`,
  ],
  lighting: [
    (l) => `Illuminated by ${l}.`,
    (l) => `The scene is lit with ${l}.`,
    (l) => `Lighting comes from ${l}.`,
  ],
  color: [
    (l) => `The palette is built on ${l}.`,
    (l) => `Color direction: ${l}.`,
    (l) => `Colored with ${l}.`,
  ],
  mood: [
    (l) => `The atmosphere carries ${l}.`,
    (l) => `Emotionally, it evokes ${l}.`,
    (l) => `The whole frame is charged with ${l}.`,
  ],
  texture: [
    (l) => `Surfaces show ${l}.`,
    (l) => `Finished with ${l}.`,
    (l) => `Material detail: ${l}.`,
  ],
}

const ORDERS: CategoryId[][] = [
  ["subject", "style", "camera", "composition", "lighting", "color", "mood", "texture"],
  ["subject", "mood", "camera", "lighting", "style", "composition", "color", "texture"],
  ["subject", "camera", "composition", "style", "color", "lighting", "texture", "mood"],
]

const CLOSERS = [
  "Highly detailed, intentional and cohesive — every element serving a single visual idea.",
  "Professional art direction, refined craft, and a unified mood throughout.",
  "Rich detail, considered restraint, and a clear, confident point of view.",
]

export function buildPrompt(brief: string, selected: string[], seed: number): string {
  const variant = ((seed % 3) + 3) % 3
  const cleanBrief = brief.trim().replace(/[.\s]+$/, "")
  const subject = cleanBrief
    ? [
        `${capitalize(cleanBrief)}.`,
        `Subject: ${cleanBrief.charAt(0).toLowerCase() + cleanBrief.slice(1)}.`,
        `An image of ${cleanBrief.charAt(0).toLowerCase() + cleanBrief.slice(1)}.`,
      ][variant]
    : "An evocative, art-directed visual concept."

  const sentences: string[] = [subject]
  ORDERS[variant].forEach((id, i) => {
    const category = CATEGORIES.find((c) => c.id === id)
    if (!category) return
    const phrases = category.terms.filter((t) => selected.includes(t.name)).map((t) => t.phrase)
    if (phrases.length === 0) return
    const builder = SENTENCES[id][(variant + i) % 3]
    sentences.push(builder(joinList(phrases)))
  })
  sentences.push(CLOSERS[variant])
  return sentences.join(" ")
}
