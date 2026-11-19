import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ChipPicker, CopyButton, LockButton, softButton } from "../brand/ui";
import { COLOR_DIRECTIONS } from "../../lib/brand/artVocab";
import { colorName, generatePalette, hexToHsl, hslToHex, inkOn, normalizeHex, PALETTE_ROLES, tintForDark } from "../../lib/brand/color";
import { newSeed, pickR, rng } from "../../lib/brand/random";
import type { Swatch } from "../../lib/brand/types";
import { darkColors, type TypeOption } from "../../lib/type/state";

function HexField({ value, onCommit, label }: { value: string; onCommit: (hex: string) => void; label: string }) {
  const [draft, setDraft] = useState(value.toUpperCase());
  useEffect(() => setDraft(value.toUpperCase()), [value]);
  const valid = normalizeHex(draft) !== null;
  return (
    <div className="flex flex-col gap-ds-xs">
      <input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const hex = normalizeHex(e.target.value);
          if (hex) onCommit(hex);
        }}
        onBlur={() => setDraft(value.toUpperCase())}
        aria-label={label}
        aria-invalid={!valid}
        spellCheck={false}
        className="w-full rounded-md border border-border bg-white px-ds-sm py-ds-xs font-label text-label uppercase text-[#3f1a44] outline-none focus:border-foreground aria-[invalid=true]:border-destructive"
      />
      {!valid && <span className="font-caption text-caption text-destructive">Use #RGB or #RRGGBB</span>}
    </div>
  );
}

type Props = {
  option: TypeOption;
  optionLabel: string;
  onChange: (fn: (o: TypeOption) => TypeOption) => void;
};

