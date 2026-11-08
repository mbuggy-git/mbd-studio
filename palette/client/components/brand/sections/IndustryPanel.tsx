import { Dices } from "lucide-react";
import { SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { INDUSTRY_IDEAS } from "../../../lib/brand/generate";
import { pickR } from "../../../lib/brand/random";
import { applyIndustry } from "../../../lib/brand/state";

/** "What kind of business is it?" — first question of step 01, before the personality words. */
export function IndustryPanel({ brand, set, commit }: SectionProps) {
  return (
    <SubPanel title="What kind of business is it?" hint="A type of business, product or industry.">
      <div className="flex flex-col gap-ds-md">
        <form className="flex flex-wrap gap-ds-sm" onSubmit={(e) => e.preventDefault()}>
          <input
            value={brand.industry}
            onChange={(e) => set((s) => applyIndustry(s, e.target.value))}
            placeholder="e.g. specialty coffee company"
            aria-label="Business, product or industry"
            className="ds-input min-w-[260px] flex-1 rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-body" />
          <button type="button" className={softButton} onClick={() => commit((s) => applyIndustry(s, pickR(Math.random, INDUSTRY_IDEAS.filter((x) => x !== s.industry))))}>
            <Dices className="h-4 w-4" />
            Surprise industry
          </button>
        </form>
        <ul className="flex flex-wrap gap-ds-xs" aria-label="Example industries">
          {INDUSTRY_IDEAS.slice(0, 8).map((idea) => (
            <li key={idea}>
              <button
                type="button"
                aria-pressed={brand.industry === idea}
                onClick={() => commit((s) => applyIndustry(s, idea))}
                className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md py-ds-xs font-caption text-caption text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">
                {idea}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </SubPanel>
  );
}
