import { useEffect, useRef, useState } from "react";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { generateNames } from "../../../lib/brand/generate";
import { requestNames } from "../../../lib/brand/ai";
import { newSeed } from "../../../lib/brand/random";
import { surpriseTraits } from "../../../lib/brand/state";

export function ConceptSection({ brand, set, commit }: SectionProps) {
  const [mode, setMode] = useState<"own" | "generate">("generate");
  const [busy, setBusy] = useState(false);
  // Which industry names were last generated for — drives the Generate vs Regenerate label.
  const [generatedFor, setGeneratedFor] = useState<string | null>(null);
  const hasGenerated = generatedFor !== null && generatedFor === brand.industry.trim() && brand.nameSuggestions.length > 0;

  const regenerate = async (pickFirst = true) => {
    setBusy(true);
    setMode("generate");
    const { names } = await requestNames({ industry: brand.industry, traits: brand.traits, exclude: brand.nameSuggestions }, newSeed());
    commit((s) => ({ ...s, nameSuggestions: names, name: pickFirst && !s.nameLocked ? names[0] ?? s.name : s.name }));
    setGeneratedFor(brand.industry.trim());
    setBusy(false);
  };

  // Arriving with a business and personality already set: show five ideas straight away,
  // without choosing one — the name stays the user's call.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    if (brand.industry.trim() && brand.traits.length > 0 && brand.nameSuggestions.length === 0 && !brand.name.trim()) {
      autoRan.current = true;
      regenerate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      index="02 · Naming"
      title="Name the brand"
      blurb="Write your own name, or generate options from the business and personality you chose.">
      
      {!brand.industry.trim() &&
      <p className="rounded-lg border border-dashed border-border p-ds-md font-label text-label text-[#5f5f7a]">Say what kind of business it is in step 01 first — name ideas are built from it and from your personality words.</p>
      }

      <div className="ds-tabs flex flex-col gap-ds-md" data-oid="617f5d5308">
        <div role="tabpanel" className="ds-tab-panel" data-oid="6bf657577f">
          {mode === "own" ?
          <SubPanel title="Brand name" hint="Write your own, or pick one of the generated names below." actions={namingSwitch}>
              <div className="mb-ds-md flex justify-end" data-oid="dff4097275">
                <LockButton locked={brand.nameLocked} onToggle={() => set((s) => ({ ...s, nameLocked: !s.nameLocked }))} label="brand name" />
              </div>
              <input
              value={brand.name}
              onChange={(e) => set((s) => ({ ...s, name: e.target.value, nameLocked: false }))}
              placeholder="Your brand name"
              aria-label="Brand name"
              className="ds-input w-full rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] py-ds-md font-display text-[32px] font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="bc0d766ac5" />
            
            </SubPanel> :

          <SubPanel
            title="Five name ideas"
            hint="Generate name ideas or add your own."
            actions={namingSwitch}>
              <div className="mb-ds-md flex flex-wrap items-center gap-ds-sm" data-oid="d15c49dbc3">
                  <button type="button" className={softButton} onClick={() => regenerate()} disabled={busy || !brand.industry.trim()} title={!brand.industry.trim() ? "Say what kind of business it is in step 01 first" : undefined} data-oid="fce2c7ec8e" data-oid-classname-dynamic="true" data-oid-text-editable="false">
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
              <li className="rounded-lg border border-dashed border-border p-ds-md font-label text-label text-[#5f5f7a]" data-oid="3cc95aeeaa">Press Generate names to see five ideas here.</li>
              }
                {brand.nameSuggestions.length > 0 && brand.traits.length === 0 &&
              <li className="font-caption text-caption text-[#5f5f7a]">These use a neutral voice. Pick personality words in step 01, then regenerate for names in that voice.</li>
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
                      disabled={false}
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