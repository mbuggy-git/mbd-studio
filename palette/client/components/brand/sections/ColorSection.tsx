import { useEffect, useState } from "react";
import { Eraser, RefreshCw, Sparkles } from "lucide-react";
import { ChipPicker, CopyButton, LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { COLOR_DIRECTIONS } from "../../../lib/brand/artVocab";
import { colorName, generatePalette, inkOn, normalizeHex, PALETTE_ROLES, primaryOnDark } from "../../../lib/brand/color";
import { newSeed, pickR, rng } from "../../../lib/brand/random";
import { directionFromTraits } from "../../../lib/brand/state";
import type { Swatch } from "../../../lib/brand/types";

function HexField({ value, onCommit, label }: { value: string; onCommit: (hex: string) => void; label: string }) {
  const [draft, setDraft] = useState(value.toUpperCase());
  useEffect(() => setDraft(value.toUpperCase()), [value]);
  const valid = normalizeHex(draft) !== null;
  return (
    <div className="flex flex-col gap-ds-xs" data-oid="7fefcf0bf1" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="element:input|expression:ee8f09872078">
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
        className="w-full rounded-md border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-sm py-ds-xs font-label text-label uppercase text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] outline-none focus:border-foreground aria-[invalid=true]:border-destructive" data-oid="f1a875d28c" data-oid-callsite-deletable="true" data-oid-callsite-editable="true"
      />
      {!valid && <span className="font-caption text-caption text-destructive" data-oid="07316016c4" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">Use #RGB or #RRGGBB</span>}
    </div>
  );
}

const NEUTRAL_PALETTE = ["#2b2b2b", "#6b6b6b", "#a3a3a3", "#efefef", "#141414"];

export function ColorSection({ brand, set, commit }: SectionProps) {
  const updateSwatch = (i: number, patch: Partial<Swatch>) =>
    set((s) => ({ ...s, palette: s.palette.map((sw, k) => (k === i ? { ...sw, ...patch } : sw)) }));

  const regenerate = (direction?: string | null) =>
    commit((s) => {
      const r = rng(newSeed());
      const dir = direction ?? s.colorDirection ?? directionFromTraits(s.traits, r);
      return { ...s, colorDirection: direction === undefined ? s.colorDirection : direction, palette: generatePalette(dir, s.palette, r) };
    });

  // Re-roll one swatch: the other four are held while the generator fills this role.
  const regenerateOne = (i: number) =>
    commit((s) => {
      const r = rng(newSeed());
      const dir = s.colorDirection ?? directionFromTraits(s.traits, r);
      const held = s.palette.map((sw, k) => ({ ...sw, locked: k !== i }));
      const next = generatePalette(dir, held, r);
      return { ...s, palette: s.palette.map((sw, k) => (k === i ? { hex: next[i].hex, locked: false } : sw)) };
    });

  const darkPrimary = primaryOnDark(brand.palette);
  const paletteText = [
    ...brand.palette.map((p, i) => `${PALETTE_ROLES[i]}: ${p.hex.toUpperCase()}`),
    `Primary on dark (derived): ${darkPrimary.toUpperCase()}`,
  ].join("\n");

  return (
    <SectionShell
      index="03 · Color palette"
      title="Build the palette"
      blurb="Five colors with roles. Pick by hand or choose a direction and regenerate."
      actions={
        <>
          <button type="button" className="ds-button ds-button-primary rounded-lg" onClick={() => regenerate()} data-oid="bbdcc1c28e">
            <RefreshCw className="h-4 w-4" data-oid="15a1b3ea54" />
            {brand.colorDirection ? "Regenerate colors" : "Generate colors"}
          </button>
          <button type="button" className={softButton} style={{ backgroundColor: "#b267c7", color: "#ffffff" }} title="A random direction and a fresh palette" onClick={() => regenerate(pickR(Math.random, COLOR_DIRECTIONS.map((d) => d.name).filter((n) => n !== brand.colorDirection)))}>
            <Sparkles className="h-4 w-4" />
            Surprise me
          </button>
          <button type="button" className={softButton} title="Drop the direction and generate a palette from your personality words" onClick={() => regenerate(null)}>
            Follow personality
          </button>
          <button type="button" className={softButton} title="Back to neutral greys, no direction (Undo brings the palette back)" onClick={() => commit((s) => ({ ...s, colorDirection: null, palette: NEUTRAL_PALETTE.map((hex) => ({ hex, locked: false })) }))}>
            <Eraser className="h-4 w-4" />
            Clear
          </button>
          <CopyButton text={paletteText} label="Copy palette" />
        </>
      }
    >
      <SubPanel
        title="Starting color direction"
        hint={brand.colorDirection ? `Current: ${brand.colorDirection}. Choosing a direction regenerates the palette.` : "No direction chosen — regeneration follows your personality words."}
      >
        <ChipPicker
          terms={COLOR_DIRECTIONS}
          selected={brand.colorDirection ? [brand.colorDirection] : []}
          onToggle={(name) => (name === brand.colorDirection ? set((s) => ({ ...s, colorDirection: null })) : regenerate(name))}
          idPrefix="color-dir"
          groupLabel="Color direction"
        />
      </SubPanel>

      <div className="grid grid-cols-1 gap-ds-sm sm:grid-cols-5" data-oid="2b52087e8f">
        {brand.palette.map((sw, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border bg-[#d9c9f2]" data-oid="4b4a0aed8b" data-oid-shared="true" data-oid-instance-targetable="true">
            <label className="relative block h-44 cursor-pointer" style={{ background: sw.hex }} title="Click to open the color picker" data-oid="5326dcb1b2" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="background">
              <input type="color" value={sw.hex} onChange={(e) => updateSwatch(i, { hex: e.target.value })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`${PALETTE_ROLES[i]} color picker`} data-oid="cde57e91ed" data-oid-shared="true" data-oid-instance-targetable="true" />
              <span className="pointer-events-none absolute left-ds-sm top-ds-sm font-caption text-caption" style={{ color: inkOn(sw.hex) }} data-oid="218daa56e0" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="color">{PALETTE_ROLES[i]}</span>
              <span className="pointer-events-none absolute bottom-ds-sm left-ds-sm font-caption text-caption capitalize" style={{ color: inkOn(sw.hex) }} data-oid="56c16d8b8e" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="color">{colorName(sw.hex)}</span>
            </label>
            <div className="flex flex-col gap-ds-sm p-ds-sm" data-oid="531c93e0be" data-oid-shared="true" data-oid-instance-targetable="true">
              <HexField value={sw.hex} onCommit={(hex) => updateSwatch(i, { hex })} label={`${PALETTE_ROLES[i]} hex value`} />
              <div className="flex items-center gap-ds-xs" data-oid="8d35b7d26f" data-oid-shared="true" data-oid-instance-targetable="true">
                <button type="button" className={`${softButton} px-ds-sm`} onClick={() => regenerateOne(i)} title={`New ${PALETTE_ROLES[i].toLowerCase()} color, keeping the other four`} aria-label={`Regenerate ${PALETTE_ROLES[i]} color`}>
                  <RefreshCw className="h-4 w-4" />
                </button>
                <CopyButton text={sw.hex.toUpperCase()} label="Hex" className="flex-1 px-ds-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-ds-md">
        <div className="flex h-24 overflow-hidden rounded-xl" aria-label="Palette in use proportions">
          <div className="flex-[6]" style={{ background: brand.palette[3].hex }} />
          <div className="flex-[3]" style={{ background: brand.palette[0].hex }} />
          <div className="flex-[2]" style={{ background: brand.palette[1].hex }} />
          <div className="flex-1" style={{ background: brand.palette[2].hex }} />
          <div className="flex-[1.5]" style={{ background: brand.palette[4].hex }} />
        </div>

        <div className="grid grid-cols-1 gap-ds-md md:grid-cols-2">
          {([
            { label: "Light", surface: brand.palette[3].hex, ink: brand.palette[4].hex, surfaceName: "light neutral" },
            { label: "Dark", surface: brand.palette[4].hex, ink: brand.palette[3].hex, surfaceName: "deep neutral" },
          ] as const).map((m) => (
            <div key={m.label} className="flex flex-col justify-center gap-ds-xs rounded-xl p-ds-lg" style={{ background: m.surface }}>
              <p className="font-caption text-caption uppercase tracking-[0.2em]" style={{ color: m.ink, opacity: 0.7 }}>{m.label}</p>
              <p className="font-display text-[32px] font-semibold leading-none" style={{ color: m.ink }}>{brand.name || "Brand"}</p>
              <p className="font-label text-label" style={{ color: m.label === "Dark" ? darkPrimary : brand.palette[0].hex }}>
                Primary on {m.surfaceName}
                {m.label === "Dark" && <span className="ml-ds-sm font-caption text-caption opacity-80">{darkPrimary.toUpperCase()} · derived</span>}
              </p>
              <span className="mt-ds-sm w-fit rounded-full px-ds-md py-ds-xs font-label text-label" style={{ background: brand.palette[2].hex, color: inkOn(brand.palette[2].hex) }}>
                Accent button
              </span>
            </div>
          ))}
        </div>

      </div>
    </SectionShell>
  );
}
