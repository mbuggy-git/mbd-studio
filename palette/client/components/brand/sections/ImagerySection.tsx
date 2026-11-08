import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ChipPicker, LockButton, SectionShell, SubPanel, TextCard, softButton } from "../ui";
import type { SectionProps } from "./types";
import { ATMOSPHERE, CAMERA, COMPOSITION, IMAGE_KINDS, LIGHTING, RATIOS } from "../../../lib/brand/artVocab";
import { generateImageConcept } from "../../../lib/brand/generate";
import { imagePrompt } from "../../../lib/brand/prompts";
import { newSeed } from "../../../lib/brand/random";
import type { ImageConcept, Ratio } from "../../../lib/brand/types";

const CHIP_GROUPS = [
  { key: "lighting" as const, label: "Lighting", terms: LIGHTING },
  { key: "camera" as const, label: "Camera", terms: CAMERA },
  { key: "composition" as const, label: "Composition", terms: COMPOSITION },
  { key: "atmosphere" as const, label: "Atmosphere", terms: ATMOSPHERE },
];

export function ImagerySection({ brand, set, commit }: SectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const idx = Math.min(activeIdx, brand.imageConcepts.length - 1);
  const concept = brand.imageConcepts[idx];

  const patch = (id: string, p: Partial<ImageConcept>) =>
    set((s) => ({ ...s, imageConcepts: s.imageConcepts.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const guarded = (p: Partial<ImageConcept>) => concept && !concept.locked && patch(concept.id, p);

  const setCount = (n: number) =>
    commit((s) => {
      const list = s.imageConcepts.slice(0, n);
      while (list.length < n) list.push(generateImageConcept(s, list.length, newSeed()));
      return { ...s, imageConcepts: list };
    });

  return (
    <SectionShell
      index="07 · Imagery & art direction"
      title="Direct the imagery"
      blurb="Plan one or two image concepts, each with its own ratio and art direction. Prompts are ready for any image generator — no images are generated here."
    >
      <SubPanel title="Imagery mix" hint="New concepts cycle through the types you pick.">
        <ChipPicker terms={IMAGE_KINDS} selected={brand.imageKinds} onToggle={(n) => commit((s) => {
          const next = { ...s, imageKinds: s.imageKinds.includes(n) ? s.imageKinds.filter((k) => k !== n) : [...s.imageKinds, n] };
          return { ...next, imageConcepts: next.imageConcepts.map((c, i) => generateImageConcept(next, i, c.seed, c)) };
        })} idPrefix="img-kind" groupLabel="Imagery type" />
      </SubPanel>

      {/* One row: how many concepts, then which one you're editing. */}
      <div className="flex flex-wrap items-center gap-ds-md">
        <div className="flex items-center gap-ds-sm">
          <span className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]">Concepts</span>
          <div className="ds-radio-group flex gap-ds-xs rounded-lg bg-[#d9c9f2] p-ds-xs" role="radiogroup" aria-label="Number of image concepts">
            {[1, 2].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={brand.imageConcepts.length === n} onClick={() => setCount(n)} className="ds-radio rounded-md px-ds-md py-ds-xs font-label text-label text-[#5f5f7a]">
                {n}
              </button>
            ))}
          </div>
        </div>
        <div role="tablist" aria-label="Image concepts" className="flex flex-wrap gap-ds-xs">
          {brand.imageConcepts.map((c, i) => {
            const kind = IMAGE_KINDS.find((k) => k.name === c.kind);
            return (
              <button key={c.id} type="button" role="tab" aria-selected={i === idx} onClick={() => setActiveIdx(i)} className="inline-flex items-center gap-ds-sm rounded-full border border-border bg-white py-ds-xs pl-ds-xs pr-ds-md text-left font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-selected:border-foreground aria-selected:bg-foreground aria-selected:text-background">
                <span className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: kind?.swatch }} aria-hidden="true" />
                Concept {i + 1} <span className="opacity-70">· {c.kind} · {c.ratio}</span>
              </button>
            );
          })}
        </div>
      </div>

      {concept && (
        <div role="tabpanel" className="flex flex-col gap-ds-md" data-oid="1b806d09a6">
          <SubPanel
            title={`Concept ${idx + 1}`}
            hint={`${concept.kind} · art direction for this image only.`}
            actions={
              <>
                <button type="button" className={softButton} onClick={() => commit((s) => ({ ...s, imageConcepts: s.imageConcepts.map((c, k) => (k === idx ? generateImageConcept(s, idx, newSeed(), c) : c)) }))} data-oid="17f09b74b6" data-oid-classname-dynamic="true">
                  <RefreshCw className="h-4 w-4" data-oid="3e709e9dcf" />
                  {brand.imageKinds.length ? "Regenerate concept" : "Generate concept"}
                </button>
                <LockButton locked={concept.locked} onToggle={() => patch(concept.id, { locked: !concept.locked })} label={`concept ${idx + 1}`} />
              </>
            }
          >
            <div className="flex flex-col gap-ds-lg" data-oid="345cd2fced" data-oid-text-editable="false" data-oid-text-source="element:div|expression:63ab67f50b7a">
              <div className="grid grid-cols-1 gap-ds-md md:max-w-xs" data-oid="5edf774a46">
                <div className="ds-field flex flex-col gap-ds-xs" data-oid="9c4162f85b">
                  <label htmlFor="concept-ratio" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="05dafebe27">Aspect ratio</label>
                  <select id="concept-ratio" value={concept.ratio} onChange={(e) => guarded({ ratio: e.target.value as Ratio })} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="c024fa0f3f">
                    {RATIOS.map((r) => <option key={r.id} value={r.id} data-oid="15d9be0f9d" data-oid-shared="true" data-oid-instance-targetable="true">{r.label}</option>)}
                  </select>
                </div>
              </div>
              {CHIP_GROUPS.map((g) => (
                <div key={g.key} className="flex flex-col gap-ds-sm" data-oid="9e6599a556" data-oid-shared="true" data-oid-instance-targetable="true">
                  <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="566d5f2006" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:f2e290982d4d|text|expression:79873de251f8">{g.label} · {concept[g.key]}</h4>
                  <ChipPicker terms={g.terms} selected={[concept[g.key]]} onToggle={(n) => guarded({ [g.key]: n } as Partial<ImageConcept>)} idPrefix={`img-${g.key}`} groupLabel={g.label} />
                </div>
              ))}
            </div>
          </SubPanel>

          <TextCard
            title={`Concept ${idx + 1} prompt`}
            hint={concept.promptOverride !== null ? "Edited — your wording is kept. Reset to return to the live prompt." : "Live — combines your brand identity with this concept's art direction."}
            value={concept.promptOverride ?? imagePrompt(brand, concept)}
            locked={concept.locked}
            edited={concept.promptOverride !== null}
            rows={6}
            mono
            onChange={(text) => patch(concept.id, { promptOverride: text })}
            onToggleLock={() => patch(concept.id, { locked: !concept.locked })}
            onReset={() => patch(concept.id, { promptOverride: null })}
          />
        </div>
      )}
    </SectionShell>
  );
}
