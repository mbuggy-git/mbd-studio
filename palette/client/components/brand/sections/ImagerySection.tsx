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
  const [allRatio, setAllRatio] = useState<Ratio>("4:5");
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
  const canShrinkTo = (n: number) => brand.imageConcepts.slice(n).every((c) => !c.locked);

  return (
    <SectionShell
      index="07 · Imagery & art direction"
      title="Direct the imagery"
      blurb="Plan up to three image concepts, each with its own ratio and art direction. Prompts are ready for any image generator — no images are generated here."
    >
      <SubPanel title="Imagery mix" hint="New concepts cycle through the types you pick.">
        <ChipPicker terms={IMAGE_KINDS} selected={brand.imageKinds} onToggle={(n) => set((s) => ({ ...s, imageKinds: s.imageKinds.includes(n) ? s.imageKinds.filter((k) => k !== n) : [...s.imageKinds, n] }))} idPrefix="img-kind" groupLabel="Imagery type" />
      </SubPanel>

      <div className="flex flex-wrap items-end justify-between gap-ds-md" data-oid="0ba3422aad">
        <div className="flex flex-col gap-ds-xs" data-oid="7098457082">
          <span className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="94243717ec">How many concepts?</span>
          <div className="ds-radio-group flex gap-ds-xs rounded-lg bg-[#d9c9f2] p-ds-xs" role="radiogroup" aria-label="Number of image concepts" data-oid="52a13f8f72">
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={brand.imageConcepts.length === n} disabled={!canShrinkTo(n)} onClick={() => setCount(n)} className="ds-radio rounded-md px-ds-lg py-ds-sm font-label text-label text-[#5f5f7a] disabled:opacity-40 aria-checked:bg-foreground aria-checked:text-background" data-oid="632a2496fa" data-oid-shared="true" data-oid-instance-targetable="true">
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-ds-sm" data-oid="d7cfaf4c78">
          <div className="ds-field flex flex-col gap-ds-xs" data-oid="341ee2dae9">
            <label htmlFor="ratio-all" className="ds-field-label font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="3d04e6fd53">Aspect ratio for all</label>
            <select id="ratio-all" value={allRatio} onChange={(e) => setAllRatio(e.target.value as Ratio)} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="4f91f7a1c2">
              {RATIOS.map((r) => <option key={r.id} value={r.id} data-oid="2b2df93c12" data-oid-shared="true" data-oid-instance-targetable="true">{r.label}</option>)}
            </select>
          </div>
          <button type="button" className={softButton} onClick={() => commit((s) => ({ ...s, imageConcepts: s.imageConcepts.map((c) => (c.locked ? c : { ...c, ratio: allRatio })) }))} data-oid="75a25d13c8" data-oid-classname-dynamic="true">
            Apply to all
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Image concepts" className="grid gap-ds-sm" style={{ gridTemplateColumns: `repeat(${brand.imageConcepts.length}, minmax(0, 1fr))` }} data-oid="5f63493784" data-oid-style-dynamic="gridTemplateColumns">
        {brand.imageConcepts.map((c, i) => {
          const ratio = RATIOS.find((r) => r.id === c.ratio) ?? RATIOS[0];
          return (
            <button key={c.id} type="button" role="tab" aria-selected={i === idx} onClick={() => setActiveIdx(i)} className="flex items-center gap-ds-md rounded-xl border border-border bg-[#d9c9f2] p-ds-sm text-left hover:border-foreground aria-selected:border-foreground aria-selected:bg-foreground aria-selected:text-background" data-oid="efa27fc20d" data-oid-shared="true" data-oid-instance-targetable="true">
              <span className="block h-14 shrink-0 rounded-md" style={{ aspectRatio: `${ratio.w} / ${ratio.h}`, background: `linear-gradient(140deg, ${brand.palette[i % 3].hex}, ${brand.palette[3].hex})` }} aria-hidden="true" data-oid="2ec9a8b130" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="aspectRatio,background" />
              <span className="flex min-w-0 flex-col" data-oid="be3d1e5ed5" data-oid-shared="true" data-oid-instance-targetable="true">
                <span className="font-label text-label font-medium" data-oid="e60581255c" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="text|expression:80ab2b274cc6|expression:122633d194ce">Concept {i + 1}{c.locked ? " · locked" : ""}</span>
                <span className="truncate font-caption text-caption opacity-75" data-oid="3803bb1746" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:a9fadb4951af|text|expression:479dc588ae7c|text|expression:6781115b919f">{c.kind} · {c.ratio} · {c.lighting}</span>
              </span>
            </button>
          );
        })}
      </div>

      {concept && (
        <div role="tabpanel" className="flex flex-col gap-ds-md" data-oid="1b806d09a6">
          <SubPanel
            title={`Concept ${idx + 1}`}
            hint="Art direction for this image only."
            actions={
              <>
                <button type="button" className={softButton} disabled={concept.locked} onClick={() => commit((s) => ({ ...s, imageConcepts: s.imageConcepts.map((c, k) => (k === idx ? generateImageConcept(s, idx, newSeed(), c) : c)) }))} data-oid="17f09b74b6" data-oid-classname-dynamic="true">
                  <RefreshCw className="h-4 w-4" data-oid="3e709e9dcf" />
                  Regenerate concept
                </button>
                <LockButton locked={concept.locked} onToggle={() => patch(concept.id, { locked: !concept.locked })} label={`concept ${idx + 1}`} />
              </>
            }
          >
            <div className="flex flex-col gap-ds-lg" data-oid="345cd2fced" data-oid-text-editable="false" data-oid-text-source="element:div|expression:63ab67f50b7a">
              <div className="grid grid-cols-1 gap-ds-md md:grid-cols-[1fr_2fr_1fr]" data-oid="5edf774a46">
                <div className="ds-field flex flex-col gap-ds-xs" data-oid="156d9406a3">
                  <label htmlFor="concept-kind" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="ec0df5ea88">Imagery type</label>
                  <select id="concept-kind" value={concept.kind} disabled={concept.locked} onChange={(e) => guarded({ kind: e.target.value })} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="a74415e330">
                    {IMAGE_KINDS.map((k) => <option key={k.name} value={k.name} data-oid="9707aee513" data-oid-shared="true" data-oid-instance-targetable="true">{k.name}</option>)}
                  </select>
                </div>
                <div className="ds-field flex flex-col gap-ds-xs" data-oid="7e7a232f3f">
                  <label htmlFor="concept-subject" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="7b66a7d5ea">Subject</label>
                  <input id="concept-subject" value={concept.subject} disabled={concept.locked} onChange={(e) => guarded({ subject: e.target.value })} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="938d1e31cd" />
                </div>
                <div className="ds-field flex flex-col gap-ds-xs" data-oid="9c4162f85b">
                  <label htmlFor="concept-ratio" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="05dafebe27">Aspect ratio</label>
                  <select id="concept-ratio" value={concept.ratio} disabled={concept.locked} onChange={(e) => guarded({ ratio: e.target.value as Ratio })} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="c024fa0f3f">
                    {RATIOS.map((r) => <option key={r.id} value={r.id} data-oid="15d9be0f9d" data-oid-shared="true" data-oid-instance-targetable="true">{r.label}</option>)}
                  </select>
                </div>
              </div>
              {CHIP_GROUPS.map((g) => (
                <div key={g.key} className="flex flex-col gap-ds-sm" data-oid="9e6599a556" data-oid-shared="true" data-oid-instance-targetable="true">
                  <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="566d5f2006" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:f2e290982d4d|text|expression:79873de251f8">{g.label} · {concept[g.key]}</h4>
                  <ChipPicker terms={g.terms} selected={[concept[g.key]]} onToggle={(n) => guarded({ [g.key]: n } as Partial<ImageConcept>)} idPrefix={`img-${g.key}`} groupLabel={g.label} disabled={concept.locked} />
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
