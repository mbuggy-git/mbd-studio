import { Dices, Eraser } from "lucide-react";
import { ChipPicker, LockButton, SectionShell, SubPanel, softButton } from "../ui";
import type { SectionProps } from "./types";
import { BRAND_GROUPS, findTerm, type TermGroup } from "../../../lib/brand/vocab";
import { listJoin, pickR } from "../../../lib/brand/random";
import { surpriseTraits } from "../../../lib/brand/state";
import { IndustryPanel } from "./IndustryPanel";
import { newSeed } from "../../../lib/brand/random";

/** Pairings that keep a surprise coherent: a term from the group that shares a color or font hint with existing picks. */
function coherentPick(group: TermGroup, selected: string[]): string | null {
  const fresh = group.terms.filter((t) => !selected.includes(t.name));
  if (!fresh.length) return null;
  const hints = new Set(selected.flatMap((n) => { const t = findTerm(n); return t ? [t.color, ...t.fonts] : []; }));
  const related = fresh.filter((t) => hints.has(t.color) || t.fonts.some((x) => hints.has(x)));
  // 30% of the time go fully unexpected.
  const pool = related.length && Math.random() > 0.3 ? related : fresh;
  return pickR(Math.random, pool).name;
}

export function PersonalitySection({ brand, set, commit }: SectionProps) {
  const toggle = (name: string) =>
    set((s) => (s.traitsLocked ? s : { ...s, traits: s.traits.includes(name) ? s.traits.filter((t) => t !== name) : [...s.traits, name] }));

  const influence = brand.traits.slice(0, 4).map((n) => findTerm(n)).filter(Boolean);

  return (
    <SectionShell
      index="01 · Business & personality"
      title="Find its character"
      blurb="Say what the business is, then pick as many words as feel right. They steer name ideas, palette suggestions, font recommendations, copy voice and every prompt."
      actions={
        <>
          <button type="button" className={softButton} onClick={() => commit((s) => ({ ...s, traits: surpriseTraits(newSeed()) }))} data-oid="2006198479" data-oid-classname-dynamic="true">
            <Dices className="h-4 w-4" data-oid="b12b018290" />
            Surprise combination
          </button>
          <button type="button" className={softButton} disabled={!brand.traits.length} onClick={() => commit((s) => ({ ...s, traits: [] }))} data-oid="a2c844bfa7" data-oid-classname-dynamic="true">
            <Eraser className="h-4 w-4" data-oid="2f48250976" />
            Clear
          </button>
          <LockButton locked={brand.traitsLocked} onToggle={() => set((s) => ({ ...s, traitsLocked: !s.traitsLocked }))} label="personality words" />
        </>
      }
    >
      <IndustryPanel brand={brand} set={set} commit={commit} />
      {BRAND_GROUPS.map((group) => {
        const count = group.terms.filter((t) => brand.traits.includes(t.name)).length;
        return (
          <SubPanel
            key={group.id}
            title={group.label}
            hint={`${group.blurb} · ${count} selected`}
            actions={
              <button
                type="button"
                className={softButton}
               
                onClick={() => {
                  const pick = coherentPick(group, brand.traits);
                  if (pick) commit((s) => ({ ...s, traits: [...s.traits, pick] }));
                }}
                title={`Adds one unexpected but coherent ${group.label.toLowerCase()} word`} data-oid="480f0b7d29" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-classname-dynamic="true"
              >
                <Dices className="h-4 w-4" data-oid="5f630c94e6" data-oid-shared="true" data-oid-instance-targetable="true" />
                Surprise me
              </button>
            }
          >
            <ChipPicker terms={group.terms} selected={brand.traits} onToggle={toggle} idPrefix={`p-${group.id}`} groupLabel={group.label} />
          </SubPanel>
        );
      })}

      {influence.length > 0 && (
        <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] p-ds-lg" data-oid="6d78cce9ee">
          <h3 className="font-heading text-heading text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="8256bd8b1d">How your words shape the brand</h3>
          <ul className="mt-ds-md grid grid-cols-1 gap-ds-sm md:grid-cols-2" data-oid="8839879755">
            {influence.map((t) => (
              <li key={t!.name} className="flex gap-ds-sm" data-oid="9b2ef17470" data-oid-shared="true" data-oid-instance-targetable="true">
                <span className="mt-1 h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: t!.swatch }} aria-hidden="true" data-oid="b48f4e8be4" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="background" />
                <p className="font-label text-label text-[#5f5f7a]" data-oid="db33fa2c41" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:strong|expression:049a6dca538c|text|expression:59d9fd85b64e|text">
                  <strong className="font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="0b57095804" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:a2b36022dc92|text">{t!.name}:</strong> {t!.influence} Voice leans {listJoin(t!.voice.slice(0, 2))}.
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionShell>
  );
}
