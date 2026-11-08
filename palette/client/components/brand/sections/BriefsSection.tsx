import { TextCard } from "../ui";
import { SectionShell, SubPanel } from "../ui";
import type { SectionProps } from "./types";
import { DELIVERABLES, STAGES } from "../../../lib/brand/artVocab";
import { composeDNA, composeFullBrief, composeMiniPrompt, deliverableInfo } from "../../../lib/brand/prompts";
import { newSeed } from "../../../lib/brand/random";
import type { BrandState, LiveText } from "../../../lib/brand/types";

type LiveKey = "dna" | "fullBrief" | "miniPrompt";

export function BriefsSection({ brand, set, commit }: SectionProps) {
  const compose: Record<LiveKey, (s: BrandState, seed: number) => string> = { dna: composeDNA, fullBrief: composeFullBrief, miniPrompt: composeMiniPrompt };
  const valueOf = (key: LiveKey) => brand[key].override ?? compose[key](brand, brand[key].seed);
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

  return (
    <SectionShell
      index="08 · Creative briefs & prompts"
      title="Brief the work"
      blurb="Say what you're making and how finished it should be. Three outputs update live from your brand — changing the deliverable never changes the identity."
    >
      <SubPanel title="What are you creating?" hint="Pick a starting point, then describe it in your own words if you like.">
        <div className="flex flex-col gap-ds-md" data-oid="ee56ad5d25">
          <ul className="flex flex-wrap gap-ds-xs" aria-label="Quick deliverables" data-oid="60bab657a0">
            {DELIVERABLES.map((x) => (
              <li key={x.id} data-oid="506166794e" data-oid-shared="true" data-oid-instance-targetable="true">
                <button
                  type="button"
                  aria-pressed={brand.deliverable === x.id}
                  onClick={() => set((s) => ({ ...s, deliverable: x.id }))}
                  className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md py-ds-xs font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition-colors hover:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" data-oid="e5b7e62741" data-oid-shared="true" data-oid-instance-targetable="true"
                >
                  {x.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="ds-field flex flex-col gap-ds-xs" data-oid="0d989326f9">
            <label htmlFor="custom-request" className="ds-field-label font-caption text-caption text-[#5f5f7a]" data-oid="5f950d405e">Describe it (optional)</label>
            <input
              id="custom-request"
              value={brand.customRequest}
              onChange={(e) => set((s) => ({ ...s, customRequest: e.target.value }))}
              placeholder="A promotional poster introducing our new iced coffee."
              className="ds-input rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" data-oid="dd9c39aed1"
            />
          </div>
          <p className="font-caption text-caption text-[#5f5f7a]" data-oid="8de1dc5f20" data-oid-text-editable="false" data-oid-text-source="text|expression:079b305931e8|text|expression:afce2a023466|text">Request: “{d.request}” · treated as {d.kind === "photo" || d.kind === "portrait" ? "photography — typography details are left out of the mini prompt" : d.kind === "logo" ? "logo work — photography details are left out of the mini prompt" : "a designed layout"}.</p>
        </div>
      </SubPanel>

      <div className="ds-radio-group grid grid-cols-1 gap-ds-sm md:grid-cols-3" role="radiogroup" aria-label="Design stage" data-oid="0503588cf7">
        {STAGES.map((st) => (
          <label key={st.id} data-checked={brand.stage === st.id} className="ds-radio flex cursor-pointer flex-col gap-ds-xs rounded-xl border border-border bg-[#d9c9f2] p-ds-md transition-colors hover:border-foreground data-[checked=true]:border-foreground data-[checked=true]:bg-foreground" data-oid="27e946416f" data-oid-shared="true" data-oid-instance-targetable="true">
            <span className="flex items-center gap-ds-sm" data-oid="de860d80af" data-oid-shared="true" data-oid-instance-targetable="true">
              <input type="radio" name="stage" value={st.id} checked={brand.stage === st.id} onChange={() => set((s) => ({ ...s, stage: st.id }))} className="accent-[var(--primary)]" data-oid="d258331f48" data-oid-shared="true" data-oid-instance-targetable="true" />
              <span className={brand.stage === st.id ? "font-heading text-heading text-background" : "font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]"} data-oid="734eb34ab4" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-classname-dynamic="true">{st.label}</span>
            </span>
            <span className={brand.stage === st.id ? "font-caption text-caption text-background/80" : "font-caption text-caption text-[#5f5f7a]"} data-oid="f5c1883840" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-classname-dynamic="true">{st.blurb}</span>
          </label>
        ))}
      </div>

      <TextCard title="A · Brand DNA" {...handlers("dna")} rows={6} hint="Live — rewrites itself as colors, type, words and logo change." />
      <TextCard title="B · Full creative brief" {...handlers("fullBrief")} rows={18} mono />
      <TextCard title="C · Mini asset prompt" {...handlers("miniPrompt")} rows={6} hint="A focused prompt that only carries the brand details relevant to this asset." />
    </SectionShell>
  );
}
