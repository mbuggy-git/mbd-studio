import { useState } from "react";
import { Check, Pencil, RefreshCw } from "lucide-react";
import { ChipPicker, CopyButton, LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { GRAPHIC_LANGUAGE, LOGO_DIRECTIONS } from "../../../lib/brand/artVocab";
import { generateLogoConcept, regenerateLogos } from "../../../lib/brand/generate";
import { logoPrompt } from "../../../lib/brand/prompts";
import { resolveFont } from "../../../lib/brand/fonts";
import { newSeed } from "../../../lib/brand/random";
import type { LogoConcept } from "../../../lib/brand/types";
import { LogoPreview } from "../LogoPreview";

export function LogoSection({ brand, set, commit }: SectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const font = resolveFont(brand.display, brand.traits, "display");
  const colors = brand.palette.map((p) => p.hex);

  const patchConcept = (id: string, p: Partial<LogoConcept>) =>
    set((s) => ({ ...s, logoConcepts: s.logoConcepts.map((c) => (c.id === id ? { ...c, ...p } : c)) }));

  // Changing directions or graphic language refreshes the unlocked concepts right away, and a newly
  // picked direction becomes the selected concept so the Brand Board reflects it.
  const toggleList = (key: "logoDirections" | "graphicLanguage", name: string) =>
    set((s) => {
      const adding = !s[key].includes(name);
      const next = { ...s, [key]: adding ? [...s[key], name] : s[key].filter((x) => x !== name) };
      const logoConcepts = s.logoConcepts.map((lc, i) => (lc.locked ? lc : generateLogoConcept(next, i, Number.isFinite(lc.seed) ? lc.seed : newSeed(), lc.id)));
      let selectedLogo = s.selectedLogo;
      if (key === "logoDirections" && adding) {
        const hit = logoConcepts.findIndex((lc) => lc.direction === name);
        if (hit >= 0) selectedLogo = hit;
      }
      return { ...next, logoConcepts, selectedLogo };
    });

  return (
    <SectionShell
      index="05 · Logo & graphic language"
      title="Explore the mark"
      blurb="Choose directions and a graphic vocabulary, then compare three exploratory concepts. Previews are typographic sketches drawn in code — not finished or AI-rendered logos."
      actions={
        <button type="button" className="ds-button ds-button-primary rounded-lg" onClick={() => commit((s) => ({ ...s, logoConcepts: regenerateLogos(s, newSeed()) }))} disabled={brand.logoConcepts.every((c) => c.locked)} data-oid="4ba756f9bb" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
          <RefreshCw className="h-4 w-4" data-oid="c75801596d" />
          Regenerate unlocked concepts
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-ds-md 2xl:grid-cols-2" data-oid="6fd65e141c">
        <SubPanel title="Logo directions" hint={`${brand.logoDirections.length} selected · concepts cycle through these`}>
          <ChipPicker terms={LOGO_DIRECTIONS} selected={brand.logoDirections} onToggle={(n) => toggleList("logoDirections", n)} idPrefix="logo-dir" groupLabel="Logo direction" />
        </SubPanel>
        <SubPanel title="Graphic language" hint={`${brand.graphicLanguage.length} selected`}>
          <ChipPicker terms={GRAPHIC_LANGUAGE} selected={brand.graphicLanguage} onToggle={(n) => toggleList("graphicLanguage", n)} idPrefix="logo-gfx" groupLabel="Graphic language" />
        </SubPanel>
      </div>

      <div className="grid grid-cols-1 gap-ds-md xl:grid-cols-3" data-oid="d3b644e0cf">
        {brand.logoConcepts.map((lc, i) => {
          const selected = brand.selectedLogo === i;
          const prompt = lc.promptOverride ?? logoPrompt(brand, lc);
          return (
            <article key={lc.id} data-selected={selected} className="flex flex-col overflow-hidden rounded-xl border border-border bg-[#d9c9f2] data-[selected=true]:border-foreground data-[selected=true]:shadow-[0_0_0_2px_var(--foreground)]" data-oid="881e642a0b" data-oid-shared="true" data-oid-instance-targetable="true">
              <div className="h-52" data-oid="14e80a3c79" data-oid-shared="true" data-oid-instance-targetable="true">
                <LogoPreview direction={lc.direction} name={brand.name} colors={colors} fontStack={font.stack} variant={i} seed={lc.seed} />
              </div>
              <div className="flex flex-1 flex-col gap-ds-sm p-ds-md" data-oid="cfcd15dfff" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:p|expression:ec08feb84e85|element:div">
                <p className="font-caption text-caption uppercase tracking-[0.16em] text-[#5f5f7a]" data-oid="594202dbe8" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="text|expression:80ab2b274cc6|text|expression:0c1756682228|text|expression:d16767eb18b1">Concept {i + 1} · {lc.direction} · {lc.graphic}</p>
                {editing === lc.id ? (
                  <>
                    <input value={lc.title} onChange={(e) => patchConcept(lc.id, { title: e.target.value, locked: true })} aria-label="Concept title" className="ds-input rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-heading text-heading" data-oid="026070bd2b" data-oid-shared="true" />
                    <textarea value={lc.description} rows={4} onChange={(e) => patchConcept(lc.id, { description: e.target.value, locked: true })} aria-label="Concept description" className="ds-input rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-label text-label" data-oid="55f90ef382" data-oid-shared="true" />
                  </>
                ) : (
                  <>
                    <h3 className="font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="37417bcd72" data-oid-shared="true">{lc.title}</h3>
                    <p className="font-label text-label text-[#5f5f7a]" data-oid="4b3b84812d" data-oid-shared="true">{lc.description}</p>
                  </>
                )}
                <div className="mt-auto flex flex-wrap gap-ds-xs pt-ds-sm" data-oid="219fd17585" data-oid-shared="true" data-oid-instance-targetable="true">
                  <button type="button" aria-pressed={selected} onClick={() => set((s) => ({ ...s, selectedLogo: i }))} className="inline-flex items-center gap-ds-xs rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md py-ds-sm font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" data-oid="7dee0ff61b" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:2ef296e6a963|expression:21b6694e3e0f">
                    {selected && <Check className="h-4 w-4" data-oid="76a2149b0c" data-oid-shared="true" />}
                    {selected ? "Selected" : "Select"}
                  </button>
                  <button type="button" className={softButton} onClick={() => setEditing(editing === lc.id ? null : lc.id)} data-oid="bc29f53ec1" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-classname-dynamic="true">
                    <Pencil className="h-4 w-4" data-oid="ca20990995" data-oid-shared="true" data-oid-instance-targetable="true" />
                    {editing === lc.id ? "Done" : "Edit"}
                  </button>
                  <button type="button" className={softButton} disabled={lc.locked} title={lc.locked ? "Unlock to regenerate" : "Regenerate this concept"} aria-label={`Regenerate concept ${i + 1}`} onClick={() => commit((s) => ({ ...s, logoConcepts: s.logoConcepts.map((c, k) => (k === i ? generateLogoConcept(s, i, newSeed(), c.id) : c)) }))} data-oid="a1156152be" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-classname-dynamic="true">
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
