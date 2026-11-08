import { useState, type KeyboardEvent } from "react";
import { Camera, Dices, SearchX, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category, type CategoryId, type Term } from "../lib/vocabulary";

type Props = {
  query: string;
  selected: string[];
  onToggle: (name: string) => void;
  activeCategory: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  onGetPrompt: () => void;
  canGenerate: boolean;
  onCategorySurprise: (id: CategoryId) => void;
  onClearQuery: () => void;
};

const TOOLTIP_WIDTH = 304;

export function VocabularyBoard({
  query,
  selected,
  onToggle,
  activeCategory,
  onCategoryChange,
  onGetPrompt,
  canGenerate,
  onCategorySurprise,
  onClearQuery
}: Props) {
  const [alignRight, setAlignRight] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();

  const matches = (category: Category, t: Term) =>
  t.name.toLowerCase().includes(q) ||
  t.definition.toLowerCase().includes(q) ||
  t.phrase.toLowerCase().includes(q) ||
  category.label.toLowerCase().includes(q);

  const active = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];
  const groups = q ?
  CATEGORIES.map((category) => ({ category, terms: category.terms.filter((t) => matches(category, t)) })).filter(
    (g) => g.terms.length > 0
  ) :
  [{ category: active, terms: active.terms }];

  const measure = (name: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const shouldAlignRight = rect.left + TOOLTIP_WIDTH > window.innerWidth - 16;
    setAlignRight((prev) => prev[name] === shouldAlignRight ? prev : { ...prev, [name]: shouldAlignRight });
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = CATEGORIES.findIndex((c) => c.id === activeCategory);
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + CATEGORIES.length) % CATEGORIES.length;
    onCategoryChange(CATEGORIES[next].id);
    document.getElementById(`tab-${CATEGORIES[next].id}`)?.focus();
  };

  return (
    <div className="flex min-w-0 flex-col gap-ds-lg" data-oid="a83295c1c3" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-text-editable="false" data-oid-text-source="element:div|expression:a26de9880e78">
      <div
        role="tablist"
        aria-label="Vocabulary categories"
        onKeyDown={onTabKey}
        className="flex flex-col items-start gap-ds-md rounded-xl border border-border bg-[#ccb7ed] p-ds-md md:flex-row md:items-center md:justify-between" data-oid="d15bd7a5ab">
        <div className="grid grid-cols-2 gap-ds-sm sm:grid-cols-4">
        
        {CATEGORIES.map((category) => {
          const count = category.terms.filter((t) => selected.includes(t.name)).length;
          const isActive = !q && category.id === activeCategory;
          return (
            <button
              key={category.id}
              id={`tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="category-panel"
              tabIndex={isActive || (q && category.id === activeCategory) ? 0 : -1}
              onClick={() => {
                onCategoryChange(category.id);
                if (q) onClearQuery();
              }}
              className="inline-flex items-center justify-center gap-ds-sm rounded-full border border-border bg-white px-ds-md py-ds-sm font-label text-label font-medium text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition-colors duration-150 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:border-foreground aria-selected:bg-foreground aria-selected:text-background" data-oid="38cf42f8e2" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:span|expression:26a101576c9d|expression:d604b044a85d">
              
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", category.dotClass)} aria-hidden="true" data-oid="46779dea4e" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-classname-dynamic="true" />
              {category.short ?? category.label}
              {count > 0 &&
              <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-sm font-caption text-caption font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" aria-label={`${count} selected`} data-oid="eb9f9c8a72" data-oid-shared="true">
                  {count}
                </span>
              }
            </button>);

        })}
        </div>
        <button type="button" onClick={onGetPrompt} disabled={!canGenerate} title={canGenerate ? "Build the image prompt from your picks" : "Pick a few words first"} className="ds-button ds-button-primary h-[42px] shrink-0 rounded-lg px-ds-lg">
          <Wand2 className="h-4 w-4" />
          Get prompt
        </button>
      </div>

      {groups.length === 0 ?
      <div className="flex flex-col items-center justify-center gap-ds-sm rounded-xl border border-dashed border-border bg-[#ccb7ed] px-ds-xl py-ds-3xl text-center" data-oid="96b04e5d83">
          <SearchX className="h-8 w-8 text-[#5f5f7a]" data-oid="1b61efe79a" />
          <h2 className="font-display text-[32px] font-semibold leading-none text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="dc9a3d75ca" data-oid-text-editable="false" data-oid-text-source="text|expression:7cd9148ec5a5|text">No words match “{query}”</h2>
          <p className="text-body text-[#5f5f7a]" data-oid="07bdb038ec">Try a feeling, a material, a camera angle or a light source instead.</p>
        </div> :

      <div id="category-panel" role="tabpanel" aria-labelledby={q ? undefined : `tab-${active.id}`} className="flex flex-col gap-ds-lg" data-oid="7d721cf39a" data-oid-text-editable="false" data-oid-text-source="expression:ddc71fa87cd1|expression:39a6d1e392d9">
          {q &&
        <p className="font-caption text-caption uppercase tracking-[0.2em] text-[#cfcfe6]" data-oid="521f125eb9" data-oid-text-editable="false" data-oid-text-source="text|expression:7cd9148ec5a5|text|expression:c306c98939a1|expression:9bc2932d640b">
              Results for “{query}” across {groups.length} {groups.length === 1 ? "category" : "categories"}
            </p>
        }
          {groups.map(({ category, terms }) => {
          const count = category.terms.filter((t) => selected.includes(t.name)).length;
          const photoCount = category.terms.filter((t) => t.image).length;
          return (
            <section
              key={category.id}
              className="relative min-h-[360px] rounded-xl border border-border bg-[#ccb7ed] p-ds-xl shadow-[0_1px_0_rgba(0,0,0,0.03)]"
              aria-labelledby={`cat-${category.id}`} data-oid="13245c0361" data-oid-shared="true" data-oid-instance-targetable="true">
              
                <div className="mb-ds-xl flex flex-wrap items-start justify-between gap-ds-lg" data-oid="253653d75a" data-oid-shared="true" data-oid-instance-targetable="true">
                  <div className="flex max-w-2xl flex-col gap-ds-xs" data-oid="814b57843e" data-oid-shared="true" data-oid-instance-targetable="true">
                    <div className="flex items-center gap-ds-sm" data-oid="3c8cb7fd5a" data-oid-shared="true" data-oid-instance-targetable="true">
                      <span
                      className={cn("h-2.5 w-2.5 rounded-full", category.dotClass)}
                      style={category.id === "mood" ? { backgroundColor: "#ccf5a9" } : undefined} data-oid="4791982e2e" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-style-dynamic="*" data-oid-classname-dynamic="true" />
                    
                      <span className="font-caption text-caption font-medium uppercase tracking-[0.2em] text-[#5f5f7a]" data-oid="73c3c91ad7" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="expression:cbb29999d2c8|text|expression:f8367d98663d|text|expression:47907da26688|text">
                        {category.index} · {count > 0 ? `${count} selected` : "Choose any"} · {category.terms.length} terms
                      </span>
                    </div>
                    <h2 id={`cat-${category.id}`} className="font-display text-[44px] font-semibold leading-none tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] xl:text-[56px]" data-oid="4f5badd93a" data-oid-shared="true" data-oid-instance-targetable="true">
                      {category.label}
                    </h2>
                    <p className="max-w-lg font-label text-label font-normal text-[#5f5f7a]" data-oid="bcdc4a7467" data-oid-shared="true" data-oid-instance-targetable="true">{category.blurb}</p>
                  </div>
                  <div className="flex flex-col items-end gap-ds-sm" data-oid="344258e1d2" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="element:div|expression:d5769ccd0ecd|expression:9a94843d16ee">
                    <div className="flex -space-x-2" aria-hidden="true" data-oid="17127b5e18" data-oid-shared="true" data-oid-instance-targetable="true">
                      {category.terms.slice(0, 5).map((t) =>
                    <span key={t.name} className="h-8 w-8 rounded-full border-2 border-[color-mix(in_srgb,var(--primary)_8%,var(--background))]" style={t.swatch} data-oid="22dec5c722" data-oid-shared="true" data-oid-style-dynamic="*" />
                    )}
                    </div>
                    {q ?
                  <button
                    type="button"
                    onClick={() => {
                      onCategoryChange(category.id);
                      onClearQuery();
                    }}
                    className="ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]" data-oid="3498a7ba37" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="text|expression:26a101576c9d">
                    
                        Open {category.short ?? category.label}
                      </button> :

                  <button
                    type="button"
                    onClick={() => onCategorySurprise(category.id)}
                    title={`Adds one unexpected ${category.short ?? category.label} term — your other picks stay`}
                    className="ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]" data-oid="73d4fbdafc" data-oid-shared="true" data-oid-text-editable="false">
                    
                        <Dices className="h-4 w-4" data-oid="4b21642e19" data-oid-shared="true" />
                        Surprise me with {category.short ?? category.label}
                      </button>
                  }
                    {photoCount > 0 &&
                  <p className="inline-flex items-center gap-ds-xs font-caption text-caption text-[#5f5f7a]" data-oid="722f49281c" data-oid-shared="true" data-oid-text-editable="false">
                        <Camera className="h-3.5 w-3.5" data-oid="722a0a7da1" data-oid-shared="true" />
                        {photoCount} photo examples · hover to learn
                      </p>
                  }
                  </div>
                </div>
                <ul className="flex flex-wrap gap-ds-sm" data-oid="346cbfacf9" data-oid-shared="true" data-oid-instance-targetable="true">
                  {terms.map((term, i) => {
                  const isSelected = selected.includes(term.name);
                  return (
                    <li
                      key={term.name}
                      className="group relative"
                      data-index={i}
                      onPointerEnter={(e) => measure(term.name, e.currentTarget)}
                      onFocus={(e) => measure(term.name, e.currentTarget)} data-oid="38557e5901" data-oid-shared="true">
                      
                        <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-describedby={`tip-${category.id}-${i}`}
                        onClick={() => onToggle(term.name)}
                        className={cn(
                          "inline-flex items-center gap-ds-sm rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] py-ds-xs pl-ds-xs pr-ds-md font-label text-label font-medium text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition-all duration-150 hover:-translate-y-px hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          category.chipClass
                        )} data-oid="98f0d1e0cf" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="element:span|expression:68a3773897b1" data-oid-classname-dynamic="true">
                        
                          <span className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10" style={term.swatch} aria-hidden="true" data-oid="ab12913099" data-oid-shared="true" data-oid-style-dynamic="*" />
                          {term.name}
                        </button>
                        <div
                        id={`tip-${category.id}-${i}`}
                        role="tooltip"
                        className={cn(
                          "pointer-events-none invisible absolute bottom-full z-40 mb-ds-sm w-[min(19rem,calc(100vw-2rem))] translate-y-1 rounded-xl border border-border bg-popover p-ds-sm opacity-0 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                          alignRight[term.name] ? "right-0" : "left-0"
                        )} data-oid="b12f76962c" data-oid-shared="true" data-oid-classname-dynamic="true">
                        
                          <div className="h-2 w-full rounded-full" style={term.swatch} aria-hidden="true" />
                          <div className="flex flex-col gap-ds-xs px-ds-sm pb-ds-sm pt-ds-md" data-oid="0d3b4f9f55" data-oid-shared="true">
                            <span className="font-caption text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground" data-oid="56a5519e85" data-oid-shared="true">{category.label}</span>
                            <span className="font-display text-[28px] font-semibold leading-none text-popover-foreground" data-oid="8a4aee1b0c" data-oid-shared="true">{term.name}</span>
                            <p className="font-label text-label font-normal text-muted-foreground" data-oid="42d4f1a34d" data-oid-shared="true">{term.definition}</p>
                            <p className="mt-ds-xs border-t border-border pt-ds-sm font-caption text-caption text-muted-foreground" data-oid="d985bf9cfa" data-oid-shared="true" data-oid-text-editable="false" data-oid-text-source="text|expression:c1c5e9366b95|text">
                              In your prompt: “{term.phrase}”
                            </p>
                          </div>
                        </div>
                      </li>);

                })}
                </ul>
              </section>);

        })}
        </div>
      }
    </div>);

}
