import { useState } from "react";
import { Check, Pencil, RefreshCw } from "lucide-react";
import { CopyButton, LockButton, SectionShell, softButton } from "../ui";
import type { SectionProps } from "./types";
import { GRAPHIC_LANGUAGE, LOGO_DIRECTIONS } from "../../../lib/brand/artVocab";
import { freshPair, generateLogoConcept, pinsOf, regenerateLogos } from "../../../lib/brand/generate";
import { logoPrompt } from "../../../lib/brand/prompts";
import { resolveFont } from "../../../lib/brand/fonts";
import { newSeed, rng } from "../../../lib/brand/random";
import type { LogoConcept } from "../../../lib/brand/types";
import { LogoPreview } from "../LogoPreview";

export function LogoSection({ brand, set, commit }: SectionProps) {
  const ready = brand.logoConceptsReady !== false && brand.logoConcepts.length > 0;
  // A dropdown choice pins that card: the concept is rewritten for the new direction/graphic and keeps it on re-rolls.
  const repin = (i: number, pin: { direction?: string; graphic?: string }) =>
    commit((s) => ({
      ...s,
      logoConcepts: s.logoConcepts.map((c, k) => (k === i ? generateLogoConcept(s, i, newSeed(), c.id, { ...pinsOf(c), direction: pin.direction ?? c.direction, graphic: pin.graphic ?? c.graphic }) : c)),
    }));
  const [editing, setEditing] = useState<string | null>(null);
  const font = resolveFont(brand.display, brand.traits, "display");
  const colors = brand.palette.map((p) => p.hex);

  const patchConcept = (id: string, p: Partial<LogoConcept>) =>
    set((s) => ({ ...s, logoConcepts: s.logoConcepts.map((c) => (c.id === id ? { ...c, ...p } : c)) }));

  return (
    <SectionShell
      index="05 · Logo & graphic language"
      title="Explore the mark"
      blurb="Three exploratory concepts side by side. Set each card's direction and graphic language, re-roll until the words land, then select one. Previews are typographic sketches drawn in code — not finished or AI-rendered logos."
      actions={
        <button type="button" className="ds-button ds-button-primary rounded-lg" onClick={() => commit((s) => ({ ...s, logoConcepts: regenerateLogos(s, newSeed()), logoConceptsReady: true }))} data-oid="4ba756f9bb" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
          <RefreshCw className="h-4 w-4" data-oid="c75801596d" />
          {ready ? "Regenerate concepts" : "Generate concepts"}
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-ds-md xl:grid-cols-3" data-oid="d3b644e0cf">
        {!ready && [0, 1, 2].map((i) => (
          <article key={`empty-${i}`} className="flex flex-col overflow-hidden rounded-xl border border-dashed border-[color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-[#d9c9f2]">
            <div className="flex h-52 items-center justify-center bg-[color-mix(in_srgb,var(--primary)_10%,var(--background))]">
              <span className="h-16 w-16 rounded-xl border-2 border-dashed border-[#9f8cc4]" aria-hidden="true" />
            </div>
            <div className="flex flex-1 flex-col gap-ds-sm p-ds-md">
              <p className="font-caption text-caption uppercase tracking-[0.16em] text-[#5f5f7a]">Concept {i + 1}</p>
              <h3 className="font-heading text-heading text-[#9f8cc4]">Concept title</h3>
              <p className="font-label text-label text-[#9f8cc4]">Press Generate concepts and three sketches appear here, each with its own direction and graphic language.</p>
            </div>
            <div className="flex flex-col gap-ds-xs border-t border-[color-mix(in_srgb,var(--primary)_22%,var(--border))] p-ds-md">
              <p className="font-caption text-caption uppercase tracking-[0.16em] text-[#5f5f7a]">Generation prompt</p>
              <textarea readOnly rows={4} placeholder="The prompt for this concept is written here once it exists." className="ds-input w-full resize-none rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-caption text-caption" />
            </div>
          </article>
        ))}
        {ready && brand.logoConcepts.map((lc, i) => {
          const selected = brand.selectedLogo === i;
          const prompt = lc.promptOverride ?? logoPrompt(brand, lc);
          return (
            <article key={lc.id} data-selected={selected} className="flex flex-col overflow-hidden rounded-xl border border-border bg-[#d9c9f2] data-[selected=true]:border-foreground data-[selected=true]:shadow-[0_0_0_2px_var(--foreground)]" data-oid="881e642a0b" data-oid-shared="true" data-oid-instance-targetable="true">
              <div className="h-52" data-oid="14e80a3c79" data-oid-shared="true" data-oid-instance-targetable="true">
                <LogoPreview direction={lc.direction} name={brand.name} colors={colors} fontStack={font.stack} variant={i} seed={lc.seed} />
              </div>
              <div className="flex flex-1 flex-col gap-ds-sm p-ds-md" data-oid="cfcd15dfff" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:p|expression:ec08feb84e85|element:div">
                <div className="flex flex-col gap-ds-sm">
                  <span className="font-caption text-caption uppercase tracking-[0.16em] text-[#5f5f7a]">Concept {i + 1}</span>
                  <div className="grid grid-cols-2 gap-ds-sm">
                    <div className="ds-field flex flex-col gap-ds-xs">
                      <label htmlFor={`dir-${lc.id}`} className="ds-field-label font-caption text-caption text-[#5f5f7a]">Logo direction</label>
                      <select id={`dir-${lc.id}`} value={lc.direction} onChange={(e) => repin(i, { direction: e.target.value })} className="ds-input h-9 w-full rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-sm font-caption text-caption">
                        {LOGO_DIRECTIONS.map((d) => <option key={d.name} value={d.name} title={d.meaning}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="ds-field flex flex-col gap-ds-xs">
                      <label htmlFor={`gfx-${lc.id}`} className="ds-field-label font-caption text-caption text-[#5f5f7a]">Graphic language</label>
                      <select id={`gfx-${lc.id}`} value={lc.graphic} onChange={(e) => repin(i, { graphic: e.target.value })} className="ds-input h-9 w-full rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-sm font-caption text-caption">
                        <option value="">None</option>
                        {GRAPHIC_LANGUAGE.map((g) => <option key={g.name} value={g.name} title={g.meaning}>{g.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                {editing === lc.id ? (
                  <>
                    <input value={lc.title} onChange={(e) => patchConcept(lc.id, { title: e.target.value, locked: false })} aria-label="Concept title" className="ds-input rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-heading text-heading" data-oid="026070bd2b" data-oid-shared="true" />
                    <textarea value={lc.description} rows={4} onChange={(e) => patchConcept(lc.id, { description: e.target.value, locked: false })} aria-label="Concept description" className="ds-input rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-label text-label" data-oid="55f90ef382" data-oid-shared="true" />
                  </>
                ) : (
                  <>
                    <h3 className="font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="37417bcd72" data-oid-shared="true">{lc.title}</h3>
                    <p className="font-label text-label text-[#5f5f7a]" data-oid="4b3b84812d" data-oid-shared="true">{lc.description}</p>
                  </>
                )}
                <div className="mt-auto flex flex-wrap gap-ds-xs pt-ds-sm" data-oid="219fd17585" data-oid-shared="true" data-oid-instance-targetable="true">
                  <button type="button" aria-pressed={selected} onClick={() => set((s) => ({ ...s, selectedLogo: i, logoDirections: [lc.direction], graphicLanguage: lc.graphic ? [lc.graphic] : [] }))} className="inline-flex items-center gap-ds-xs rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md py-ds-sm font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" data-oid="7dee0ff61b" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:2ef296e6a963|expression:21b6694e3e0f">
                    {selected && <Check className="h-4 w-4" data-oid="76a2149b0c" data-oid-shared="true" />}
                    {selected ? "Selected" : "Select"}
                  </button>
                  <button type="button" className={softButton} onClick={() => setEditing(editing === lc.id ? null : lc.id)} data-oid="bc29f53ec1" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-classname-dynamic="true">
                    <Pencil className="h-4 w-4" data-oid="ca20990995" data-oid-shared="true" data-oid-instance-targetable="true" />
                    {editing === lc.id ? "Done" : "Edit"}
                  </button>
                  <button type="button" className={softButton} title="A new idea for this card — new direction, graphic language and wording" aria-label={`Regenerate concept ${i + 1}`} onClick={() => commit((s) => { const seed = newSeed(); return { ...s, logoConcepts: s.logoConcepts.map((c, k) => (k === i ? generateLogoConcept(s, i, seed, c.id, freshPair(rng(seed), c)) : c)) }; })} data-oid="a1156152be" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-classname-dynamic="true">
                    <RefreshCw className="h-4 w-4" data-oid="2133b058bf" data-oid-shared="true" data-oid-instance-targetable="true" />
                  </button>
                  <LockButton compact locked={lc.locked} onToggle={() => patchConcept(lc.id, { locked: !lc.locked })} label={`concept ${i + 1}`} />
                </div>
              </div>
              <div className="flex flex-col gap-ds-xs border-t border-[color-mix(in_srgb,var(--primary)_22%,var(--border))] p-ds-md" data-oid="6516cf2719" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:div|element:textarea|expression:90f264b11799">
                <div className="flex items-center justify-between gap-ds-sm" data-oid="387fba781e" data-oid-shared="true" data-oid-instance-targetable="true">
                  <label htmlFor={`logo-prompt-${lc.id}`} className="font-caption text-caption uppercase tracking-[0.16em] text-[#5f5f7a]" data-oid="4dff9546a3" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="text|expression:41d11d32c618">
                    Generation prompt {lc.promptOverride !== null && "· edited"}
                  </label>
                  <CopyButton text={prompt} className="px-ds-sm" />
                </div>
                <textarea id={`logo-prompt-${lc.id}`} value={prompt} rows={6} onChange={(e) => patchConcept(lc.id, { promptOverride: e.target.value })} className="ds-input resize-y rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-caption text-caption leading-relaxed" data-oid="8e84696bbe" data-oid-shared="true" data-oid-instance-targetable="true" />
                {lc.promptOverride !== null && (
                  <button type="button" className="w-fit font-caption text-caption text-[#5f5f7a] underline underline-offset-2" onClick={() => patchConcept(lc.id, { promptOverride: null })} data-oid="4766fef998" data-oid-shared="true">
                    Reset to live prompt
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
