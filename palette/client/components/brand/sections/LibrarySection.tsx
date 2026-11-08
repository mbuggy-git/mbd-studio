import { useState } from "react";
import { Copy, FolderOpen, HardDrive, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { SectionShell, softButton } from "../ui";
import type { BrandState, SavedBrand } from "../../../lib/brand/types";

type Props = {
  brand: BrandState;
  library: SavedBrand[];
  savedId: string | null;
  onSave: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
};

export function LibrarySection({ brand, library, savedId, onSave, onOpen, onDuplicate, onRename, onDelete, onNew }: Props) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <SectionShell
      index="08 · Saved brands"
      title="Your brand library"
      blurb="Save fictional brands to return to for future design work and demos. Everything — words, colors, type, imagery and prompts — is stored."
      actions={
        <>
          <button type="button" className="ds-button ds-button-primary rounded-lg" onClick={onSave} data-oid="94fba66d06" data-oid-text-editable="false">
            <Save className="h-4 w-4" data-oid="4c13b4b3e4" />
            {savedId ? "Update" : "Save current brand"}
          </button>
          <button type="button" className={softButton} onClick={onNew} data-oid="75dd700279" data-oid-classname-dynamic="true">
            <Plus className="h-4 w-4" data-oid="1cdf26f3d8" />
            New brand
          </button>
        </>
      }
    >
      <div className="flex items-start gap-ds-md rounded-xl border border-dashed border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] p-ds-md" data-oid="75f719274c">
        <HardDrive className="mt-1 h-5 w-5 shrink-0 text-[#5f5f7a]" data-oid="aae6ec3184" />
        <p className="font-label text-label text-[#5f5f7a]" data-oid="3bf145d7b8">
          <strong className="font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="f504ce2fe8">Stored locally in this browser.</strong> Brands are not synced to the cloud or shared across devices, and clearing browser data removes them. Your work-in-progress is also auto-saved locally as a draft.
        </p>
      </div>

      {library.length === 0 ? (
        <div className="flex flex-col items-center gap-ds-sm rounded-xl bg-[#d9c9f2] px-ds-xl py-ds-3xl text-center" data-oid="85f80728e6">
          <h3 className="font-display text-[32px] font-semibold leading-none text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="1a56241acf">No saved brands yet</h3>
          <p className="max-w-md text-body text-[#5f5f7a]" data-oid="759cb6d4c6" data-oid-text-editable="false" data-oid-text-source="text|expression:dc2f25eab104|text">Save “{brand.name || "this brand"}” to start your library, then try Surprise Me to invent another.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-ds-md xl:grid-cols-2" data-oid="c420e9b97a">
          {library.map((b, i) => {
            const isCurrent = b.id === brand.id;
            return (
              <li key={b.id} data-current={isCurrent} data-index={i} className="flex flex-col overflow-hidden rounded-xl border border-border bg-[#d9c9f2] data-[current=true]:border-foreground" data-oid="60aac52b49" data-oid-shared="true" data-oid-instance-targetable="true">
                <div className="flex h-16" aria-hidden="true" data-oid="6efc83ae47" data-oid-shared="true" data-oid-instance-targetable="true">
                  {b.state.palette.map((sw, k) => <span key={k} className="flex-1" style={{ background: sw.hex }} data-oid="8142a19340" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="background" />)}
                </div>
                <div className="flex flex-col gap-ds-sm p-ds-md" data-oid="ac5c975110" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:1d5f91c168cf|element:p|expression:14084d3599b0">
                  {renaming === b.id ? (
                    <form
                      className="flex gap-ds-xs"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim()) onRename(b.id, draft.trim());
                        setRenaming(null);
                      }} data-oid="3efeb282f7" data-oid-shared="true"
                    >
                      <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="New name" className="ds-input flex-1 rounded-md bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="2276d382ee" data-oid-shared="true" />
                      <button type="submit" className={softButton} data-oid="dd8c51d997" data-oid-shared="true" data-oid-classname-dynamic="true">Save</button>
                      <button type="button" className={softButton} onClick={() => setRenaming(null)} data-oid="d89aa0f189" data-oid-shared="true" data-oid-classname-dynamic="true">Cancel</button>
                    </form>
                  ) : (
                    <h3 className="font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="87f011d19c" data-oid-shared="true">{b.name}</h3>
                  )}
                  <p className="font-caption text-caption text-[#5f5f7a]" data-oid="b57114da41" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:64e411490e7f|text|expression:fe5e55f1b361|expression:38cd97c8b08d">
                    {b.state.industry || "No industry"} · saved {new Date(b.savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}{isCurrent ? " · open now" : ""}
                  </p>
                  {confirming === b.id ? (
                    <div className="flex flex-wrap items-center gap-ds-sm rounded-lg bg-[color-mix(in_srgb,var(--destructive)_12%,var(--background))] p-ds-sm" role="alertdialog" aria-label={`Confirm delete ${b.name}`} data-oid="1ac667766f" data-oid-shared="true">
                      <p className="flex-1 font-label text-label text-destructive" data-oid="fc332af8d1" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="text|expression:8e5a40619b22|text">Delete “{b.name}” permanently?</p>
                      <button type="button" className="ds-button rounded-lg bg-destructive text-destructive-foreground" onClick={() => { onDelete(b.id); setConfirming(null); }} data-oid="1f14e8b391" data-oid-shared="true">Delete</button>
                      <button type="button" className={softButton} onClick={() => setConfirming(null)} data-oid="04cdcb7fb9" data-oid-shared="true" data-oid-classname-dynamic="true">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-ds-xs" data-oid="3450bc55b7" data-oid-shared="true">
                      <button type="button" className={softButton} onClick={() => onOpen(b.id)} data-oid="a543f0002b" data-oid-shared="true" data-oid-classname-dynamic="true">
                        <FolderOpen className="h-4 w-4" data-oid="fb652539c7" data-oid-shared="true" />
                        Open
                      </button>
                      <button type="button" className={softButton} onClick={() => onDuplicate(b.id)} data-oid="cc65c7a474" data-oid-shared="true" data-oid-classname-dynamic="true">
                        <Copy className="h-4 w-4" data-oid="63fc71c56b" data-oid-shared="true" />
                        Duplicate
                      </button>
                      <button type="button" className={softButton} onClick={() => { setRenaming(b.id); setDraft(b.name); }} data-oid="f7efc758f1" data-oid-shared="true" data-oid-classname-dynamic="true">
                        <Pencil className="h-4 w-4" data-oid="7d2acb5d37" data-oid-shared="true" />
                        Rename
                      </button>
                      <button type="button" className={softButton} onClick={() => setConfirming(b.id)} data-oid="e5009e0e7c" data-oid-shared="true" data-oid-classname-dynamic="true">
                        <Trash2 className="h-4 w-4" data-oid="fb730f49a2" data-oid-shared="true" />
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
    </SectionShell>
  );
}
