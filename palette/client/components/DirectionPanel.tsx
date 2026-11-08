import { useState } from "react";
import { Check, Copy, Eraser, RefreshCw, Sparkles, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, type CategoryId } from "../lib/vocabulary";

type Props = {
  brief: string;
  onBriefChange: (value: string) => void;
  selected: string[];
  onRemove: (name: string) => void;
  onJumpCategory: (id: CategoryId) => void;
  onClearSelection: () => void;
  output: string;
  onOutputChange: (value: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onClearOutput: () => void;
};

export function DirectionPanel({
  brief,
  onBriefChange,
  selected,
  onRemove,
  onJumpCategory,
  onClearSelection,
  output,
  onOutputChange,
  onGenerate,
  onRegenerate,
  onClearOutput
}: Props) {
  const [copied, setCopied] = useState(false);
  const canGenerate = brief.trim().length > 0 || selected.length > 0;
  const words = output.trim() ? output.trim().split(/\s+/).length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const area = document.createElement("textarea");
      area.value = output;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <aside className="flex flex-col gap-ds-lg rounded-xl border border-border bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))] p-ds-xl shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]" data-oid="ea377abf2b" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" style={{ backgroundColor: "#ccb7ed" }}>
      <div className="flex flex-col gap-ds-xs" data-oid="b1fb65f371">
        <p className="font-caption text-caption font-medium uppercase tracking-[0.24em] text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="bace97a496" style={{ color: "#5f5f7a" }}>The Brief Builder</p>
        <h2 className="font-display text-[40px] font-semibold leading-none tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="6c04b67a25">Your direction</h2>
      </div>

      <div className="ds-field" data-oid="5976e329bd">
        <label htmlFor="brief" className="ds-field-label" data-oid="36a4df3481" style={{ color: "#5f5f7a" }}>What are you creating?</label>
        <textarea
          id="brief"
          rows={2}
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          placeholder="A futuristic sneaker advertisement"
          className="ds-input resize-none bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="a8a72444be" />
        
      </div>

      <div className="flex flex-col gap-ds-sm" data-oid="e302dd7e63" data-oid-text-editable="false" data-oid-text-source="element:div|expression:84a9c8490b16">
        <div className="flex items-center justify-between" data-oid="6738957ab9" data-oid-text-editable="false" data-oid-text-source="element:h3|expression:5d3f87f2e0bf">
          <h3 className="font-label text-label font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="3e09cecdb4" data-oid-text-editable="false" data-oid-text-source="text|expression:27bf6ad50764" style={{ color: "#5f5f7a" }}>Selected words · {selected.length}</h3>
          {selected.length > 0 &&
          <button type="button" onClick={onClearSelection} className="font-caption text-caption font-medium text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))] underline-offset-4 hover:text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:underline" data-oid="d32b99923e">
              Deselect all
            </button>
          }
        </div>
        {selected.length === 0 ?
        <p className="rounded-lg border border-dashed border-border bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] px-ds-md py-ds-lg font-label text-label font-normal text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="ad31a868c5">
            Nothing yet. Pick words from any category, or hit Remix All for a cross-category combination.
          </p> :

        <div className="flex flex-col gap-ds-sm rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] p-ds-md" data-oid="73406dec58">
            {CATEGORIES.map((category) => {
            const picks = category.terms.filter((t) => selected.includes(t.name));
            if (picks.length === 0) return null;
            return (
              <div key={category.id} className="flex items-start gap-ds-md" data-oid="0d0f8f6870" data-oid-shared="true">
                  <button type="button" onClick={() => onJumpCategory(category.id)} title={`Open ${category.label}`} className="w-24 shrink-0 pt-1.5 text-left font-caption text-caption font-medium uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))] underline-offset-4 hover:text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:underline" data-oid="9b07a53a0e" data-oid-shared="true">{category.short ?? category.label}</button>
                  <ul className="flex flex-wrap gap-ds-xs" data-oid="bd2c72f5f7" data-oid-shared="true">
                    {picks.map((term) =>
                  <li key={term.name} data-oid="e4c0bf0018" data-oid-shared="true">
                        <button
                      type="button"
                      onClick={() => onRemove(term.name)}
                      aria-label={`Remove ${term.name}`}
                      className="group inline-flex items-center gap-ds-xs rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] py-0.5 pl-0.5 pr-ds-sm font-caption text-caption font-medium text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground" data-oid="a7df2bdc83" data-oid-shared="true" data-oid-text-editable="false">
                      
                          <span className={cn("h-4 w-4 rounded-full", category.dotClass)} style={term.swatch} data-oid="91b1bc0731" data-oid-shared="true" data-oid-style-dynamic="*" data-oid-classname-dynamic="true" />
                          {term.name}
                          <X className="h-3 w-3 text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))] group-hover:text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="6558087578" data-oid-shared="true" />
                        </button>
                      </li>
                  )}
                  </ul>
                </div>);

          })}
          </div>
        }
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="ds-button ds-button-primary h-12 w-full rounded-lg text-body" data-oid="4fc0471290">
        
        <Wand2 className="h-4 w-4" data-oid="05d99a7840" />
        Generate Art Direction
      </button>

      <div className="flex flex-col gap-ds-sm border-t border-border pt-ds-lg" data-oid="0402217a46">
        <div className="flex items-center justify-between" data-oid="27f02c02cf">
          <label htmlFor="output" className="flex items-center gap-ds-xs font-label text-label font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="d143c3aa43" style={{ color: "#5f5f7a" }}>
            <Sparkles className="h-4 w-4 text-primary" data-oid="5319143e10" />
            Image prompt
          </label>
          <span className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="bfafd858c2" data-oid-text-editable="false" data-oid-text-source="expression:efb893611e6f|text" style={{ color: "#5f5f7a" }}>{words} words · editable</span>
        </div>
        <textarea
          id="output"
          rows={9}
          value={output}
          onChange={(e) => onOutputChange(e.target.value)}
          placeholder="Your art direction will appear here. Describe what you are making, choose a few words, then generate."
          className="ds-input resize-y bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] p-ds-md font-display text-[22px] leading-[1.35] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="ece092bd77" />
        
        <div className="grid grid-cols-3 gap-ds-sm" data-oid="b4af48cdfd">
          <button type="button" onClick={copy} disabled={!output} className="ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]" data-oid="dbb8673345" data-oid-text-editable="false" data-oid-text-source="expression:c9d6ce65cb4f|expression:e562b1923d4d">
            {copied ? <Check className="h-4 w-4 text-success" data-oid="6008978096" /> : <Copy className="h-4 w-4" data-oid="7f2fcace61" />}
            {copied ? "Copied" : "Copy Prompt"}
          </button>
          <button type="button" onClick={onRegenerate} disabled={!canGenerate} className="ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]" data-oid="4bc5b112f9">
            <RefreshCw className="h-4 w-4" data-oid="21ad86d5c5" />
            Regenerate
          </button>
          <button type="button" onClick={onClearOutput} disabled={!output} className="ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]" data-oid="f92b649dfe">
            <Eraser className="h-4 w-4" data-oid="bea93cec2b" />
            Clear
          </button>
        </div>
      </div>
    </aside>);

}