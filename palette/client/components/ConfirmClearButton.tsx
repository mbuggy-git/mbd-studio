import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

type Props = {
  onConfirm: () => void;
  title: string;
  message: string;
  disabled?: boolean;
};

/** "Clear all" pill that asks for confirmation in a small popover before wiping everything. */
export function ConfirmClearButton({ onConfirm, title, message, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" data-oid="d55a68045a" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="element:button|expression:4136e6059980">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-ds-xs rounded-full border border-[#cfcfe6]/40 px-ds-md py-ds-xs font-label text-label text-[#f3eefa] transition-colors hover:bg-[#f3eefa]/10 aria-expanded:bg-[#f3eefa]/10 disabled:cursor-not-allowed disabled:opacity-40" data-oid="4a3a848a16" data-oid-callsite-deletable="true" data-oid-callsite-editable="true"
      >
        <Eraser className="h-4 w-4" data-oid="0c2a43d70e" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />
        Clear all
      </button>
      {open && (
        <div role="alertdialog" aria-label={title} className="absolute left-0 top-full z-50 mt-ds-sm flex w-[300px] flex-col gap-ds-sm rounded-xl border border-[#e0d4f1] bg-[#f4eefb] p-ds-md shadow-[0_18px_40px_-12px_rgba(20,10,40,0.5)]" data-oid="7d7c72bd1f" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          <p className="font-label text-label font-semibold text-[#2a1d38]" data-oid="66f2d76792" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{title}</p>
          <p className="font-caption text-caption leading-relaxed text-[#5f5f7a]" data-oid="55ba762921" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{message}</p>
          <div className="flex justify-end gap-ds-xs pt-ds-xs" data-oid="a0779c83f3" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#d4c4ea] px-ds-md py-ds-xs font-label text-label text-[#2a1d38] hover:border-[#2a1d38]" data-oid="4ca941c621" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              className="rounded-lg bg-[#2a1d38] px-ds-md py-ds-xs font-label text-label text-[#f4eefb] hover:bg-[#3b2b4d]" data-oid="a3f2b52b05" data-oid-callsite-deletable="true" data-oid-callsite-editable="true"
            >
              Yes, clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
