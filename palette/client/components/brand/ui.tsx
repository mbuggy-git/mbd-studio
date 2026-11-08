import { useState, type ReactNode } from "react";
import { Check, Copy, Lock, LockOpen, RefreshCw, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChipTerm } from "../../lib/brand/artVocab";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export const softButton =
"ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition-colors hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] disabled:cursor-not-allowed disabled:opacity-50";

export function CopyButton({ text, label = "Copy", className }: {text: string;label?: string;className?: string;}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        }
      }}
      className={cn(softButton, className)}
      aria-live="polite" data-oid="935067eadb" data-oid-component-root="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="expression:25409faa196c|expression:8c60a4390484" data-oid-classname-dynamic="true">
      
      {done ? <Check className="h-4 w-4" data-oid="abc3e58b86" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" /> : <Copy className="h-4 w-4" data-oid="acbbe83f33" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />}
      {done ? "Copied" : label}
    </button>);

}

export function LockButton({ locked, onToggle, label, compact }: {locked: boolean;onToggle: () => void;label: string;compact?: boolean;}) {
  return (
    <button
      type="button"
      aria-pressed={locked}
      onClick={onToggle}
      title={locked ? `Unlock ${label}` : `Lock ${label} — regeneration will keep it`}
      aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
      className={cn(
        "inline-flex items-center gap-ds-xs rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-label text-label text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition-colors hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background",
        compact ? "p-ds-sm" : "px-ds-md py-ds-sm"
      )} data-oid="55dc5e3cf0" data-oid-component-root="true" data-oid-text-editable="false" data-oid-text-source="expression:8e39ba37b7b6|expression:e39481ab6dd4" data-oid-classname-dynamic="true" data-oid-callsite-editable="true">
      
      {locked ? <Lock className="h-4 w-4" data-oid="4b53cedd55" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" /> : <LockOpen className="h-4 w-4" data-oid="06e5b2e47a" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />}
      {!compact && (locked ? "Locked" : "Lock")}
    </button>);

}

export function SectionShell({
  index,
  title,
  blurb,
  actions,
  children






}: {index: string;title: string;blurb: string;actions?: ReactNode;children: ReactNode;}) {
  return (
    <section className="rounded-xl border border-border bg-[#ccb7ed] p-ds-xl shadow-[0_1px_0_rgba(0,0,0,0.03)]" aria-label={title} data-oid="02d6eb5aeb" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true">
      <div className="mb-ds-xl flex flex-wrap items-start justify-between gap-ds-lg" data-oid="113ff52334" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="element:div|expression:4cc005dce52c">
        <div className="flex max-w-2xl flex-col gap-ds-xs" data-oid="053e72d30d" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          <span className="font-caption text-caption font-medium uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="7a62eb8490" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{index}</span>
          <h2 className="font-display text-[44px] font-semibold leading-none tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] xl:text-[56px]" data-oid="7339817cfb" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{title}</h2>
          <p className="max-w-xl font-label text-label text-[#5f5f7a]" data-oid="28952c0966" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{blurb}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-ds-sm" data-oid="4609a66713" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{actions}</div>}
      </div>
      <div className="flex flex-col gap-ds-xl" data-oid="8e264ab2bd" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{children}</div>
    </section>);

}

export function SubPanel({ title, hint, actions, children, className }: {title: string;hint?: string;actions?: ReactNode;children: ReactNode;className?: string;}) {
  return (
    <div className={cn("rounded-xl border border-[color-mix(in_srgb,var(--primary)_22%,var(--border))] bg-[#d9c9f2] p-ds-lg", className)} data-oid="7b3ff358d3" data-oid-component-root="true" data-oid-text-editable="false" data-oid-text-source="element:div|expression:42685f11da91" data-oid-classname-dynamic="true">
      <div className="mb-ds-md flex flex-wrap items-center justify-between gap-ds-sm" data-oid="e6450a6a5b" data-oid-text-editable="false" data-oid-text-source="element:div|expression:e1d6839ae3a1">
        <div className="flex flex-col gap-ds-xs" data-oid="d4f888ed9d" data-oid-text-editable="false" data-oid-text-source="element:h3|expression:01ab6a88d1e2">
          <h3 className="font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="fb51123e27">{title}</h3>
          {hint && <p className="font-caption text-caption text-[#5f5f7a]" data-oid="e5ac1e0408">{hint}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-ds-sm" data-oid="a4fc4ec5d6">{actions}</div>}
      </div>
      {children}
    </div>);

}

const TOOLTIP_WIDTH = 300;

/**
 * Word-chip picker with hover/focus tooltips and a tap-friendly “term notes” strip that always
 * explains the most recently touched chip (the mobile alternative to hover).
 */
export function ChipPicker({
  terms,
  selected,
  onToggle,
  idPrefix,
  groupLabel,
  disabled,
  showNotes = true








}: {terms: ChipTerm[];selected: string[];onToggle: (name: string) => void;idPrefix: string;groupLabel: string;disabled?: boolean;showNotes?: boolean;}) {
  const [alignRight, setAlignRight] = useState<Record<string, boolean>>({});
  const [focus, setFocus] = useState<string | null>(null);
  const measure = (name: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const right = rect.left + TOOLTIP_WIDTH > window.innerWidth - 16;
    setAlignRight((prev) => prev[name] === right ? prev : { ...prev, [name]: right });
  };
  const note = terms.find((t) => t.name === focus);

  return (
    <div className="flex flex-col gap-ds-md" data-oid="e9d6da185b" data-oid-component-root="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="element:ul|expression:b795732da9f3">
      <ul className="flex flex-wrap gap-ds-sm" aria-label={groupLabel} data-oid="74746dbdf2" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
        {terms.map((term, i) => {
          const isOn = selected.includes(term.name);
          return (
            <li
              key={term.name}
              className="group relative"
              onPointerEnter={(e) => measure(term.name, e.currentTarget)}
              onFocus={(e) => {
                measure(term.name, e.currentTarget);
                setFocus(term.name);
              }} data-oid="b82caf15ee" data-oid-shared="true">
              
              <button
                type="button"
                aria-pressed={isOn}
                disabled={disabled}
                aria-describedby={`${idPrefix}-tip-${i}`}
                onClick={() => {
                  setFocus(term.name);
                  onToggle(term.name);
                }}
                className="inline-flex items-center gap-ds-sm rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] py-ds-xs pl-ds-xs pr-ds-md font-label text-label font-medium text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition-all duration-150 hover:-translate-y-px hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background" data-oid="ca54bc638f" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="element:span|expression:68a3773897b1">
                
                <span className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: term.swatch }} aria-hidden="true" data-oid="2b433f4a11" data-oid-shared="true" data-oid-style-dynamic="background" />
                {term.name}
              </button>
              <div
                id={`${idPrefix}-tip-${i}`}
                role="tooltip"
                className={cn(
                  "pointer-events-none invisible absolute bottom-full z-40 mb-ds-sm w-[min(18.75rem,calc(100vw-2rem))] translate-y-1 rounded-xl border border-border bg-popover p-ds-sm opacity-0 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.3)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                  alignRight[term.name] ? "right-0" : "left-0"
                )} data-oid="0c1d593e2d" data-oid-shared="true" data-oid-classname-dynamic="true">
                
                <div className="relative h-32 w-full overflow-hidden rounded-lg" style={{ background: term.swatch }} data-oid="422fb2af7b" data-oid-shared="true" data-oid-style-dynamic="background">
                  {term.image &&
                  <img
                    src={term.image}
                    alt={`Example of ${term.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }} data-oid="c264bf036a" data-oid-shared="true" />

                  }
                </div>
                <div className="flex flex-col gap-ds-xs px-ds-sm pb-ds-sm pt-ds-md" data-oid="3928f8fc7e" data-oid-shared="true">
                  <span className="font-caption text-caption uppercase tracking-[0.2em] text-muted-foreground" data-oid="5ce8ae8c32" data-oid-shared="true">{groupLabel}</span>
                  <span className="font-display text-[26px] font-semibold leading-none text-popover-foreground" data-oid="6c3d0574e7" data-oid-shared="true">{term.name}</span>
                  <p className="font-label text-label text-muted-foreground" data-oid="955de717f4" data-oid-shared="true">{term.meaning}</p>
                  <p className="mt-ds-xs border-t border-border pt-ds-sm font-caption text-caption text-muted-foreground" data-oid="c9b15cab15" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="text|expression:e4d7d4d19e08">In your brand: {term.influence}</p>
                </div>
              </div>
            </li>);

        })}
      </ul>
      {showNotes &&
      <div className="flex min-h-[52px] items-center gap-ds-md rounded-lg border border-dashed border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] px-ds-md py-ds-sm" aria-live="polite" data-oid="6a45101b01" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          {note ?
        <>
              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-md ring-1 ring-black/10" style={{ background: note.swatch }} aria-hidden="true" data-oid="176cee2cab" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background">
                {note.image && <img src={note.image} alt="" className="h-full w-full object-cover" onError={(e) => {e.currentTarget.hidden = true;}} data-oid="1ff7481d8e" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />}
              </span>
              <p className="font-caption text-caption text-[#5f5f7a]" data-oid="6375f21391" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="element:strong|text|expression:e3ee884460db|expression:fd50351a37a5">
                <strong className="font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="a8318c7255" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{note.name}</strong> — {note.meaning} {note.influence}
              </p>
            </> :

        <p className="font-caption text-caption text-[#5f5f7a]" data-oid="c067de4e66" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">Hover, focus or tap a word to see what it means for your brand.</p>
        }
        </div>
      }
    </div>);

}

/** Editable generated text with lock / regenerate / reset / copy controls. */
export function TextCard({
  title,
  hint,
  value,
  locked,
  edited,
  onChange,
  onToggleLock,
  onRegenerate,
  onReset,
  rows = 5,
  mono,
  regenerateLabel = "Regenerate"













}: {title: string;hint?: string;value: string;locked: boolean;edited?: boolean;onChange: (text: string) => void;onToggleLock: () => void;onRegenerate?: () => void;onReset?: () => void;rows?: number;mono?: boolean;regenerateLabel?: string;}) {
  return (
    <SubPanel
      title={title}
      hint={hint ?? (locked ? "Locked — your text is preserved." : "Live — updates as the brand changes. Editing locks it.")}
      actions={
      <>
          <LockButton locked={locked} onToggle={onToggleLock} label={title} />
          {onRegenerate &&
        <button type="button" className={softButton} onClick={onRegenerate} disabled={locked} title={locked ? "Unlock to regenerate" : undefined} data-oid="5cf1b0bd53" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-classname-dynamic="true">
              <RefreshCw className="h-4 w-4" data-oid="5fa247305e" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />
              {regenerateLabel}
            </button>
        }
          {onReset && edited &&
        <button type="button" className={softButton} onClick={onReset} title="Discard edits and return to the live version" data-oid="1299858f5d" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-classname-dynamic="true">
              <RotateCcw className="h-4 w-4" data-oid="0e46cca766" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />
              Reset
            </button>
        }
          <CopyButton text={value} />
        </>
      }>
      
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        aria-label={title}
        className={cn(
          "ds-input min-h-[120px] w-full resize-y rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] p-ds-md leading-relaxed text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]",
          mono ? "font-label text-label" : "font-body text-body"
        )} data-oid="304f31e77a" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-classname-dynamic="true" />
      
    </SubPanel>);

}