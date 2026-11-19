import { FolderOpen, Plus, Save, Sparkles, Undo2 } from "lucide-react";
import { AppSwitcher } from "../AppSwitcher";
import { ConfirmClearButton } from "../ConfirmClearButton";

type Props = {
  onSurprise: () => void;
  onShowLibrary: () => void;
  onNew: () => void;
  onSave: () => void;
  isSaved: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onClear: () => void;
};

const whiteButton =
  "ds-button h-[42px] rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md text-[#3f1a44] hover:border-foreground";
const pill =
  "inline-flex items-center gap-ds-xs rounded-full border border-[#f0dcf2]/40 px-ds-md py-ds-xs font-label text-label text-[#f8f1f8] transition-colors hover:bg-[#f8f1f8]/10 disabled:cursor-not-allowed disabled:opacity-40";

/** Same layout as the Brand Palette header: title, eyebrow and intro on the left; menu and actions on the right. */
export function TypeHeader({ onSurprise, onShowLibrary, onNew, onSave, isSaved, onUndo, canUndo, onClear }: Props) {
  return (
    // The left column is as wide as the title; the menu and buttons sit right beside it.
    <header className="grid grid-cols-1 items-start gap-ds-xl border-b border-[#b77fbe] pb-ds-2xl lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-ds-3xl">
      {/* w-fit + the w-0/min-w-full children: the title sets the column width, eyebrow and intro wrap to it */}
      <div className="flex w-fit max-w-full flex-col gap-ds-md">
        <h1 className="font-display text-[64px] font-semibold leading-[0.9] [text-box:trim-start_cap_alphabetic] not-supports-[text-box:trim-start_cap_alphabetic]:-mt-[0.096em] tracking-[-0.02em] text-[#3f1a44] xl:text-[96px] 2xl:text-[112px]">
          Type <em className="not-italic text-[#f3e1f5]">Palette</em>
        </h1>
        <p className="w-0 min-w-full font-caption text-caption font-medium uppercase tracking-[0.24em] text-[#f0dcf2]">
          A typography playground · Brought to you by{" "}
          <a href="https://mbd.studio" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
            MBD.studio
          </a>
        </p>
        <p className="mt-ds-md w-0 min-w-full text-body text-[#f0dcf2]">
          Pick a display face, pair it with a body face, then color it. Every choice on the left shows up on the right. Add up to three options to compare side by side.
        </p>
      </div>
      <div className="flex flex-col gap-ds-lg">
        <AppSwitcher current="type" compact className="flex flex-wrap items-center gap-ds-xs" />
        <div className="flex flex-wrap items-center gap-ds-sm">
          <button type="button" onClick={onShowLibrary} className={whiteButton}>
            <FolderOpen className="h-4 w-4" />
            Library
          </button>
          <button type="button" onClick={onNew} title="Start a new blank palette. Saved palettes stay in your library." className={whiteButton}>
            <Plus className="h-4 w-4" />
            New palette
          </button>
          <button type="button" onClick={onSurprise} title="Remix the option you're editing. Locked pieces stay." className="ds-button h-[42px] rounded-lg bg-[#3f1a44] px-ds-lg text-[#f8f1f8] hover:bg-[#2a0f2e]">
            <Sparkles className="h-4 w-4" />
            Surprise Me
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm">
          <button type="button" onClick={onSave} className={pill}>
            <Save className="h-4 w-4" />
            {isSaved ? "Update" : "Save palette"}
          </button>
          <button type="button" onClick={onUndo} disabled={!canUndo} className={pill}>
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
          <ConfirmClearButton
            onConfirm={onClear}
            title="Start over from scratch?"
            message="This clears every option: fonts, sizes, colors and the preview copy. Saved palettes in your library stay safe, and Undo can bring this one back." />
        </div>
      </div>
    </header>
  );
}
