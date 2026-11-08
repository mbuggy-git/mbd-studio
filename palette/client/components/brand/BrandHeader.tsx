import { Cpu, FolderOpen, Save, Sparkles, Undo2 } from "lucide-react";
import type { SavedBrand } from "../../lib/brand/types";
import { ConfirmClearButton } from "../ConfirmClearButton";

type Props = {
  onSurprise: () => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  onSave: () => void;
  isSaved: boolean;
  library?: SavedBrand[];
  onOpen?: (id: string) => void;
  onShowLibrary: () => void;
  aiLabel: string;
};

export function BrandHeader({ onSurprise, onUndo, onClear, canUndo, onSave, isSaved, onShowLibrary, aiLabel }: Props) {
  return (
    <header className="grid grid-cols-1 items-end gap-ds-xl border-b border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] pb-ds-2xl lg:grid-cols-[1.35fr_1fr]" data-oid="7ce93247cd" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      <div className="flex flex-col gap-ds-md" data-oid="a0c606ab66">
        <div className="flex flex-wrap items-center gap-ds-md" data-oid="3676500e7c">
          <p className="font-caption text-caption font-medium uppercase tracking-[0.24em] text-[#cfcfe6]" data-oid="70d7d56161">An interactive brand identity playground · Brought to you by <a href="https://mbd.studio" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#f3eefa]" data-oid="009016a46a">MBD.studio</a></p>
        </div>
        <h1 className="font-display text-[64px] font-semibold leading-[0.9] tracking-[-0.02em] text-[#f3eefa] xl:text-[112px]" data-oid="cfe99e1998" style={{ color: "#432e4b" }}>
          Brand <em className="not-italic text-[#d9cade]" data-oid="a754a3b135">Palette</em>
        </h1>
      </div>
      <div className="flex flex-col gap-ds-lg" data-oid="a67e6a17a2">
        <p className="w-full text-body text-[#cfcfe6]" data-oid="d34ccd0747">{"Start with what the business is and its personality, then name it and style it yourself, or hit \"Surprise Me\". Enter the Prompt Studio, and leave with a prompt ready for any AI design tool."}


        </p>
        <div className="flex flex-wrap items-center gap-ds-sm" data-oid="0e02f8f6bb">
          <button type="button" onClick={onShowLibrary} className="ds-button h-[42px] rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-md text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground" data-oid="632dabd27c">
            <FolderOpen className="h-4 w-4" data-oid="1ace29006d" />
            Library
          </button>
          <button type="button" onClick={onSurprise} title="Invent a new brand direction" className="ds-button ds-button-primary h-[42px] rounded-lg px-ds-lg" data-oid="215e18e7a5">
            <Sparkles className="h-4 w-4" data-oid="77a182ef80" />
            Surprise Me
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm" data-oid="a813e14770">
          <button type="button" onClick={onSave} className="inline-flex items-center gap-ds-xs rounded-full border border-[#cfcfe6]/40 px-ds-md py-ds-xs font-label text-label text-[#f3eefa] transition-colors hover:bg-[#f3eefa]/10" data-oid="4e777d9dd1" data-oid-text-editable="false">
            <Save className="h-4 w-4" data-oid="9a323fd4d3" />
            {isSaved ? "Update" : "Save brand"}
          </button>
          <button type="button" onClick={onUndo} disabled={!canUndo} className="inline-flex items-center gap-ds-xs rounded-full border border-[#cfcfe6]/40 px-ds-md py-ds-xs font-label text-label text-[#f3eefa] transition-colors hover:bg-[#f3eefa]/10 disabled:cursor-not-allowed disabled:opacity-40" data-oid="9d1196d259">
            <Undo2 className="h-4 w-4" data-oid="ef31b7aea1" />
            Undo
          </button>
          <ConfirmClearButton
            onConfirm={onClear}
            title="Start over from scratch?"
            message="This clears every section — concept, personality, color, type, logo, copy, imagery and prompts. Saved brands in your library stay safe, and Undo can bring this one back." />
          <span className="inline-flex items-center gap-ds-xs font-caption text-caption text-[#cfcfe6]" title="No AI service is connected. Names, copy and prompts come from local generators." data-oid="1b36f677a5" data-oid-text-editable="false">
            <Cpu className="h-3.5 w-3.5" data-oid="5acaae971e" />
            {aiLabel}
          </span>
        </div>
      </div>
    </header>);

}