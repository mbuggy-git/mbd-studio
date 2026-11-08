import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ChipPicker, CopyButton, LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { COLOR_DIRECTIONS } from "../../../lib/brand/artVocab";
import { colorName, generatePalette, inkOn, normalizeHex, PALETTE_ROLES } from "../../../lib/brand/color";
import { newSeed, rng } from "../../../lib/brand/random";
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

export function ColorSection({ brand, set, commit }: SectionProps) {
  const updateSwatch = (i: number, patch: Partial<Swatch>) =>
    set((s) => ({ ...s, palette: s.palette.map((sw, k) => (k === i ? { ...sw, ...patch } : sw)) }));

  const regenerate = (direction?: string | null) =>
    commit((s) => {
      const r = rng(newSeed());
      const dir = direction ?? s.colorDirection ?? directionFromTraits(s.traits, r);
      return { ...s, colorDirection: direction === undefined ? s.colorDirection : direction, palette: generatePalette(dir, s.palette, r) };
    });

  const lockedCount = brand.palette.filter((p) => p.locked).length;
  const paletteText = brand.palette.map((p, i) => `${PALETTE_ROLES[i]}: ${p.hex.toUpperCase()}`).join("\n");

  return (
    <SectionShell
      index="03 · Color palette"
      title="Build the palette"
      blurb="Five colors with roles. Pick by hand or choose a direction and regenerate."
      actions={
        <>
          <button type="button" className="ds-button ds-button-primary rounded-lg" onClick={() => regenerate()} disabled={lockedCount === 5} data-oid="bbdcc1c28e">
            <RefreshCw className="h-4 w-4" data-oid="15a1b3ea54" />
            {brand.colorDirection ? "Regenerate colors" : "Generate colors"}
          </button>
          <CopyButton text={paletteText} label="Copy palette" />
        </>
      }
    >
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
                <LockButton compact locked={sw.locked} onToggle={() => updateSwatch(i, { locked: !sw.locked })} label={`${PALETTE_ROLES[i]} color`} />
                <CopyButton text={sw.hex.toUpperCase()} label="Hex" className="flex-1 px-ds-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubPanel
        title="Starting color direction"
        hint={brand.colorDirection ? `Current: ${brand.colorDirection}. Choosing a direction regenerates the palette.` : "No direction chosen — regeneration follows your personality words."}
        actions={
          brand.colorDirection ? (
            <button type="button" className={softButton} onClick={() => set((s) => ({ ...s, colorDirection: null }))} data-oid="47e335113b" data-oid-classname-dynamic="true">
              Follow personality instead
            </button>
          ) : undefined
        }
      >
        <ChipPicker
          terms={COLOR_DIRECTIONS}
          selected={brand.colorDirection ? [brand.colorDirection] : []}
          onToggle={(name) => (name === brand.colorDirection ? set((s) => ({ ...s, colorDirection: null })) : regenerate(name))}
          idPrefix="color-dir"
          groupLabel="Color direction"
        />
      </SubPanel>

      <div className="grid grid-cols-1 gap-ds-md md:grid-cols-[1.4fr_1fr]" data-oid="28b3545187">
        <div className="flex h-40 overflow-hidden rounded-xl" aria-label="Palette in use proportions" data-oid="38e4337c2b">
          <div className="flex-[6]" style={{ background: brand.palette[3].hex }} data-oid="35152794df" data-oid-style-dynamic="background" />
          <div className="flex-[3]" style={{ background: brand.palette[0].hex }} data-oid="23cd607afc" data-oid-style-dynamic="background" />
          <div className="flex-[2]" style={{ background: brand.palette[1].hex }} data-oid="2660904644" data-oid-style-dynamic="background" />
          <div className="flex-1" style={{ background: brand.palette[2].hex }} data-oid="60db2a895d" data-oid-style-dynamic="background" />
          <div className="flex-[1.5]" style={{ background: brand.palette[4].hex }} data-oid="b599d23489" data-oid-style-dynamic="background" />
        </div>
        <div className="flex flex-col justify-center gap-ds-xs rounded-xl p-ds-lg" style={{ background: brand.palette[3].hex }} data-oid="35d0da2c79" data-oid-style-dynamic="background">
          <p className="font-display text-[32px] font-semibold leading-none" style={{ color: brand.palette[4].hex }} data-oid="1d9ba821fb" data-oid-style-dynamic="color">{brand.name || "Brand"}</p>
          <p className="font-label text-label" style={{ color: brand.palette[0].hex }} data-oid="37d1a47002" data-oid-style-dynamic="color">Primary on light neutral</p>
          <span className="mt-ds-sm w-fit rounded-full px-ds-md py-ds-xs font-label text-label" style={{ background: brand.palette[2].hex, color: inkOn(brand.palette[2].hex) }} data-oid="54a9b74735" data-oid-style-dynamic="background,color">Accent button</span>
        </div>
      </div>
    </SectionShell>
  );
}
