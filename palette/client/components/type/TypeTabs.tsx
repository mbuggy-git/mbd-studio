import type { KeyboardEvent } from "react";
import type { TypeTab } from "../../lib/type/state";

const ORDER: TypeTab[] = ["display", "body", "color"];

export function TypeTabs({ active, onChange }: { active: TypeTab; onChange: (t: TypeTab) => void }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = ORDER.indexOf(active);
    const next = ORDER[(i + (e.key === "ArrowRight" ? 1 : -1) + ORDER.length) % ORDER.length];
    onChange(next);
    document.getElementById(`type-tab-${next}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Type Palette steps" onKeyDown={onKey} className="grid grid-cols-3 gap-ds-xs rounded-xl border border-[#d2acd7] bg-[#ecd9ee] p-ds-xs">
      <button
        type="button"
        role="tab"
        id="type-tab-display"
        aria-selected={active === "display"}
        aria-controls="type-step-panel"
        tabIndex={active === "display" ? 0 : -1}
        onClick={() => onChange("display")}
        className="flex flex-col items-start gap-1 rounded-lg bg-white px-ds-md py-ds-sm text-left text-[#3f1a44] shadow-[0_1px_2px_rgba(63,26,68,0.12)] transition-colors hover:bg-[#faf3fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:bg-foreground aria-selected:text-background aria-selected:hover:bg-foreground"
      >
        <span className="font-caption text-caption opacity-70">01</span>
        <span className="font-label text-[16px] font-medium">Display</span>
      </button>
      <button
        type="button"
        role="tab"
        id="type-tab-body"
        aria-selected={active === "body"}
        aria-controls="type-step-panel"
        tabIndex={active === "body" ? 0 : -1}
        onClick={() => onChange("body")}
        className="flex flex-col items-start gap-1 rounded-lg bg-white px-ds-md py-ds-sm text-left text-[#3f1a44] shadow-[0_1px_2px_rgba(63,26,68,0.12)] transition-colors hover:bg-[#faf3fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:bg-foreground aria-selected:text-background aria-selected:hover:bg-foreground"
      >
        <span className="font-caption text-caption opacity-70">02</span>
        <span className="font-label text-[16px] font-medium">Supporting</span>
      </button>
      <button
        type="button"
        role="tab"
        id="type-tab-color"
        aria-selected={active === "color"}
        aria-controls="type-step-panel"
        tabIndex={active === "color" ? 0 : -1}
        onClick={() => onChange("color")}
        className="flex flex-col items-start gap-1 rounded-lg bg-white px-ds-md py-ds-sm text-left text-[#3f1a44] shadow-[0_1px_2px_rgba(63,26,68,0.12)] transition-colors hover:bg-[#faf3fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:bg-foreground aria-selected:text-background aria-selected:hover:bg-foreground"
      >
        <span className="font-caption text-caption opacity-70">03</span>
        <span className="font-label text-[16px] font-medium">Color</span>
      </button>
    </div>
  );
}
