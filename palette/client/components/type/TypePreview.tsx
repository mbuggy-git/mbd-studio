import { useState, type CSSProperties } from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Download, Eraser, Pencil, Plus, X } from "lucide-react";
import { exportOptionsPng } from "../../lib/type/exportPng";
import { previewStyle, resolveFont } from "../../lib/brand/fonts";
import { PALETTE_ROLES } from "../../lib/brand/color";
import { darkColors, displaySpacingEm, MAX_OPTIONS, OPTION_LABELS, type TypeOption } from "../../lib/type/state";

export type GroundMode = "both" | "light" | "dark";

/** Shows primary, secondary and accent as type in one theme. */
function GroundColors({ colors, fontStyle, inkColor }: { colors: string[]; fontStyle: CSSProperties; inkColor: string }) {
  return (
    <div className="grid grid-cols-3 gap-ds-md border-t pt-ds-md" style={{ borderColor: `${inkColor}33` }}>
      {colors.map((hex, k) => (
        <div key={k} className="flex min-w-0 items-center gap-ds-sm">
          <span className="shrink-0 text-[40px] leading-none" style={{ ...fontStyle, color: hex }}>Aa</span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-caption text-caption" style={{ color: inkColor }}>{PALETTE_ROLES[k]}</span>
            <span className="truncate font-caption text-caption" style={{ color: inkColor, opacity: 0.75 }}>{hex.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type Props = {
  options: TypeOption[];
  activeId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: (id: string) => void;
  onAdd: () => void;
  headline: string;
  body: string;
  mode: GroundMode;
  onModeChange: (m: GroundMode) => void;
};

export function TypePreview({ options, activeId, onSelect, onRemove, onClear, onAdd, headline, body, mode, onModeChange }: Props) {
  const head = headline.trim() || "Your headline";
  const copy = body.trim() || "Your body copy appears here.";
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const isCollapsed = (id: string) => collapsed.includes(id);
  const toggle = (id: string) => setCollapsed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const othersOpen = options.some((o) => o.id !== activeId && !collapsed.includes(o.id));
  const collapseOthers = () => setCollapsed(options.filter((o) => o.id !== activeId).map((o) => o.id));
  const expandAll = () => setCollapsed([]);
  const [saving, setSaving] = useState<string | null>(null);
  const savePng = async (id: string, index: number) => {
    setSaving(id);
    try {
      await exportOptionsPng(options, headline, body, index);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };
  const addAndFocus = () => {
    setCollapsed(options.map((o) => o.id));
    onAdd();
  };

  return (
    <div className="flex flex-col gap-ds-md">
      <div className="flex flex-wrap items-center justify-between gap-ds-md">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-heading text-[#f8f1f8]">Live preview</h2>
          <p className="font-caption text-caption text-[#f0dcf2]">
            {options.length} of {MAX_OPTIONS} options · click a card to edit it
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm">
        {options.length > 1 && (
          <button
            type="button"
            onClick={othersOpen ? collapseOthers : expandAll}
            className="inline-flex items-center gap-ds-xs rounded-full border border-[#d2acd7] bg-white px-ds-md py-ds-sm font-label text-label font-medium text-[#3f1a44] hover:border-foreground"
          >
            {othersOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
            {othersOpen ? "Collapse others" : "Expand all"}
          </button>
        )}
        <div role="group" aria-label="Background" data-mode={mode} className="group relative grid w-[300px] grid-cols-3 rounded-full border border-[#d2acd7] bg-white p-1 shadow-[inset_0_1px_3px_rgba(63,26,68,0.18)]">
          <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/3)] rounded-full bg-foreground shadow-[0_2px_6px_rgba(30,10,50,0.35)] transition-transform duration-300 ease-out group-data-[mode=light]:translate-x-full group-data-[mode=dark]:translate-x-[200%]" />
          <button type="button" aria-pressed={mode === "both"} onClick={() => onModeChange("both")} className="relative z-10 rounded-full py-ds-xs text-center font-label text-label font-medium text-[#6e4a73] transition-colors duration-300 aria-pressed:text-background">
            Both
          </button>
          <button type="button" aria-pressed={mode === "light"} onClick={() => onModeChange("light")} className="relative z-10 rounded-full py-ds-xs text-center font-label text-label font-medium text-[#6e4a73] transition-colors duration-300 aria-pressed:text-background">
            Light
          </button>
          <button type="button" aria-pressed={mode === "dark"} onClick={() => onModeChange("dark")} className="relative z-10 rounded-full py-ds-xs text-center font-label text-label font-medium text-[#6e4a73] transition-colors duration-300 aria-pressed:text-background">
            Dark
          </button>
        </div>
        </div>
      </div>

      {options.map((o, i) => {
        const d = resolveFont(o.display, [], "display");
        const b = resolveFont(o.body, [], "body");
        const p = o.palette;
        // The dark theme set: the light hues lightened to read on the deep neutral, unless the user set their own.
        const dark = darkColors(o);
        const dStyle = previewStyle(o.display, d);
        const headStyle = { ...dStyle, letterSpacing: `${displaySpacingEm(o, dStyle.letterSpacing as string | undefined)}em`, fontSize: `${o.displaySize}px`, lineHeight: 1 };
        const kern = o.displayTracking ?? 0;
        const bodyStyle = { ...previewStyle(o.body, b), fontSize: "18px", lineHeight: 1.6 };
        const isActive = o.id === activeId;
        const shut = isCollapsed(o.id);
        return (
          <article
            key={o.id}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Option ${OPTION_LABELS[i]}`}
            data-collapsed={shut ? "true" : undefined}
            onClick={() => onSelect(o.id)}
            className="group cursor-pointer rounded-xl border-2 border-transparent bg-[#ecd9ee] p-ds-md shadow-[0_12px_30px_-18px_rgba(30,10,50,0.6)] transition-colors hover:border-[#d2acd7] aria-[current=true]:border-[#3f1a44]"
          >
            <div className="mb-ds-md flex flex-wrap items-center justify-between gap-ds-sm px-ds-xs group-data-[collapsed=true]:mb-0">
              <div className="flex flex-col gap-1">
                <span className="font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">Option {OPTION_LABELS[i]}</span>
                <p className="font-label text-label font-medium text-[#3f1a44]">
                  {d.name} + {b.name} · {o.displaySize}px · kerning {kern > 0 ? `+${kern}` : kern}
                </p>
              </div>
              <div className="flex items-center gap-ds-xs">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(o.id);
                  }}
                  className="inline-flex items-center gap-ds-xs rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {isActive ? "Editing" : "Edit"}
                </button>
                <button
                  type="button"
                  disabled={saving === o.id}
                  title={`Download a PNG of option ${OPTION_LABELS[i]} with fonts, sizes and color chips`}
                  onClick={(e) => {
                    e.stopPropagation();
                    savePng(o.id, i);
                  }}
                  className="inline-flex items-center gap-ds-xs rounded-full bg-[#3f1a44] px-ds-md py-ds-xs font-label text-label text-[#f8f1f8] hover:bg-[#2a0f2e] disabled:cursor-wait disabled:opacity-60"
                >
                  <Download className="h-3.5 w-3.5" />
                  {saving === o.id ? "Saving…" : "Save PNG"}
                </button>
                <button
                  type="button"
                  title={`Reset every choice on option ${OPTION_LABELS[i]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Clear all choices on option ${OPTION_LABELS[i]}? Fonts, size, kerning and colors will reset.`)) onClear(o.id);
                  }}
                  className="inline-flex items-center gap-ds-xs rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-destructive hover:text-destructive"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear all
                </button>
                {options.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove option ${OPTION_LABELS[i]}`}
                    title="Remove this option"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(o.id);
                    }}
                    className="rounded-full border border-border bg-white p-ds-xs text-[#3f1a44] hover:border-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  aria-expanded={!shut}
                  aria-label={shut ? `Expand option ${OPTION_LABELS[i]}` : `Collapse option ${OPTION_LABELS[i]}`}
                  title={shut ? "Show this option" : "Collapse this option"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(o.id);
                  }}
                  className="rounded-full border border-border bg-white p-ds-xs text-[#3f1a44] hover:border-foreground"
                >
                  <ChevronDown className={shut ? "h-4 w-4 -rotate-90 transition-transform" : "h-4 w-4 transition-transform"} />
                </button>
              </div>
            </div>

            {!shut && (
            <div className="flex flex-col gap-ds-sm">
              {mode !== "dark" && (
                <div className="flex flex-col gap-ds-md overflow-hidden rounded-lg p-ds-xl" style={{ background: p[3].hex }}>
                  <span className="font-caption text-caption uppercase tracking-[0.2em]" style={{ color: p[2].hex }}>Light theme</span>
                  <p className="break-words" style={{ ...headStyle, color: p[0].hex }}>{head}</p>
                  <p className="max-w-[62ch]" style={{ ...bodyStyle, color: p[4].hex }}>{copy}</p>
                  <GroundColors colors={[p[0].hex, p[1].hex, p[2].hex]} fontStyle={dStyle} inkColor={p[4].hex} />
                </div>
              )}
              {mode !== "light" && (
                <div className="flex flex-col gap-ds-md overflow-hidden rounded-lg p-ds-xl" style={{ background: p[4].hex }}>
                  <span className="font-caption text-caption uppercase tracking-[0.2em]" style={{ color: dark[2] }}>Dark theme</span>
                  <p className="break-words" style={{ ...headStyle, color: dark[0] }}>{head}</p>
                  <p className="max-w-[62ch] opacity-80" style={{ ...bodyStyle, color: p[3].hex }}>{copy}</p>
                  <GroundColors colors={dark} fontStyle={dStyle} inkColor={p[3].hex} />
                </div>
              )}
              <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
                <div className="flex-[3]" style={{ background: p[0].hex }} />
                <div className="flex-[2]" style={{ background: p[1].hex }} />
                <div className="flex-1" style={{ background: p[2].hex }} />
                <div className="flex-[2]" style={{ background: p[3].hex }} />
                <div className="flex-[2]" style={{ background: p[4].hex }} />
              </div>
            </div>
            )}
          </article>
        );
      })}

      {options.length < MAX_OPTIONS && (
        <button
          type="button"
          onClick={addAndFocus}
          className="flex items-center justify-center gap-ds-sm rounded-xl border-2 border-dashed border-[#e3c6e6] px-ds-lg py-ds-xl font-label text-label text-[#f8f1f8] transition-colors hover:bg-[#f8f1f8]/10"
        >
          <Plus className="h-4 w-4" />
          Add option {OPTION_LABELS[options.length]} to compare
        </button>
      )}
    </div>
  );
}
