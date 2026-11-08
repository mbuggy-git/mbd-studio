import type { KeyboardEvent } from "react";
import { Check } from "lucide-react";
import type { SectionId } from "../../lib/brand/types";
import type { SectionMeta } from "../../lib/brand/state";

export const SECTIONS: { id: SectionId; label: string; short: string }[] = [
  // Personality first: the name generator and the copy draw on these words.
  { id: "personality", label: "Business & Personality", short: "Business" },
  { id: "concept", label: "Naming", short: "Name" },
  { id: "color", label: "Color Palette", short: "Color" },
  { id: "type", label: "Typography", short: "Type" },
  { id: "logo", label: "Logo & Graphic Language", short: "Logo" },
  { id: "copy", label: "Taglines & Brand Copy", short: "Copy" },
  { id: "imagery", label: "Imagery & Art Direction", short: "Imagery" },
  // Saved brands are reached from the header's Library button, so they don't need a tab here.
];

type Props = { active: SectionId; onChange: (id: SectionId) => void; meta: Record<SectionId, SectionMeta> };

export function SectionNav({ active, onChange, meta }: Props) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = SECTIONS.findIndex((s) => s.id === active);
    const next = SECTIONS[(i + (e.key === "ArrowRight" ? 1 : -1) + SECTIONS.length) % SECTIONS.length];
    onChange(next.id);
    document.getElementById(`brand-tab-${next.id}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Brand-building sections" onKeyDown={onKey} className="flex gap-ds-xs overflow-x-auto rounded-xl border border-border bg-[#ccb7ed] p-ds-xs" data-oid="01dbc0f012" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          id={`brand-tab-${s.id}`}
          type="button"
          role="tab"
          aria-selected={active === s.id}
          aria-controls="brand-section-panel"
          tabIndex={active === s.id ? 0 : -1}
          title={s.label}
          onClick={() => onChange(s.id)}
          data-done={meta[s.id].done}
          data-incomplete={!meta[s.id].done && active !== s.id}
          className="group relative flex min-w-[96px] flex-1 flex-col items-start gap-1 overflow-hidden rounded-lg bg-[#e8def7] px-ds-sm py-ds-sm text-left text-[#5f5f7a] shadow-[0_1px_2px_rgba(60,40,100,0.12)] transition-colors hover:bg-[#f3eefa] data-[incomplete=true]:bg-white data-[incomplete=true]:hover:bg-[#faf7fe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:bg-foreground aria-selected:text-background aria-selected:hover:bg-foreground" data-oid="a0b375fb3d" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:span|element:span|element:span|expression:be68b9495c62"
        >
          <span className="flex w-full items-center justify-between gap-ds-xs font-caption text-caption opacity-80" data-oid="0ac5a19e33" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:71f1ac52e481|expression:aab133ed370b">
            {String(i + 1).padStart(2, "0")}
            {meta[s.id].done && active !== s.id && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#432e4b] text-white" aria-label="Step complete" data-oid="a6db80c794" data-oid-shared="true">
                <Check className="h-3 w-3" strokeWidth={3} data-oid="6f1f1dc472" data-oid-shared="true" />
              </span>
            )}
          </span>
          <span data-done={active !== s.id} className="whitespace-nowrap font-body text-[15px] font-semibold leading-tight data-[done=true]:text-[#432e4b]" data-oid="7b4ec1b569" data-oid-shared="true" data-oid-instance-targetable="true">{s.short}</span>
          <span className="w-full truncate font-caption text-caption opacity-75" data-oid="251c382442" data-oid-shared="true" data-oid-instance-targetable="true">{meta[s.id].done ? "Done" : meta[s.id].count}</span>
          {meta[s.id].done && active !== s.id && <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[#432e4b]" data-oid="6efd144c9b" data-oid-shared="true" />}
        </button>
      ))}
    </div>
  );
}
