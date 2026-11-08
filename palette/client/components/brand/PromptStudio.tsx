import { Wand2 } from "lucide-react";
import { CopyButton, SubPanel, TextCard } from "./ui";
import type { SectionProps } from "./sections/types";
import { DELIVERABLES } from "../../lib/brand/artVocab";
import { composeBuilderPrompt, composeDNA, composeFullBrief, composeMiniPrompt } from "../../lib/brand/prompts";
import { newSeed } from "../../lib/brand/random";
import type { BrandState, LiveText } from "../../lib/brand/types";

type LiveKey = "dna" | "fullBrief" | "miniPrompt";

const COMPOSE: Record<LiveKey, (s: BrandState, seed: number) => string> = {
  dna: composeDNA,
  fullBrief: composeFullBrief,
  miniPrompt: composeMiniPrompt,
};

const BOARDS = DELIVERABLES.filter((x) => x.kind === "board");
const ASSETS = DELIVERABLES.filter((x) => x.kind !== "board");

/** Right-hand Prompt Studio: Brand DNA, then one card that is either a brief (for a board) or a prompt (for an asset). */
export function PromptStudio({ brand, set, commit }: SectionProps) {
  const mode: "brief" | "asset" = brand.studioMode ?? "brief";
  // The stage follows the mode: exploring a board vs producing a finished board or an asset.
  const stageFor = (m: "brief" | "asset", deliverable: string) => (m === "asset" || deliverable === "finished-board" ? "produce" : "explore");
  const setMode = (m: "brief" | "asset") =>
    set((s) => {
      const list = m === "brief" ? BOARDS : ASSETS;
      const deliverable = list.some((x) => x.id === s.deliverable) ? s.deliverable : list[0].id;
      return { ...s, studioMode: m, deliverable, stage: stageFor(m, deliverable) };
    });
  const setDeliverable = (deliverable: string) => set((s) => ({ ...s, deliverable, stage: stageFor(mode, deliverable) }));
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

      <div className="flex flex-col gap-ds-md">
        <div role="tablist" aria-label="Brand board or asset prompt" data-mode={mode} className="group relative grid w-fit grid-cols-2 rounded-full border border-[#c4b0e6] bg-white p-1 shadow-[inset_0_1px_3px_rgba(60,40,100,0.18)]">
          <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-foreground shadow-[0_2px_6px_rgba(30,10,50,0.35)] transition-transform duration-300 ease-out group-data-[mode=asset]:translate-x-full" />
          <button type="button" role="tab" aria-selected={mode === "brief"} onClick={() => setMode("brief")} className="relative z-10 rounded-full px-ds-lg py-ds-sm text-center font-label text-label text-[#5f5f7a] transition-colors duration-300 aria-selected:text-background">
            Brand Board Prompt
          </button>
          <button type="button" role="tab" aria-selected={mode === "asset"} onClick={() => setMode("asset")} className="relative z-10 rounded-full px-ds-lg py-ds-sm text-center font-label text-label text-[#5f5f7a] transition-colors duration-300 aria-selected:text-background">
            Asset Prompt
          </button>
        </div>

        {mode === "brief" ? (
          <TextCard
            title="Brand Board Prompt"
            {...handlers("fullBrief")}
            rows={18}
            mono
            hint="An art-director-style prompt for a brand board, built from everything above."
            before={
              <div className="ds-field flex flex-col gap-ds-xs">
                <label htmlFor="studio-deliverable" className="ds-field-label font-caption text-caption text-[#5f5f7a]">Board</label>
                <select id="studio-deliverable" value={brand.deliverable} onChange={(e) => setDeliverable(e.target.value)} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body">
                  {BOARDS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
              </div>
            } />
        ) : (
          <TextCard
            title="Asset Prompt"
            {...handlers("miniPrompt")}
            rows={8}
            mono
            hint="Pick an asset and the prompt carries only the brand details it needs. Choose Custom to describe your own."
            before={
              <div className={`grid grid-cols-1 gap-ds-sm ${brand.deliverable === "custom" ? "md:grid-cols-[1fr_2fr]" : "md:max-w-sm"}`}>
                <div className="ds-field flex flex-col gap-ds-xs">
                  <label htmlFor="studio-deliverable" className="ds-field-label font-caption text-caption text-[#5f5f7a]">Asset</label>
                  <select id="studio-deliverable" value={brand.deliverable} onChange={(e) => setDeliverable(e.target.value)} className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body">
                    {ASSETS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                </div>
                {brand.deliverable === "custom" && (
                <div className="ds-field flex flex-col gap-ds-xs">
                  <label htmlFor="asset-request" className="ds-field-label font-caption text-caption text-[#5f5f7a]">Describe the asset</label>
                  <input
                    id="asset-request"
                    value={brand.assetRequest ?? ""}
                    onChange={(e) => set((s) => ({ ...s, assetRequest: e.target.value, customRequest: e.target.value }))}
                    placeholder="Product advertisement featuring a bag of coffee on a wooden table"
                    className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" />
                </div>
                )}
              </div>
            } />
        )}
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
