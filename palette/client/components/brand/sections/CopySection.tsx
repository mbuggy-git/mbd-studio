import { Check, RefreshCw } from "lucide-react";
import { CopyButton, LockButton, SectionShell, SubPanel, TextCard, softButton } from "../ui";
import type { SectionProps } from "./types";
import { requestTaglines } from "../../../lib/brand/ai";
import { generateDescription, generateMarketing, generateVoice } from "../../../lib/brand/generate";
import { refreshCopy } from "../../../lib/brand/state";
import { newSeed } from "../../../lib/brand/random";

export function CopySection({ brand, set, commit }: SectionProps) {
  const ctx = { name: brand.name || "The brand", industry: brand.industry, traits: brand.traits };

  const regenTaglines = async () => {
    const next = await requestTaglines(ctx, newSeed(), brand.taglines);
    commit((s) => ({ ...s, taglines: next }));
  };

  return (
    <SectionShell
      index="06 · Taglines & brand copy"
      title="Give it words"
      blurb="Copy follows the personality you chose. Edit anything; regenerate when you want fresh options."
      actions={
        <button type="button" className="ds-button ds-button-primary rounded-lg" onClick={() => commit((s) => refreshCopy(s, newSeed()))} data-oid="7ec9704e4b" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
          <RefreshCw className="h-4 w-4" data-oid="dc5080ebdf" />
          {brand.taglines.length ? "Regenerate all copy" : "Generate all copy"}
        </button>
      }
    >
      <SubPanel
        title="Tagline options"
        hint="Choose one for the Brand Board."
        actions={
          <button type="button" className={softButton} onClick={regenTaglines} disabled={brand.taglines.every((t) => t.locked)} data-oid="5571fc8a28" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-classname-dynamic="true">
            <RefreshCw className="h-4 w-4" data-oid="a6c03627ff" />
            {brand.taglines.length ? "Regenerate taglines" : "Generate taglines"}
          </button>
        }
      >
        <ol className="flex flex-col gap-ds-sm" data-oid="1e41230c0a">
          {brand.taglines.map((t, i) => {
            const inUse = brand.selectedTagline === i;
            return (
              <li key={i} data-selected={inUse} className="flex items-center gap-ds-sm rounded-lg border border-transparent bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] p-ds-xs pl-ds-md data-[selected=true]:border-foreground" data-oid="424e29ebac" data-oid-shared="true" data-oid-instance-targetable="true">
                <input
                  value={t.text}
                  onChange={(e) => set((s) => ({ ...s, taglines: s.taglines.map((x, k) => (k === i ? { text: e.target.value, locked: false } : x)) }))}
                  aria-label={`Tagline ${i + 1}`}
                  className="min-w-0 flex-1 bg-transparent py-ds-sm font-heading text-[20px] italic text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] outline-none" data-oid="c43ac06d73" data-oid-shared="true" data-oid-instance-targetable="true"
                />
                <button type="button" aria-pressed={inUse} onClick={() => set((s) => ({ ...s, selectedTagline: i }))} className="inline-flex items-center gap-ds-xs rounded-md border border-border px-ds-md py-ds-sm font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" data-oid="c73cee3746" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:16f06b75568f|expression:bf7c672cb153">
                  {inUse && <Check className="h-4 w-4" data-oid="9239dd8f73" data-oid-shared="true" />}
                  {inUse ? "On board" : "Use"}
                </button>
                <CopyButton text={t.text} label="" className="px-ds-sm" />
                <LockButton compact locked={t.locked} onToggle={() => set((s) => ({ ...s, taglines: s.taglines.map((x, k) => (k === i ? { ...x, locked: !x.locked } : x)) }))} label={`tagline ${i + 1}`} />
              </li>
            );
          })}
        </ol>
      </SubPanel>

      <div className="grid grid-cols-1 gap-ds-md 2xl:grid-cols-2" data-oid="bd16dce564">
        <TextCard
          title="Brand description"
          hint="A short description for the board and briefs."
          value={brand.description.text}
          locked={brand.description.locked}
          rows={4}
          onChange={(text) => set((s) => ({ ...s, description: { text, locked: false } }))}
          onToggleLock={() => set((s) => ({ ...s, description: { ...s.description, locked: !s.description.locked } }))}
          onRegenerate={() => commit((s) => ({ ...s, description: { text: generateDescription(ctx, newSeed()), locked: false } }))}
          regenerateLabel={brand.description.text.trim() ? "Regenerate" : "Generate"}
        />
        <TextCard
          title="Marketing paragraph"
          hint="A short paragraph for web, packaging or launch copy."
          value={brand.marketing.text}
          locked={brand.marketing.locked}
          rows={5}
          onChange={(text) => set((s) => ({ ...s, marketing: { text, locked: false } }))}
          onToggleLock={() => set((s) => ({ ...s, marketing: { ...s.marketing, locked: !s.marketing.locked } }))}
          onRegenerate={() => commit((s) => ({ ...s, marketing: { text: generateMarketing(ctx, newSeed()), locked: false } }))}
          regenerateLabel={brand.marketing.text.trim() ? "Regenerate" : "Generate"}
        />
      </div>

      <SubPanel
        title="Brand voice keywords"
        hint="Three words that guide how the brand sounds."
        actions={
          <button type="button" className={softButton} disabled={brand.voice.every((v) => v.locked)} onClick={() => commit((s) => ({ ...s, voice: generateVoice(s.traits, newSeed(), s.voice) }))} data-oid="5382513a7f" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-classname-dynamic="true">
            <RefreshCw className="h-4 w-4" data-oid="c9d795ece1" />
            {brand.voice.length ? "Regenerate voice" : "Generate voice"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-ds-sm md:grid-cols-3" data-oid="d0d3d08629">
          {brand.voice.map((v, i) => (
            <div key={i} className="flex items-center gap-ds-xs rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] p-ds-xs pl-ds-md" data-oid="c78b933dd1" data-oid-shared="true" data-oid-instance-targetable="true">
              <input
                value={v.text}
                onChange={(e) => set((s) => ({ ...s, voice: s.voice.map((x, k) => (k === i ? { text: e.target.value, locked: false } : x)) }))}
                aria-label={`Voice keyword ${i + 1}`}
                className="min-w-0 flex-1 bg-transparent py-ds-sm font-display text-[26px] font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] outline-none" data-oid="2c631abc21" data-oid-shared="true" data-oid-instance-targetable="true"
              />
              <LockButton compact locked={v.locked} onToggle={() => set((s) => ({ ...s, voice: s.voice.map((x, k) => (k === i ? { ...x, locked: !x.locked } : x)) }))} label={`voice keyword ${i + 1}`} />
            </div>
          ))}
        </div>
      </SubPanel>
    </SectionShell>
  );
}
