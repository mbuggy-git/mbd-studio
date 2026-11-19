import { useState } from "react";
import { Copy, FolderOpen, HardDrive, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { softButton } from "../brand/ui";
import type { SavedType } from "../../lib/type/library";

type Props = {
  library: SavedType[];
  savedId: string | null;
  onSave: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
};

/** Saved Type Palettes, modelled on the Brand Palette library. Stored in this browser only. */
export function TypeLibrary({ library, savedId, onSave, onOpen, onDuplicate, onRename, onDelete, onNew, onClose }: Props) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <section aria-label="Saved palettes" className="rounded-xl border border-[#d2acd7] bg-[#ecd9ee] p-ds-xl">
      <div className="mb-ds-xl flex flex-wrap items-start justify-between gap-ds-lg">
        <div className="flex max-w-2xl flex-col gap-ds-xs">
          <span className="font-caption text-caption font-medium uppercase tracking-[0.2em] text-[#6e4a73]">Saved palettes</span>
          <h2 className="font-display text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#3f1a44] xl:text-[56px]">Your type library</h2>
          <p className="max-w-xl font-label text-label text-[#6e4a73]">
            Save a set of options to come back to. Fonts, sizes, colors and preview copy are all stored.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm">
          <button type="button" className="ds-button rounded-lg bg-[#3f1a44] text-[#f8f1f8] hover:bg-[#2a0f2e]" onClick={onSave}>
            <Save className="h-4 w-4" />
            {savedId ? "Update" : "Save current palette"}
          </button>
          <button type="button" className={softButton} onClick={onNew}>
            <Plus className="h-4 w-4" />
            New palette
          </button>
          <button type="button" className={softButton} onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-ds-lg">
        <div className="flex items-start gap-ds-md rounded-xl border border-dashed border-[#c79bcd] p-ds-md">
          <HardDrive className="mt-1 h-5 w-5 shrink-0 text-[#6e4a73]" />
          <p className="font-label text-label text-[#6e4a73]">
            <strong className="font-semibold text-[#3f1a44]">Stored locally in this browser.</strong> Palettes are not synced to the cloud or shared across devices, and clearing browser data removes them. Your work-in-progress is also auto-saved locally.
          </p>
        </div>

        {library.length === 0 ? (
          <div className="flex flex-col items-center gap-ds-sm rounded-xl bg-[#f5eaf6] px-ds-xl py-ds-3xl text-center">
            <h3 className="font-display text-[32px] font-semibold leading-none text-[#3f1a44]">No saved palettes yet</h3>
            <p className="max-w-md text-body text-[#6e4a73]">Save the palette you're working on to start your library, then try Surprise Me for another.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-ds-md xl:grid-cols-2">
            {library.map((s) => {
              const isCurrent = s.id === savedId;
              const first = s.state.options[0];
              const count = s.state.options.length;
              return (
                <li key={s.id} data-current={isCurrent} className="flex flex-col overflow-hidden rounded-xl border border-[#dcbfe0] bg-[#f5eaf6] data-[current=true]:border-foreground">
                  <div className="flex h-16" aria-hidden="true">
                    {first.palette.map((sw, k) => <span key={k} className="flex-1" style={{ background: sw.hex }} />)}
                  </div>
                  <div className="flex flex-col gap-ds-sm p-ds-md">
                    {renaming === s.id ? (
                      <form
                        className="flex gap-ds-xs"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (draft.trim()) onRename(s.id, draft.trim());
                          setRenaming(null);
                        }}
                      >
                        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="New name" className="ds-input flex-1 rounded-md bg-white" />
                        <button type="submit" className={softButton}>Save</button>
                        <button type="button" className={softButton} onClick={() => setRenaming(null)}>Cancel</button>
                      </form>
                    ) : (
                      <h3 className="font-heading text-heading text-[#3f1a44]">{s.name}</h3>
                    )}
                    <p className="font-caption text-caption text-[#6e4a73]">
                      {count} {count === 1 ? "option" : "options"} · saved {new Date(s.savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}{isCurrent ? " · open now" : ""}
                    </p>
                    {confirming === s.id ? (
                      <div className="flex flex-wrap items-center gap-ds-sm rounded-lg bg-[color-mix(in_srgb,var(--destructive)_12%,var(--background))] p-ds-sm" role="alertdialog" aria-label={`Confirm delete ${s.name}`}>
                        <p className="flex-1 font-label text-label text-destructive">Delete “{s.name}” permanently?</p>
                        <button type="button" className="ds-button rounded-lg bg-destructive text-destructive-foreground" onClick={() => { onDelete(s.id); setConfirming(null); }}>Delete</button>
                        <button type="button" className={softButton} onClick={() => setConfirming(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-ds-xs">
                        <button type="button" className={softButton} onClick={() => onOpen(s.id)}>
                          <FolderOpen className="h-4 w-4" />
                          Open
                        </button>
                        <button type="button" className={softButton} onClick={() => onDuplicate(s.id)}>
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button type="button" className={softButton} onClick={() => { setRenaming(s.id); setDraft(s.name); }}>
                          <Pencil className="h-4 w-4" />
                          Rename
                        </button>
                        <button type="button" className={softButton} onClick={() => setConfirming(s.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
