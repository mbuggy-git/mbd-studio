import { useState } from "react";
import { Check, Dices, RefreshCw, Sparkles } from "lucide-react";
import { LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { INDUSTRY_IDEAS, generateNames } from "../../../lib/brand/generate";
import { requestNames } from "../../../lib/brand/ai";
import { newSeed, pickR } from "../../../lib/brand/random";
import { applyIndustry, surpriseTraits } from "../../../lib/brand/state";

export function ConceptSection({ brand, set, commit }: SectionProps) {
  const [mode, setMode] = useState<"own" | "generate">("generate");
  const [busy, setBusy] = useState(false);
  // Which industry names were last generated for — drives the Generate vs Regenerate label.
  const [generatedFor, setGeneratedFor] = useState<string | null>(null);
  const hasGenerated = generatedFor !== null && generatedFor === brand.industry.trim() && brand.nameSuggestions.length > 0;

  const regenerate = async () => {
    setBusy(true);
    setMode("generate");
    const { names } = await requestNames({ industry: brand.industry, traits: brand.traits, exclude: brand.nameSuggestions }, newSeed());
    commit((s) => ({ ...s, nameSuggestions: names, name: s.nameLocked ? s.name : names[0] ?? s.name }));
    setGeneratedFor(brand.industry.trim());
    setBusy(false);
  };

  const surpriseNames = () => {
    const seed = newSeed();
    const names = generateNames(brand.industry, surpriseTraits(seed), seed);
    commit((s) => ({ ...s, nameSuggestions: names, name: s.nameLocked ? s.name : names[0] }));
    setGeneratedFor(brand.industry.trim());
  };

  // Naming-method switch, shown at the top of whichever naming card is open.
  const namingSwitch =
  <div role="tablist" aria-label="Naming method" data-mode={mode} className="group relative grid w-fit grid-cols-2 rounded-full border border-[#c4b0e6] bg-white p-1 shadow-[inset_0_1px_3px_rgba(60,40,100,0.18)]" data-oid="d3c784f834" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-foreground shadow-[0_2px_6px_rgba(30,10,50,0.35)] transition-transform duration-300 ease-out group-data-[mode=generate]:translate-x-full" data-oid="10c4ae92dd" />
      <button type="button" role="tab" aria-selected={mode === "own"} onClick={() => setMode("own")} className="relative z-10 rounded-full px-ds-lg py-ds-sm text-center font-label text-label text-[#5f5f7a] transition-colors duration-300 aria-selected:text-background" data-oid="8a05a1813e">
        Enter my own name
      </button>
      <button type="button" role="tab" aria-selected={mode === "generate"} onClick={() => setMode("generate")} className="relative z-10 rounded-full px-ds-lg py-ds-sm text-center font-label text-label text-[#5f5f7a] transition-colors duration-300 aria-selected:text-background" data-oid="6aca170389">
        Generate brand names
      </button>
    </div>;

  return (
    <SectionShell
      index="01 · Brand concept & naming"
      title="Name the brand"
      blurb="Describe what the brand makes, then write your own name or generate options.">
      
      <SubPanel title="What kind of business is it?" hint="A type of business, product or industry. Changing it never resets your other choices.">
        <div className="flex flex-col gap-ds-md" data-oid="f4f81a87e2">
          <form
            className="flex flex-wrap gap-ds-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (brand.industry.trim()) regenerate();
            }} data-oid="331e0b0595">
            
            <input
              value={brand.industry}
              onChange={(e) => set((s) => applyIndustry(s, e.target.value))}
              placeholder="e.g. specialty coffee company"
              aria-label="Business, product or industry"
              className="ds-input min-w-[260px] flex-1 rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" data-oid="a6ec5fdf76" />
            
            <button type="submit" disabled={!brand.industry.trim() || busy} className="ds-button ds-button-primary rounded-lg disabled:cursor-not-allowed disabled:opacity-50" title="Press Enter or click to generate five name ideas" data-oid="3c15a77a99">
              <Sparkles className="h-4 w-4" data-oid="911489526c" />
              Generate brand names
            </button>
            <button type="button" className={softButton} onClick={() => commit((s) => applyIndustry(s, pickR(Math.random, INDUSTRY_IDEAS.filter((x) => x !== s.industry))))} data-oid="2f0676abdd" data-oid-classname-dynamic="true">
              <Dices className="h-4 w-4" data-oid="0b15c73171" />
              Surprise industry
            </button>
          </form>
          <ul className="flex flex-wrap gap-ds-xs" aria-label="Example industries" data-oid="788c7f3776">
            {INDUSTRY_IDEAS.slice(0, 8).map((idea) =>
            <li key={idea} data-oid="9e46ed30d6" data-oid-shared="true" data-oid-instance-targetable="true">
                <button
                type="button"
                aria-pressed={brand.industry === idea}
                onClick={() => commit((s) => applyIndustry(s, idea))}
                className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md py-ds-xs font-caption text-caption text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" data-oid="41fdccda11" data-oid-shared="true" data-oid-instance-targetable="true">
                
                  {idea}
                </button>
              </li>
            )}
          </ul>
        </div>
      </SubPanel>

      <div className="ds-tabs flex flex-col gap-ds-md" data-oid="617f5d5308">
        <div role="tabpanel" className="ds-tab-panel" data-oid="6bf657577f">
          {mode === "own" ?
          <SubPanel title="Brand name" hint="Typing a name locks it so Surprise Me won't replace it. Unlock any time." actions={namingSwitch}>
              <div className="mb-ds-md flex justify-end" data-oid="dff4097275">
                <LockButton locked={brand.nameLocked} onToggle={() => set((s) => ({ ...s, nameLocked: !s.nameLocked }))} label="brand name" />
              </div>
              <input
              value={brand.name}
              onChange={(e) => set((s) => ({ ...s, name: e.target.value, nameLocked: true }))}
              placeholder="Your brand name"
              aria-label="Brand name"
              className="ds-input w-full rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] py-ds-md font-display text-[32px] font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="bc0d766ac5" />
            
            </SubPanel> :

          <SubPanel
            title="Five name ideas"
            hint="Generate name ideas or add your own."
            actions={namingSwitch}>
              <div className="mb-ds-md flex flex-wrap items-center gap-ds-sm" data-oid="d15c49dbc3">
                  <button type="button" className={softButton} onClick={regenerate} disabled={busy} data-oid="fce2c7ec8e" data-oid-classname-dynamic="true" data-oid-text-editable="false">
                    <RefreshCw className="h-4 w-4" data-oid="fc1302bbb4" />
                    {hasGenerated ? "Regenerate names" : "Generate names"}
                  </button>
                  <button type="button" className={softButton} onClick={surpriseNames} data-oid="f395bb5c05" data-oid-classname-dynamic="true" style={{ backgroundColor: "#b267c7", color: "#ffffff" }}>
                    <Sparkles className="h-4 w-4" data-oid="b7bbda055f" />
                    Surprise me
                  </button>
                  <LockButton locked={brand.nameLocked} onToggle={() => set((s) => ({ ...s, nameLocked: !s.nameLocked }))} label="brand name" />
              </div>
              <ol className="flex flex-col gap-ds-sm" data-oid="945eb67acc" data-oid-text-editable="false" data-oid-text-source="expression:af19ad232bad|expression:317e703cb560">
                {brand.nameSuggestions.length === 0 &&
              <li className="rounded-lg border border-dashed border-border p-ds-md font-label text-label text-[#5f5f7a]" data-oid="3cc95aeeaa">Type your business above and press Generate brand names to see five ideas here.</li>
              }
                {brand.nameSuggestions.length > 0 && brand.traits.length === 0 &&
              <li className="font-caption text-caption text-[#5f5f7a]">These use a neutral voice. Pick personality words in step 02, then come back and regenerate for names in that voice.</li>
              }
                {brand.nameSuggestions.map((n, i) => {
                const current = n === brand.name;
                return (
                  <li key={i} data-selected={current} className="flex items-center gap-ds-sm rounded-lg border border-transparent bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] p-ds-xs pl-ds-md data-[selected=true]:border-foreground" data-oid="5424cb0a3d" data-oid-shared="true" data-oid-instance-targetable="true">
                      <span className="w-6 font-caption text-caption text-[#5f5f7a]" data-oid="1f5448c01c" data-oid-shared="true" data-oid-instance-targetable="true">{String(i + 1).padStart(2, "0")}</span>
                      <input
                      value={n}
                      onChange={(e) =>
                      set((s) => {
                        const next = [...s.nameSuggestions];
                        next[i] = e.target.value;
                        return { ...s, nameSuggestions: next, name: current && !s.nameLocked ? e.target.value : s.name };
                      })
                      }
                      aria-label={`Name suggestion ${i + 1}`}
                      className="min-w-0 flex-1 bg-transparent py-ds-sm font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] outline-none" data-oid="16bb5ebb63" data-oid-shared="true" data-oid-instance-targetable="true" />
                    
                      <button
                      type="button"
                      aria-pressed={current}
                      disabled={brand.nameLocked && !current}
                      title={brand.nameLocked && !current ? "Unlock the name to switch" : undefined}
                      onClick={() => commit((s) => ({ ...s, name: n }))}
                      className="inline-flex items-center gap-ds-xs rounded-md border border-border px-ds-md py-ds-sm font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:bg-foreground aria-pressed:text-background" data-oid="5de9b4d495" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:4248f8c90b53|expression:a3adfa550ec6">
                      
                        {current && <Check className="h-4 w-4" data-oid="28226b109b" data-oid-shared="true" />}
                        {current ? "In use" : "Use name"}
                      </button>
                    </li>);

              })}
              </ol>
            </SubPanel>
          }
        </div>
      </div>
    </SectionShell>);

}