import { Wand2 } from "lucide-react";
import { CopyButton, SubPanel, TextCard } from "./ui";
import type { SectionProps } from "./sections/types";
import { DELIVERABLES, STAGES } from "../../lib/brand/artVocab";
import { composeBuilderPrompt, composeDNA, composeFullBrief, composeMiniPrompt, deliverableInfo } from "../../lib/brand/prompts";
import { newSeed } from "../../lib/brand/random";
import type { BrandState, LiveText } from "../../lib/brand/types";

type LiveKey = "dna" | "fullBrief" | "miniPrompt";

const COMPOSE: Record<LiveKey, (s: BrandState, seed: number) => string> = {
  dna: composeDNA,
  fullBrief: composeFullBrief,
  miniPrompt: composeMiniPrompt,
};

/** Right-hand Prompt Studio: the three prompt outputs, always one click away from the Brand Board. */
export function PromptStudio({ brand, set, commit }: SectionProps) {
  const valueOf = (key: LiveKey) => brand[key].override ?? COMPOSE[key](brand, brand[key].seed);
  const patchLive = (key: LiveKey, p: Partial<LiveText>) => set((s) => ({ ...s, [key]: { ...s[key], ...p } }) as BrandState);

  const handlers = (key: LiveKey) => ({
    value: valueOf(key),
    locked: brand[key].locked,
    edited: brand[key].override !== null,
    onChange: (text: string) => patchLive(key, { override: text, locked: false }),
    onToggleLock: () =>
      brand[key].locked
        ? commit((s) => ({ ...s, [key]: { ...s[key], locked: false, override: null } }) as BrandState)
        : patchLive(key, { locked: false, override: valueOf(key) }),
    onRegenerate: () => commit((s) => ({ ...s, [key]: { override: null, locked: false, seed: newSeed() } }) as BrandState),
    onReset: () => commit((s) => ({ ...s, [key]: { ...s[key], override: null, locked: false } }) as BrandState),
  });

  const d = deliverableInfo(brand);
  const name = brand.name.trim() || "Untitled brand";

  return (
    <section aria-label="Prompt Studio" className="flex flex-col gap-ds-lg rounded-xl border border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] bg-[#ccb7ed] p-ds-lg shadow-[0_30px_60px_-30px_rgba(30,10,50,0.55)]" data-oid="2fcd3d724a" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      <div className="flex flex-wrap items-end justify-between gap-ds-md" data-oid="e2c14f1708">
        <div className="flex flex-col gap-ds-xs" data-oid="8b352617c2">
          <p className="inline-flex items-center gap-ds-xs font-caption text-caption font-medium uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="437a492c59">
            <Wand2 className="h-3.5 w-3.5" data-oid="2916dcfaa7" />
            Prompt Studio · updates live
          </p>
          <h2 className="font-display text-[40px] font-semibold leading-none tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="7f58520d7c" data-oid-text-editable="false" data-oid-text-source="text|expression:6ae999552a0d">Prompts for {name}</h2>
        </div>
        <div className="flex -space-x-2" aria-label="Current palette" data-oid="97566cbf1a">
          {brand.palette.map((sw, i) => (
            <span key={i} title={sw.hex.toUpperCase()} className="h-8 w-8 rounded-full border-2 border-[#f4eefb]" style={{ backgroundColor: sw.hex }} data-oid="d6b529f9d3" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="backgroundColor" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-ds-md rounded-xl border border-[color-mix(in_srgb,var(--primary)_22%,var(--border))] bg-[#d9c9f2] p-ds-md" data-oid="1f97f49157" data-oid-text-editable="false" data-oid-text-source="element:div|expression:38109287eb1f|element:div|element:p">
        <div className="ds-field flex flex-col gap-ds-xs" data-oid="e65feabba1">
          <label htmlFor="studio-deliverable" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="6eecce2967">Deliverable for the full brief</label>
          <select
            id="studio-deliverable"
            value={brand.deliverable}
            onChange={(e) => set((s) => ({ ...s, deliverable: e.target.value }))}
            className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" data-oid="32e51049a2">
            {DELIVERABLES.map((x) => (
              <option key={x.id} value={x.id} data-oid="3809ff0431" data-oid-shared="true" data-oid-instance-targetable="true">{x.label}</option>
            ))}
          </select>
        </div>
        {brand.deliverable === "custom" && (
          <div className="ds-field flex flex-col gap-ds-xs" data-oid="273417f4af">
            <label htmlFor="studio-custom" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="4c08d5cc30">Describe the deliverable</label>
            <input
              id="studio-custom"
              value={brand.customRequest}
              onChange={(e) => set((s) => ({ ...s, customRequest: e.target.value }))}
              placeholder="A launch poster series for our new iced coffee"
              className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" data-oid="d2b151c294" />
          </div>
        )}
        <div className="flex flex-col gap-ds-xs" data-oid="f4e5389dc2">
          <p className="font-caption text-caption text-[#5f5f7a]" data-oid="c32c465ed3">Design stage</p>
          <div className="grid grid-cols-3 gap-ds-xs" role="group" aria-label="Design stage" data-oid="27c6ab19bb">
            {STAGES.map((st) => (
              <button
                key={st.id}
                type="button"
                aria-pressed={brand.stage === st.id}
                title={st.blurb}
                onClick={() => set((s) => ({ ...s, stage: st.id }))}
                className="rounded-lg bg-[#e8def7] px-ds-sm py-ds-sm font-label text-label font-medium text-[#5f5f7a] shadow-[0_1px_2px_rgba(60,40,100,0.12)] transition-colors hover:bg-[#f3eefa] aria-pressed:bg-foreground aria-pressed:text-background" data-oid="9aa46ca173" data-oid-shared="true" data-oid-instance-targetable="true">
                {st.label}
              </button>
            ))}
          </div>
        </div>
        <p className="font-caption text-caption text-[#5f5f7a]" data-oid="87b68c1948" data-oid-text-editable="false" data-oid-text-source="text|expression:079b305931e8|text">Full brief request: “{d.request}”</p>
      </div>

      <TextCard
        title="Full Creative Brief"
        {...handlers("fullBrief")}
        rows={18}
        mono
        hint="An art-director-style brief for the deliverable and stage above." />

      <div className="flex flex-col gap-ds-sm" data-oid="88517be30e">
        <div className="ds-field flex flex-col gap-ds-xs" data-oid="c2061048aa">
          <label htmlFor="asset-request" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="6ba71cd22a">What specific asset do you need?</label>
          <input
            id="asset-request"
            value={brand.assetRequest ?? ""}
            onChange={(e) => set((s) => ({ ...s, assetRequest: e.target.value }))}
            placeholder="Product advertisement featuring a bag of coffee on a wooden table"
            className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" data-oid="635d6e711d" />
        </div>
        <TextCard
          title="Mini Asset Prompt"
          {...handlers("miniPrompt")}
          rows={7}
          hint={
            brand.assetRequest?.trim()
                ? "Your request, combined with only the brand details this asset needs."
                : "Describe an asset above, or it follows the deliverable you picked."
          } />
      </div>

      <SubPanel
        title="Firefly Builder design system"
        hint="Paste as Builder's design-system prompt; every page it generates then carries this brand. Rewrites itself as the brand changes."
        actions={<CopyButton text={composeBuilderPrompt(brand)} label="Copy prompt" />}
      >
        <textarea readOnly rows={6} value={composeBuilderPrompt(brand)} className="ds-input w-full resize-y rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-caption text-caption" />
      </SubPanel>
    </section>
  );
}
