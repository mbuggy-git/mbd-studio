import { RefreshCw } from "lucide-react";
import { ChipPicker, SectionShell, SubPanel, TextCard, softButton } from "../ui";
import type { SectionProps } from "./types";
import { ATMOSPHERE, CAMERA, COMPOSITION, IMAGE_KINDS, LIGHTING, RATIOS } from "../../../lib/brand/artVocab";
import { generateImageConcept } from "../../../lib/brand/generate";
import { imagePrompt } from "../../../lib/brand/prompts";
import { newSeed } from "../../../lib/brand/random";
import type { BrandState, ImageConcept, Ratio } from "../../../lib/brand/types";

const CHIP_GROUPS = [
  { key: "lighting" as const, label: "Lighting", terms: LIGHTING },
  { key: "camera" as const, label: "Camera", terms: CAMERA },
  { key: "composition" as const, label: "Composition", terms: COMPOSITION },
  { key: "atmosphere" as const, label: "Atmosphere", terms: ATMOSPHERE },
];

const MAX_KINDS = 2;

/** One concept per chosen imagery type, in the order chosen; existing concepts survive, new types get a fresh one. */
function conceptsFor(s: BrandState, kinds: string[]): ImageConcept[] {
  const next = { ...s, imageKinds: kinds };
  return kinds.map((kind, i) => {
    const existing = s.imageConcepts.find((c) => c.kind === kind);
    return existing ?? generateImageConcept(next, i, newSeed() + i);
  });
}

export function ImagerySection({ brand, set, commit }: SectionProps) {
  const patch = (id: string, p: Partial<ImageConcept>) =>
    set((s) => ({ ...s, imageConcepts: s.imageConcepts.map((c) => (c.id === id ? { ...c, ...p } : c)) }));

  const toggleKind = (name: string) =>
    commit((s) => {
      const on = s.imageKinds.includes(name);
      let kinds = on ? s.imageKinds.filter((k) => k !== name) : [...s.imageKinds, name];
      if (kinds.length > MAX_KINDS) kinds = kinds.slice(-MAX_KINDS); // newest two win
      return { ...s, imageKinds: kinds, imageConcepts: conceptsFor(s, kinds) };
    });

  // Concepts shown are exactly the chosen types, in order.
  const cards = brand.imageKinds
    .map((kind) => brand.imageConcepts.find((c) => c.kind === kind))
    .filter((c): c is ImageConcept => Boolean(c));

  return (
    <SectionShell
      index="07 · Imagery & art direction"
      title="Direct the imagery"
      blurb="Pick up to two imagery types; each gets its own card with ratio and art direction. Prompts are ready for any image generator — no images are generated here."
    >
      <SubPanel title="Imagery types" hint={`Pick up to two · ${brand.imageKinds.length} selected`}>
        <ChipPicker terms={IMAGE_KINDS} selected={brand.imageKinds} onToggle={toggleKind} idPrefix="img-kind" groupLabel="Imagery type" />
      </SubPanel>

      {cards.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-ds-md font-label text-label text-[#5f5f7a]">Choose an imagery type above and its card appears here.</p>
      )}

      {cards.length > 0 && (
        <div className={`grid grid-cols-1 gap-ds-md ${cards.length > 1 ? "xl:grid-cols-2" : ""}`}>
          {cards.map((concept) => {
            const index = brand.imageConcepts.findIndex((c) => c.id === concept.id);
            const kindTerm = IMAGE_KINDS.find((k) => k.name === concept.kind);
            return (
              <div key={concept.id} className="flex flex-col gap-ds-md">
                <SubPanel
                  title={concept.kind}
                  hint={kindTerm?.meaning ?? "Art direction for this image."}
                  actions={
                    <button type="button" className={softButton} onClick={() => commit((s) => ({ ...s, imageConcepts: s.imageConcepts.map((c, k) => (k === index ? generateImageConcept(s, k, newSeed(), c) : c)) }))}>
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </button>
                  }
                >
                  <div className="flex flex-col gap-ds-lg">
                    <div className="ds-field flex max-w-xs flex-col gap-ds-xs">
                      <label htmlFor={`ratio-${concept.id}`} className="ds-field-label font-caption text-caption text-[#5f5f7a]">Aspect ratio</label>
                      <select id={`ratio-${concept.id}`} value={concept.ratio} onChange={(e) => patch(concept.id, { ratio: e.target.value as Ratio })} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]">
                        {RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                    </div>
                    {CHIP_GROUPS.map((g) => (
                      <div key={g.key} className="flex flex-col gap-ds-sm">
                        <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]">{g.label} · {concept[g.key]}</h4>
                        <ChipPicker terms={g.terms} selected={[concept[g.key]]} onToggle={(n) => patch(concept.id, { [g.key]: n } as Partial<ImageConcept>)} idPrefix={`img-${concept.id}-${g.key}`} groupLabel={g.label} />
                      </div>
                    ))}
                  </div>
                </SubPanel>

                <TextCard
                  title={`${concept.kind} prompt`}
                  hint={concept.promptOverride !== null ? "Edited — your wording is kept. Reset to return to the live prompt." : "Live — combines your brand identity with this concept's art direction."}
                  value={concept.promptOverride ?? imagePrompt(brand, concept)}
                  locked={false}
                  edited={concept.promptOverride !== null}
                  rows={6}
                  mono
                  onChange={(text) => patch(concept.id, { promptOverride: text })}
                  onToggleLock={() => {}}
                  onReset={() => patch(concept.id, { promptOverride: null })}
                />
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
