import { Plus, Sparkles } from "lucide-react";

type Props = {
  onSurprise: () => void;
  onAdd: () => void;
  canAdd: boolean;
};

export function TypeHeader({ onSurprise, onAdd, canAdd }: Props) {
  return (
    <header className="grid grid-cols-1 items-end gap-ds-xl border-b border-[#b77fbe] pb-ds-2xl lg:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col gap-ds-md">
        <p className="font-caption text-caption font-medium uppercase tracking-[0.24em] text-[#f0dcf2]">
          A typography playground for graphic designers · Brought to you by{" "}
          <a href="https://mbd.studio" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
            MBD.studio
          </a>
        </p>
        <h1 className="font-display text-[64px] font-semibold leading-[0.9] tracking-[-0.02em] text-[#3f1a44] xl:text-[112px]">
          Type <em className="not-italic text-[#f3e1f5]">Palette</em>
        </h1>
      </div>
      <div className="flex flex-col gap-ds-lg">
        <p className="w-full text-body text-[#ffffff]" style={{ color: "#ffffff" }}>{"Pick a display face, pair it with a supporting face, then color it. Every choice on the left shows up on the right — add up to three options to compare side by side."}

        </p>
        <div className="flex flex-wrap items-center gap-ds-sm">
          <button type="button" onClick={onAdd} disabled={!canAdd} className="ds-button h-[42px] rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md text-[#3f1a44] hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" />
            Add option
          </button>
          <button type="button" onClick={onSurprise} title="Remix the option you're editing — locked pieces stay" className="ds-button h-[42px] rounded-lg bg-[#3f1a44] px-ds-lg text-[#f8f1f8] hover:bg-[#2a0f2e]">
            <Sparkles className="h-4 w-4" />
            Surprise Me
          </button>
        </div>
      </div>
    </header>);

}