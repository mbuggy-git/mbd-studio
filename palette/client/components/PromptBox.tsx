import { useState } from "react";
import { Check, Copy, Eraser, RefreshCw, Sparkles } from "lucide-react";

type Props = {
  output: string;
  onOutputChange: (value: string) => void;
  onRegenerate: () => void;
  onClear: () => void;
  canGenerate: boolean;
};

/** The image prompt, in the main column under the board — opened by "Get prompt". */
export function PromptBox({ output, onOutputChange, onRegenerate, onClear, canGenerate }: Props) {
  const [copied, setCopied] = useState(false);
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
    window.setTimeout(() => setCopied(false), 1500);
  };

  const soft = "ds-button rounded-lg border border-border bg-white text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section id="prompt-box" aria-label="Image prompt" className="flex flex-col gap-ds-sm rounded-xl border border-border bg-[#ccb7ed] p-ds-xl shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-ds-xs font-display text-[28px] font-semibold leading-none tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]">
          <Sparkles className="h-5 w-5 text-primary" />
          Image prompt
        </h2>
        <span className="font-caption text-caption text-[#5f5f7a]">{words ? `${words} words` : "—"}</span>
      </div>
      <textarea
        id="output"
        rows={7}
        value={output}
        onChange={(e) => onOutputChange(e.target.value)}
        placeholder="Your art direction will appear here. Choose a few words, say what you're making, then Get prompt."
        className="ds-input w-full resize-y rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] p-ds-md font-display text-[22px] leading-[1.35] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]"
      />
      <div className="flex flex-wrap gap-ds-sm">
        <button type="button" onClick={copy} disabled={!output} className="ds-button ds-button-primary rounded-lg px-ds-lg">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy prompt"}
        </button>
        <button type="button" onClick={onRegenerate} disabled={!canGenerate} className={soft}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </button>
        <button type="button" onClick={onClear} disabled={!output} className={soft}>
          <Eraser className="h-4 w-4" />
          Clear
        </button>
      </div>
    </section>
  );
}
