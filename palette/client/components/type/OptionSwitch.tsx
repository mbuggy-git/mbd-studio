import { Plus } from "lucide-react";
import { MAX_OPTIONS, OPTION_LABELS, type TypeOption } from "../../lib/type/state";

type Props = {
  options: TypeOption[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

/** Chooses which option the left-hand controls are editing. */
export function OptionSwitch({ options, activeId, onSelect, onAdd }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-ds-md rounded-xl border border-[#d2acd7] bg-[#ecd9ee] px-ds-lg py-ds-md">
      <div className="flex flex-col gap-1">
        <p className="font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">Now editing</p>
        <p className="font-label text-label text-[#3f1a44]">
          {options.length} of {MAX_OPTIONS} options
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-ds-sm">
        <div role="group" aria-label="Option to edit" className="flex gap-1 rounded-full border border-[#d2acd7] bg-white p-1 shadow-[inset_0_1px_3px_rgba(63,26,68,0.18)]">
          {options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={o.id === activeId}
              onClick={() => onSelect(o.id)}
              className="rounded-full px-ds-lg py-ds-sm font-label text-label font-medium text-[#6e4a73] transition-colors hover:text-[#3f1a44] aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:shadow-[0_2px_6px_rgba(30,10,50,0.35)]"
            >
              Option {OPTION_LABELS[i]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={options.length >= MAX_OPTIONS}
          title={options.length >= MAX_OPTIONS ? "Three options is the maximum" : "Add another combination to compare"}
          className="ds-button rounded-lg border border-border bg-white text-[#3f1a44] hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add option
        </button>
      </div>
    </div>
  );
}
