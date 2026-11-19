import { useEffect } from "react";
import { ExternalLink, Shuffle } from "lucide-react";
import { ChipPicker, LockButton, softButton } from "../brand/ui";
import { TYPE_CLASSIFICATIONS, TYPE_PERSONALITY, TYPE_SHAPE } from "../../lib/brand/artVocab";
import { adobeFontsSearchUrl, ensureFontLoaded, FONTS, googleFontsUrl, recommendFonts, resolveFont } from "../../lib/brand/fonts";
import { newSeed, rng } from "../../lib/brand/random";
import type { TypeSlot } from "../../lib/brand/types";
import { remixSlot, SIZE_MAX, SIZE_MIN, TRACKING_MAX, TRACKING_MIN, type TypeOption, type TypeRole } from "../../lib/type/state";

type Props = {
  role: TypeRole;
  option: TypeOption;
  optionLabel: string;
  onChange: (fn: (o: TypeOption) => TypeOption) => void;
  copy: string;
  onCopyChange: (v: string) => void;
};

export function FontSlotPanel({ role, option, optionLabel, onChange, copy, onCopyChange }: Props) {
  const slot = option[role];
  const isDisplay = role === "display";
  const patch = (p: Partial<TypeSlot>) =>
    onChange((o) => (o[role].locked ? o : ({ ...o, [role]: { ...o[role], ...p } } as TypeOption)));
  const toggleIn = (key: "personality" | "shape", name: string) =>
    patch({ [key]: slot[key].includes(name) ? slot[key].filter((x) => x !== name) : [...slot[key], name] } as Partial<TypeSlot>);
  const recs = recommendFonts(slot, [], role, 6);
  const active = resolveFont(slot, [], role);
  const recKey = recs.map((f) => f.name).join("|");
  const setSize = (n: number) => onChange((o) => ({ ...o, displaySize: n }));
  const tracking = option.displayTracking ?? 0;
  const setTracking = (n: number) => onChange((o) => ({ ...o, displayTracking: n }));

  useEffect(() => {
    recKey.split("|").forEach(ensureFontLoaded);
  }, [recKey]);

  return (
    <section aria-label={isDisplay ? "Display typeface" : "Body typeface"} className="rounded-xl border border-[#d2acd7] bg-[#ecd9ee] p-ds-xl">
      <div className="mb-ds-xl flex flex-wrap items-start justify-between gap-ds-lg">
        <div className="flex max-w-2xl flex-col gap-ds-xs">
          <span className="font-caption text-caption font-medium uppercase tracking-[0.2em] text-[#6e4a73]">
            {isDisplay ? "01 · Display" : "02 · Body"} · Option {optionLabel}
          </span>
          <h2 className="font-display text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#3f1a44] xl:text-[56px]">
            {isDisplay ? "Pick the headline face" : "Pair a body face"}
          </h2>
          <p className="max-w-xl font-label text-label text-[#6e4a73]">
            {isDisplay
              ? "Describe the voice you want with classification, personality and weight. Recommendations update as you go."
              : "Choose the text face that carries paragraphs alongside your display type. Readable families score higher here."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm">
          <button
            type="button"
            className={softButton}
            disabled={slot.locked}
            onClick={() => onChange((o) => ({ ...o, [role]: remixSlot(role, o[role], rng(newSeed())) }) as TypeOption)}
          >
            <Shuffle className="h-4 w-4" />
            Remix
          </button>
          <LockButton locked={slot.locked} onToggle={() => onChange((o) => ({ ...o, [role]: { ...o[role], locked: !o[role].locked } }) as TypeOption)} label={`${role} typeface`} />
        </div>
      </div>

      <div className="flex flex-col gap-ds-xl">
        <div className="ds-field flex flex-col gap-ds-xs">
          <label htmlFor={`type-copy-${role}`} className="ds-field-label font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">
            {isDisplay ? "Display copy" : "Body copy"}
          </label>
          {isDisplay ? (
            <input
              id={`type-copy-${role}`}
              value={copy}
              onChange={(e) => onCopyChange(e.target.value)}
              placeholder="Type a headline"
              className="ds-input w-full rounded-lg bg-white px-ds-md py-ds-sm font-body text-body text-[#3f1a44]"
            />
          ) : (
            <textarea
              id={`type-copy-${role}`}
              value={copy}
              rows={4}
              onChange={(e) => onCopyChange(e.target.value)}
              placeholder="Type a paragraph"
              className="ds-input min-h-[110px] w-full resize-y rounded-lg bg-white p-ds-md font-body text-body leading-relaxed text-[#3f1a44]"
            />
          )}
          <p className="font-caption text-caption text-[#6e4a73]">Shared by every option, so you compare like with like.</p>
        </div>

        {isDisplay && (
          <div className="rounded-xl border border-[#dcbfe0] bg-[#f5eaf6] p-ds-lg">
            <div className="mb-ds-md flex flex-wrap items-center justify-between gap-ds-sm">
              <div className="flex flex-col gap-ds-xs">
                <h3 className="font-heading text-heading text-[#3f1a44]">Preview size</h3>
                <p className="font-caption text-caption text-[#6e4a73]">Drag to see the display face at other sizes on the right.</p>
              </div>
              <output htmlFor="type-size" className="rounded-full bg-foreground px-ds-md py-ds-xs font-label text-label text-background">
                {option.displaySize}px
              </output>
            </div>
            <input
              id="type-size"
              type="range"
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={1}
              value={option.displaySize}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-label="Display preview size"
              className="w-full cursor-pointer accent-[#3f1a44]"
            />
            <div className="mt-ds-md flex flex-wrap gap-ds-xs">
              <button type="button" aria-pressed={option.displaySize === 32} onClick={() => setSize(32)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">32</button>
              <button type="button" aria-pressed={option.displaySize === 48} onClick={() => setSize(48)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">48</button>
              <button type="button" aria-pressed={option.displaySize === 72} onClick={() => setSize(72)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">72</button>
              <button type="button" aria-pressed={option.displaySize === 96} onClick={() => setSize(96)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">96</button>
              <button type="button" aria-pressed={option.displaySize === 144} onClick={() => setSize(144)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">144</button>
            </div>
          </div>
        )}

        {isDisplay && (
          <div className="rounded-xl border border-[#dcbfe0] bg-[#f5eaf6] p-ds-lg">
            <div className="mb-ds-md flex flex-wrap items-center justify-between gap-ds-sm">
              <div className="flex flex-col gap-ds-xs">
                <h3 className="font-heading text-heading text-[#3f1a44]">Kerning</h3>
                <p className="font-caption text-caption text-[#6e4a73]">Tighten or open the space between display letters, in 1/1000 em like your design tools.</p>
              </div>
              <output htmlFor="type-tracking" className="rounded-full bg-foreground px-ds-md py-ds-xs font-label text-label text-background">
                {tracking > 0 ? `+${tracking}` : tracking}
              </output>
            </div>
            <input
              id="type-tracking"
              type="range"
              min={TRACKING_MIN}
              max={TRACKING_MAX}
              step={5}
              value={tracking}
              onChange={(e) => setTracking(Number(e.target.value))}
              aria-label="Display kerning"
              className="w-full cursor-pointer accent-[#3f1a44]"
            />
            <div className="mt-ds-md flex flex-wrap gap-ds-xs">
              <button type="button" aria-pressed={tracking === -50} onClick={() => setTracking(-50)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">Tight −50</button>
              <button type="button" aria-pressed={tracking === -20} onClick={() => setTracking(-20)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">Snug −20</button>
              <button type="button" aria-pressed={tracking === 0} onClick={() => setTracking(0)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">Normal 0</button>
              <button type="button" aria-pressed={tracking === 50} onClick={() => setTracking(50)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">Open +50</button>
              <button type="button" aria-pressed={tracking === 150} onClick={() => setTracking(150)} className="rounded-full border border-border bg-white px-ds-md py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">Wide +150</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-ds-lg xl:grid-cols-3">
          <div className="flex flex-col gap-ds-sm">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">Classification</h4>
            <ChipPicker terms={TYPE_CLASSIFICATIONS} selected={[slot.classification]} onToggle={(n) => patch({ classification: n, font: null })} idPrefix={`tp-${role}-cls`} groupLabel="Classification" disabled={slot.locked} />
          </div>
          <div className="flex flex-col gap-ds-sm">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">Personality</h4>
            <ChipPicker terms={TYPE_PERSONALITY} selected={slot.personality} onToggle={(n) => toggleIn("personality", n)} idPrefix={`tp-${role}-per`} groupLabel="Type personality" disabled={slot.locked} />
          </div>
          <div className="flex flex-col gap-ds-sm">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">Weight & shape</h4>
            <ChipPicker terms={TYPE_SHAPE} selected={slot.shape} onToggle={(n) => toggleIn("shape", n)} idPrefix={`tp-${role}-shape`} groupLabel="Weight and shape" disabled={slot.locked} />
          </div>
        </div>

        <div className="flex flex-col gap-ds-sm">
          <div className="flex flex-wrap items-end justify-between gap-ds-md">
            <h4 className="font-caption text-caption uppercase tracking-[0.2em] text-[#6e4a73]">Recommended families</h4>
            <div className="ds-field flex items-center gap-ds-sm">
              <label htmlFor={`type-any-${role}`} className="ds-field-label font-caption text-caption text-[#6e4a73]">Or pick any family</label>
              <select
                id={`type-any-${role}`}
                value={slot.font ?? ""}
                disabled={slot.locked}
                onChange={(e) => patch({ font: e.target.value || null })}
                className="ds-input rounded-lg bg-white px-ds-sm py-ds-xs font-label text-label text-[#3f1a44]"
              >
                <option value="">Automatic top match</option>
                {FONTS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} — {f.classification}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="ds-listbox grid grid-cols-1 gap-ds-sm md:grid-cols-2 2xl:grid-cols-3" role="listbox" aria-label={`${role} font recommendations`}>
            {recs.map((font, i) => {
              const isActive = font.name === active.name;
              return (
                <li key={font.name} role="option" aria-selected={isActive} className="ds-listbox-option flex flex-col gap-ds-xs rounded-lg border border-border bg-white p-ds-md aria-selected:border-foreground aria-selected:shadow-[inset_0_0_0_1px_var(--foreground)]">
                  <button type="button" disabled={slot.locked} onClick={() => patch({ font: font.name })} className="flex flex-col items-start gap-ds-xs text-left disabled:cursor-not-allowed">
                    <span className="font-caption text-caption text-[#6e4a73]">
                      {i === 0 && !slot.font ? "Top match · auto" : font.classification}
                      {isActive ? " · in use" : ""}
                    </span>
                    <span className="truncate text-[28px] leading-tight text-[#3f1a44]" style={{ fontFamily: font.stack }}>
                      {font.name}
                    </span>
                    <span className="font-caption text-caption text-[#6e4a73]">{font.note}</span>
                  </button>
                  <div className="flex flex-wrap gap-ds-sm pt-ds-xs">
                    <a href={googleFontsUrl(font.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-ds-xs font-caption text-caption text-[#3f1a44] underline-offset-2 hover:underline">
                      Google Fonts <ExternalLink className="h-3 w-3" />
                    </a>
                    <a href={adobeFontsSearchUrl(font.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-ds-xs font-caption text-caption text-[#3f1a44] underline-offset-2 hover:underline">
                      Search Adobe Fonts <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="font-caption text-caption text-[#6e4a73]">
            In use: <strong className="font-semibold text-[#3f1a44]">{active.name}</strong> — {active.note}
          </p>
        </div>
      </div>
    </section>
  );
}