export function TypeColorPanel({ option, optionLabel, onChange }: Props) {
  // Which chip set is showing. The dark set follows the light one until a dark chip is edited or remixed.
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const darkAccents = darkColors(option);
  /** Primary, secondary and accent have their own color in the dark theme; the neutrals are shared. */
  const isDarkChip = (i: number) => theme === "dark" && i < 3;
  const shown = (i: number) => (isDarkChip(i) ? darkAccents[i] : option.palette[i].hex);
  const setDark = (i: number, hex: string) =>
    onChange((o) => ({ ...o, darkPalette: [0, 1, 2].map((k) => (k === i ? hex : o.darkPalette?.[k] ?? null)) }));
  /** Set the chip on show, in whichever theme is showing. */
  const setColor = (i: number, hex: string) => (isDarkChip(i) ? setDark(i, hex) : updateSwatch(i, { hex }));
  const updateSwatch = (i: number, patch: Partial<Swatch>) =>
    onChange((o) => ({ ...o, palette: o.palette.map((sw, k) => (k === i ? { ...sw, ...patch } : sw)) }));

  const regenerate = (direction?: string | null) =>
    onChange((o) => {
      const r = rng(newSeed());
      const dir = direction ?? o.colorDirection ?? pickR(r, COLOR_DIRECTIONS).name;
      return { ...o, colorDirection: direction === undefined ? o.colorDirection : direction, palette: generatePalette(dir, o.palette, r), darkPalette: undefined };
    });

  const lockedCount = option.palette.filter((p) => p.locked).length;
  const regenerateOne = (i: number) =>
    onChange((o) => {
      const r = rng(newSeed());
      const dir = o.colorDirection ?? pickR(r, COLOR_DIRECTIONS).name;
      const onlyThis = o.palette.map((sw, k) => ({ ...sw, locked: k !== i }));
      const next = generatePalette(dir, onlyThis, r);
      // Push further from the recipe so repeated clicks give visibly different chips.
      const [h, s, l] = hexToHsl(next[i].hex);
      const hex = hslToHex((((h + (r() * 80 - 40)) % 360) + 360) % 360, Math.min(95, Math.max(8, s + (r() * 24 - 12))), Math.min(96, Math.max(6, l + (r() * 16 - 8))));
      return { ...o, palette: o.palette.map((sw, k) => (k === i ? { ...sw, hex } : sw)) };
    });
  /** Remix one chip in the theme on show. A dark chip gets a new hue, kept readable on the deep neutral. */
  const remixOne = (i: number) => {
    if (!isDarkChip(i)) return regenerateOne(i);
    const r = rng(newSeed());
    const [h, s, l] = hexToHsl(darkAccents[i]);
    const next = hslToHex((((h + (r() * 120 - 60)) % 360) + 360) % 360, Math.min(95, Math.max(20, s + (r() * 30 - 15))), Math.min(88, Math.max(50, l + (r() * 16 - 8))));
    setDark(i, tintForDark(next, option.palette[4].hex));
  };
  const paletteText = option.palette.map((_, i) => `${PALETTE_ROLES[i]}: ${shown(i).toUpperCase()}`).join("\n");

  return (
    <section aria-label="Color" className="rounded-xl border border-[#d2acd7] bg-[#ecd9ee] p-ds-xl">
      <div className="mb-ds-xl flex flex-wrap items-start justify-between gap-ds-lg">
        <div className="flex max-w-2xl flex-col gap-ds-xs">
          <span className="font-caption text-caption font-medium uppercase tracking-[0.2em] text-[#6e4a73]">03 · Color · Option {optionLabel}</span>
          <h2 className="font-display text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#3f1a44] xl:text-[56px]">Add some color</h2>
          <p className="max-w-xl font-label text-label text-[#6e4a73]">
            Click a chip to open the color picker or type a hex. Light neutral and deep neutral are the backgrounds of the light and dark themes on the right. The dark colors follow your light ones until you change them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm">
          <button type="button" className="ds-button rounded-lg bg-[#3f1a44] text-[#f8f1f8] hover:bg-[#2a0f2e] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => regenerate()} disabled={lockedCount === 5}>
            <RefreshCw className="h-4 w-4" />
            Remix
          </button>
          <CopyButton text={paletteText} label="Copy colors" />
        </div>
      </div>

      <div className="flex flex-col gap-ds-xl">
        <div className="rounded-xl border border-[#dcbfe0] bg-[#f5eaf6] p-ds-lg">
          <div className="mb-ds-md flex flex-wrap items-center justify-between gap-ds-sm">
            <div className="flex flex-col gap-ds-xs">
              <h3 className="font-heading text-heading text-[#3f1a44]">Choose a color style</h3>
              <p className="font-caption text-caption text-[#6e4a73]">
                {option.colorDirection ? `Current: ${option.colorDirection}. Choosing a style remixes the chips below.` : "Pick a style to build the chips below, or remix for a random one."}
              </p>
            </div>
            {option.colorDirection && (
              <button type="button" className={softButton} onClick={() => onChange((o) => ({ ...o, colorDirection: null }))}>
                Clear style
              </button>
            )}
          </div>
          <ChipPicker
            terms={COLOR_DIRECTIONS}
            selected={option.colorDirection ? [option.colorDirection] : []}
            onToggle={(name) => (name === option.colorDirection ? onChange((o) => ({ ...o, colorDirection: null })) : regenerate(name))}
            idPrefix="tp-color-dir"
            groupLabel="Color style"
          />
        </div>

        <div className="flex flex-col gap-ds-md">
          {/* Switch first, so it stays put when the caption beside it changes. */}
          <div className="flex flex-wrap items-center gap-ds-md">
            <div role="group" aria-label="Chip set" className="flex shrink-0 gap-1 rounded-full border border-[#d2acd7] bg-white p-1 shadow-[inset_0_1px_3px_rgba(63,26,68,0.18)]">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={theme === t}
                  onClick={() => setTheme(t)}
                  className="rounded-full px-ds-lg py-ds-xs font-label text-label font-medium capitalize text-[#6e4a73] transition-colors hover:text-[#3f1a44] aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="font-caption text-caption text-[#6e4a73]">
              {theme === "light" ? "Light theme: colors on the light neutral." : "Dark theme: colors on the deep neutral."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-ds-sm sm:grid-cols-5">
            {option.palette.map((sw, i) => {
              const hex = shown(i);
              return (
                <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-[#dcbfe0] bg-[#f5eaf6]">
                  <label className="relative block h-20 cursor-pointer" style={{ background: hex }} title="Click to open the color picker">
                    <input type="color" value={hex} onChange={(e) => setColor(i, e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`${PALETTE_ROLES[i]} color picker`} />
                    <span className="pointer-events-none absolute left-ds-sm top-ds-sm font-caption text-caption" style={{ color: inkOn(hex) }}>{PALETTE_ROLES[i]}</span>
                    <span className="pointer-events-none absolute bottom-ds-sm left-ds-sm font-caption text-caption capitalize" style={{ color: inkOn(hex) }}>{colorName(hex)}</span>
                  </label>
                  <div className="flex flex-col gap-ds-sm p-ds-sm">
                    <HexField value={hex} onCommit={(next) => setColor(i, next)} label={`${PALETTE_ROLES[i]} hex value`} />
                    <div className="flex items-center gap-ds-xs">
                      <LockButton compact locked={sw.locked} onToggle={() => updateSwatch(i, { locked: !sw.locked })} label={`${PALETTE_ROLES[i]} color`} />
                      <button
                        type="button"
                        onClick={() => remixOne(i)}
                        disabled={sw.locked}
                        title={sw.locked ? "Unlock to remix this chip" : "Remix just this chip"}
                        className="inline-flex flex-1 items-center justify-center gap-ds-xs rounded-md border border-border bg-white px-ds-sm py-ds-xs font-label text-label text-[#3f1a44] hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RefreshCw className="h-4 w-4 shrink-0" />
                        Remix
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
