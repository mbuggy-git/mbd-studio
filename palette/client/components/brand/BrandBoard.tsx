import { useState } from "react";
import { ImageDown, Printer } from "lucide-react";
import type { BrandState } from "../../lib/brand/types";
import { brandFacts } from "../../lib/brand/prompts";
import { inkOn } from "../../lib/brand/color";
import { previewStyle } from "../../lib/brand/fonts";
import { exportBoardPng } from "../../lib/brand/exportPng";
import { LogoPreview } from "./LogoPreview";

const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  #brand-board, #brand-board * { visibility: visible !important; }
  #brand-board { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
  .board-no-print { display: none !important; }
}`;

export function BrandBoard({ brand }: { brand: BrandState }) {
  const f = brandFacts(brand);
  const [exporting, setExporting] = useState(false);
  const colors = brand.palette.map((p) => p.hex);
  const displayStyle = previewStyle(brand.display, f.display);
  const bodyStyle = previewStyle(brand.body, f.body);

  return (
    <article id="brand-board" aria-label="Live brand board" className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] bg-[#f4eefb] shadow-[0_30px_60px_-30px_rgba(30,10,50,0.55)]" data-oid="c70d2f5feb" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      <style data-oid="74965f78bc">{PRINT_CSS}</style>
      <div className="flex items-center justify-between gap-ds-sm border-b border-[#e0d4f1] px-ds-lg py-ds-md" data-oid="5972340dd3">
        <p className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="57b9e6c328">Live Brand Board · Exploration</p>
        <div className="board-no-print flex items-center gap-ds-xs" data-oid="b0a871d49b">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-ds-xs rounded-md border border-[#e0d4f1] px-ds-sm py-ds-xs font-caption text-caption text-[#2a1d38] hover:border-[#2a1d38]" title="Print-friendly view — only the board is printed" data-oid="8e0aabbf2e">
            <Printer className="h-3.5 w-3.5" data-oid="c517dd651f" />
            Print
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              await exportBoardPng(brand);
              setExporting(false);
            }}
            className="inline-flex items-center gap-ds-xs rounded-md border border-[#e0d4f1] px-ds-sm py-ds-xs font-caption text-caption text-[#2a1d38] hover:border-[#2a1d38] disabled:opacity-50"
            title="Downloads a flat raster PNG (not editable vector layers)" data-oid="42a3cca12c"
          >
            <ImageDown className="h-3.5 w-3.5" data-oid="0537961860" />
            PNG
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-ds-lg p-ds-lg" data-oid="4d8256c782">
        <div className="flex flex-col gap-ds-sm" data-oid="929a179b3c" data-oid-text-editable="false" data-oid-text-source="element:p|element:h2|expression:44c05aad863c">
          <p className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="f3c750f1a3">{f.industry}</p>
          <h2 className="break-words text-[52px] leading-[0.95] text-[#2a1d38]" style={displayStyle} data-oid="f4c48eca96" data-oid-style-dynamic="*">{f.name}</h2>
          {f.tagline && <p className="text-[20px] italic leading-snug text-[#4a3a5c]" style={{ fontFamily: f.display.stack }} data-oid="eb3565b30e" data-oid-style-dynamic="fontFamily">{f.tagline}</p>}
        </div>

        <div className="grid h-[150px] grid-cols-[2fr_1.4fr_1fr_1fr_1fr] overflow-hidden rounded-lg" aria-label="Brand palette" data-oid="f08efba7c9">
          {brand.palette.map((sw, i) => (
            <div key={i} className="flex flex-col justify-end p-ds-sm" style={{ background: sw.hex, color: inkOn(sw.hex) }} data-oid="f1e3b70837" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="background,color">
              <span className="font-caption text-caption leading-tight opacity-80" data-oid="56e0bc9d98" data-oid-shared="true" data-oid-instance-targetable="true">{f.colors[i].name}</span>
              <span className="font-caption text-caption font-semibold" data-oid="56760534f4" data-oid-shared="true" data-oid-instance-targetable="true">{sw.hex.toUpperCase()}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_1.1fr] gap-ds-md" data-oid="2b0866cac1">
          <div className="flex flex-col justify-between gap-ds-sm rounded-lg bg-[#e6dbf6] p-ds-md" data-oid="0a26847081">
            <span className="text-[72px] leading-none text-[#2a1d38]" style={displayStyle} data-oid="14062fa100" data-oid-style-dynamic="*">Aa</span>
            <div className="flex flex-col gap-ds-xs" data-oid="f56b19beaa">
              <p className="font-caption text-caption text-[#5f5f7a]" data-oid="5511ec078e" data-oid-text-editable="false" data-oid-text-source="text|expression:1f7ac36cb000">Display · {f.display.name}</p>
              <p className="text-[14px] leading-snug text-[#2a1d38]" style={bodyStyle} data-oid="f37b9e4b0a" data-oid-text-editable="false" data-oid-text-source="text|expression:fcdef310caac|text" data-oid-style-dynamic="*">Body · {f.body.name}. The quick brown fox jumps over the lazy dog.</p>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden rounded-lg border border-[#e0d4f1]" data-oid="725c584e14">
            <div className="h-[150px]" data-oid="ee5a9e31ee">
              {f.logo && <LogoPreview direction={f.logo.direction} name={f.name} colors={colors} fontStack={f.display.stack} size="sm" variant={brand.selectedLogo} seed={f.logo.seed} />}
            </div>
            <p className="border-t border-[#e0d4f1] bg-[#f4eefb] px-ds-sm py-ds-xs font-caption text-caption text-[#5f5f7a]" data-oid="f376e435e3" data-oid-text-editable="false" data-oid-text-source="text|expression:6e99c9c38da4">Logo direction · {f.logo ? `${f.logo.title} (${f.logo.direction})` : "—"}</p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-ds-xs" aria-label="Personality keywords" data-oid="da5d82d39e" data-oid-text-editable="false" data-oid-text-source="expression:1c5d2e23033b|expression:bd16b77d5f07">
          {brand.traits.map((t) => (
            <li key={t} className="rounded-full border border-[#2a1d38]/30 px-ds-sm py-ds-xs font-caption text-caption text-[#2a1d38]" data-oid="f617783155" data-oid-shared="true" data-oid-instance-targetable="true">{t}</li>
          ))}
          {brand.traits.length === 0 && <li className="font-caption text-caption text-[#5f5f7a]" data-oid="4e0e61a66c">Pick personality words to see them here.</li>}
        </ul>

        <div className="flex flex-col gap-ds-sm">
          <p className="font-caption text-caption uppercase tracking-[0.2em] text-[#5f5f7a]">Visual language · image concepts</p>
          <ul className="flex flex-wrap gap-ds-xs" aria-label="Image concepts">
            {brand.imageConcepts.map((c) => (
              <li key={c.id} className="rounded-full border border-[#2a1d38]/30 px-ds-sm py-ds-xs font-caption text-caption text-[#2a1d38]">{c.kind} · {c.ratio}</li>
            ))}
            {brand.imageConcepts.length === 0 && <li className="font-caption text-caption text-[#5f5f7a]">Choose image concepts in step 07 to see them here.</li>}
          </ul>
        </div>

        <div className="flex flex-col gap-ds-xs border-t border-[#e0d4f1] pt-ds-md" data-oid="8fa513e17f">
          <p className="text-[15px] leading-relaxed text-[#2a1d38]" style={{ fontFamily: f.body.stack }} data-oid="52463720c6" data-oid-style-dynamic="fontFamily">{brand.description.text}</p>
          <p className="font-caption text-caption uppercase tracking-[0.16em] text-[#5f5f7a]" data-oid="6f3f92e369" data-oid-text-editable="false" data-oid-text-source="text|expression:15fcf98dcede">Voice · {brand.voice.map((v) => v.text).join(" / ")}</p>
        </div>
      </div>
    </article>
  );
}
