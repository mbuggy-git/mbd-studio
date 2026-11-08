import { ExternalLink, Shuffle } from "lucide-react";
import { ChipPicker, LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { TYPE_CLASSIFICATIONS, TYPE_PERSONALITY, TYPE_SHAPE } from "../../../lib/brand/artVocab";
import { adobeFontsSearchUrl, googleFontsUrl, previewStyle, recommendFonts, resolveFont } from "../../../lib/brand/fonts";
import type { BrandState, TypeSlot } from "../../../lib/brand/types";
import { pickR, sampleR } from "../../../lib/brand/random";

function SlotEditor({ role, brand, set, commit }: SectionProps & { role: "display" | "body" }) {
  const slot = brand[role];
  const title = role === "display" ? "Primary brand / display" : "Supporting / body";
  const patch = (p: Partial<TypeSlot>) => set((s) => (s[role].locked ? s : ({ ...s, [role]: { ...s[role], ...p } } as BrandState)));
  const toggleIn = (key: "personality" | "shape", name: string) =>
    patch({ [key]: slot[key].includes(name) ? slot[key].filter((x) => x !== name) : [...slot[key], name] } as Partial<TypeSlot>);
  const recs = recommendFonts(slot, brand.traits, role);
  const active = resolveFont(slot, brand.traits, role);
  const sample = role === "display" ? brand.name || "Brand" : "Every detail is part of the experience. Good type is felt before it is read.";

  const remix = () =>
    commit((s) => ({
      ...s,
      [role]: {
        ...s[role],
        classification: role === "body" ? pickR(Math.random, ["Sans serif", "Serif", "Monospace"]) : pickR(Math.random, TYPE_CLASSIFICATIONS).name,
        personality: sampleR(Math.random, TYPE_PERSONALITY, 2).map((x) => x.name),
        shape: sampleR(Math.random, TYPE_SHAPE, role === "body" ? 1 : 2).map((x) => x.name),
        font: null,
      },
    }) as BrandState);

  return (
    <SubPanel
      title={title}
      hint={slot.locked ? "Locked — Surprise Me and remixes keep this typography." : "Recommendations update as you change characteristics and personality words."}
      actions={
        <>
          <button type="button" className={softButton} onClick={remix} disabled={slot.locked} data-oid="ba006f7195" data-oid-classname-dynamic="true">
            <Shuffle className="h-4 w-4" data-oid="550c894f36" />
            Remix
          </button>
          <LockButton locked={slot.locked} onToggle={() => set((s) => ({ ...s, [role]: { ...s[role], locked: !s[role].locked } }) as BrandState)} label={`${role} typography`} />
        </>
      }
    >
      <div className="flex flex-col gap-ds-lg" data-oid="0823285746">
        <div className="flex min-h-[150px] flex-col justify-center gap-ds-sm overflow-hidden rounded-lg p-ds-lg" style={{ background: brand.palette[3].hex, color: brand.palette[4].hex }} data-oid="a79fd46c04" data-oid-style-dynamic="background,color">
          <p className={role === "display" ? "break-words text-[64px] leading-none" : "text-[20px] leading-relaxed"} style={previewStyle(slot, active)} data-oid="1001229201" data-oid-style-dynamic="*" data-oid-classname-dynamic="true">{sample}</p>
          <p className="font-caption text-caption opacity-70" data-oid="e90d846475" data-oid-text-editable="false" data-oid-text-source="expression:f24e885009c2|text|expression:b2f22b073215">{active.name} · {active.note}</p>
        </div>

        <div className="grid grid-cols-1 gap-ds-lg xl:grid-cols-3" data-oid="d0501eb2d9">
          <div className="flex flex-col gap-ds-sm" data-oid="7c83e6405b">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="d631459042">Classification</h4>
            <ChipPicker terms={TYPE_CLASSIFICATIONS} selected={[slot.classification]} onToggle={(n) => patch({ classification: n, font: null })} idPrefix={`${role}-cls`} groupLabel="Classification" disabled={slot.locked} />
          </div>
          <div className="flex flex-col gap-ds-sm" data-oid="0f89c18b04">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="7605c7336e">Personality</h4>
            <ChipPicker terms={TYPE_PERSONALITY} selected={slot.personality} onToggle={(n) => toggleIn("personality", n)} idPrefix={`${role}-per`} groupLabel="Type personality" disabled={slot.locked} />
          </div>
          <div className="flex flex-col gap-ds-sm" data-oid="aefcce815a">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="e04f9a4b57">Weight & shape</h4>
            <ChipPicker terms={TYPE_SHAPE} selected={slot.shape} onToggle={(n) => toggleIn("shape", n)} idPrefix={`${role}-shape`} groupLabel="Weight and shape" disabled={slot.locked} />
          </div>
        </div>

        <div className="flex flex-col gap-ds-sm" data-oid="f6898d3b57" data-oid-text-editable="false" data-oid-text-source="element:h4|element:ul|expression:16bd52d55867">
          <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="f1171af0ea">Recommended families</h4>
          <ul className="ds-listbox grid grid-cols-1 gap-ds-sm md:grid-cols-2 2xl:grid-cols-3" role="listbox" aria-label={`${title} font recommendations`} data-oid="867ade8e76">
            {recs.map((font, i) => {
              const isActive = font.name === active.name;
              return (
                <li key={font.name} role="option" aria-selected={isActive} className="ds-listbox-option flex flex-col gap-ds-xs rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] p-ds-md aria-selected:border-foreground aria-selected:shadow-[inset_0_0_0_1px_var(--foreground)]" data-oid="b66c6c42cb" data-oid-shared="true">
                  <button type="button" disabled={slot.locked} onClick={() => patch({ font: font.name })} className="flex flex-col items-start gap-ds-xs text-left disabled:cursor-not-allowed" data-oid="68ece9f065" data-oid-shared="true">
                    <span className="font-caption text-caption text-[#5f5f7a]" data-oid="c294f38a31" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="expression:5daf9ec29965|expression:f7c3380d4b9b">{i === 0 && !slot.font ? "Top match · auto" : font.classification}{isActive ? " · in use" : ""}</span>
                    <span className="truncate text-[28px] leading-tight text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" style={{ fontFamily: font.stack }} data-oid="9ef8bca292" data-oid-shared="true" data-oid-style-dynamic="fontFamily">{font.name}</span>
                    <span className="font-caption text-caption text-[#5f5f7a]" data-oid="f8cbee8fd7" data-oid-shared="true">{font.note}</span>
                  </button>
                  <div className="flex flex-wrap gap-ds-sm pt-ds-xs" data-oid="396c087aba" data-oid-shared="true">
                    <a href={googleFontsUrl(font.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-ds-xs font-caption text-caption text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] underline-offset-2 hover:underline" data-oid="e89ae0a0ea" data-oid-shared="true">
                      Google Fonts <ExternalLink className="h-3 w-3" data-oid="c25eb9bffb" data-oid-shared="true" />
                    </a>
                    <a href={adobeFontsSearchUrl(font.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-ds-xs font-caption text-caption text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] underline-offset-2 hover:underline" data-oid="5181bf15da" data-oid-shared="true">
                      Search Adobe Fonts <ExternalLink className="h-3 w-3" data-oid="3d50ae49b2" data-oid-shared="true" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
          {slot.font && !slot.locked && (
            <button type="button" className="w-fit font-caption text-caption text-[#5f5f7a] underline underline-offset-2" onClick={() => patch({ font: null })} data-oid="ab0e2701b9">
              Return to automatic top match
            </button>
          )}
        </div>
      </div>
    </SubPanel>
  );
}

export function TypographySection(props: SectionProps) {
  return (
    <SectionShell
      index="04 · Typography"
      title="Choose a voice in type"
      blurb="Set separate directions for the brand display face and the supporting text face. Previews use the named family when your browser has it, otherwise a close stand-in."
    >
      <SlotEditor role="display" {...props} />
      <SlotEditor role="body" {...props} />
      <p className="font-caption text-caption text-[#5f5f7a]" data-oid="34225ade24">
        All recommended families are open-source and published on Google Fonts. “Search Adobe Fonts” opens a search — it doesn’t guarantee the family is in the Adobe Fonts library.
      </p>
    </SectionShell>
  );
}
