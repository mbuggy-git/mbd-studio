import { useRef, useState } from "react";
import { AppsCard } from "../components/AppsCard";
import { AppHeader } from "../components/AppHeader";
import { DirectionPanel } from "../components/DirectionPanel";
import { VocabularyBoard } from "../components/VocabularyBoard";
import { CreativeRemix } from "../components/CreativeRemix";
import { buildPrompt } from "../lib/prompt";
import { CATEGORIES, SURPRISE_PRESETS, type CategoryId } from "../lib/vocabulary";

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/** Categories a cross-category remix always draws from, plus optional extras. */
const REMIX_CORE: CategoryId[] = ["mood", "style", "lighting", "camera", "color"];
const REMIX_OPTIONAL: { id: CategoryId; chance: number }[] = [
  { id: "texture", chance: 0.6 },
  { id: "composition", chance: 0.4 },
  { id: "subject", chance: 0.35 },
];

const TOTAL = CATEGORIES.reduce((n, c) => n + c.terms.length, 0);

export default function Index({ view }: { view: "vocabulary" | "remix" }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [output, setOutput] = useState("");
  const [seed, setSeed] = useState(0);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("mood");
  const lastPreset = useRef(-1);

  const toggle = (name: string) =>
  setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

  // Overall Creative Remix: explicitly replaces picks with a cross-category combination.
  const surprise = () => {
    if (Math.random() < 0.3) {
      let next = Math.floor(Math.random() * SURPRISE_PRESETS.length);
      if (next === lastPreset.current) next = (next + 1) % SURPRISE_PRESETS.length;
      lastPreset.current = next;
      setSelected(SURPRISE_PRESETS[next]);
      return;
    }
    const ids = [...REMIX_CORE, ...REMIX_OPTIONAL.filter((o) => Math.random() < o.chance).map((o) => o.id)];
    const combo = ids.flatMap((id) => {
      const category = CATEGORIES.find((c) => c.id === id);
      return category ? [pick(category.terms).name] : [];
    });
    setSelected(combo);
  };

  // Contextual surprise: adds one unexpected term from a single category, keeping everything else.
  const surpriseCategory = (id: CategoryId) => {
    const category = CATEGORIES.find((c) => c.id === id);
    if (!category) return;
    const fresh = category.terms.filter((t) => !selected.includes(t.name));
    if (fresh.length === 0) return;
    const term = pick(fresh);
    setSelected((prev) => [...prev, term.name]);
  };

  const jumpToCategory = (id: CategoryId) => {
    setQuery("");
    setActiveCategory(id);
    document.getElementById("vocabulary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generate = () => setOutput(buildPrompt(brief, selected, seed));

  const regenerate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setOutput(buildPrompt(brief, selected, nextSeed));
  };

  return (
    <main className="min-h-screen bg-[color-mix(in_srgb,var(--primary)_16%,var(--background))]" data-oid="0dd563991d" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" style={{ backgroundColor: "#614a8a" }}>
      <div className="mx-auto max-w-[1720px] px-ds-xl py-ds-2xl xl:px-ds-3xl" data-oid="64cc3d8886" data-oid-text-editable="false" data-oid-text-source="expression:5165575bbbf9|expression:cec0ea56eb49|element:footer">
        {view === "vocabulary" && <>
        <AppHeader
          query={query}
          onQueryChange={setQuery}
          onSurprise={surprise}
          onClearAll={() => {
            setSelected([]);
            setOutput("");
            setBrief("");
            setQuery("");
            setSeed(0);
          }}
          selectedCount={selected.length}
          totalCount={TOTAL} />
        
        <div id="vocabulary" className="mt-ds-2xl scroll-mt-ds-xl grid grid-cols-1 items-start gap-ds-xl lg:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_540px]" data-oid="3720033362">
          <VocabularyBoard
            query={query}
            selected={selected}
            onToggle={toggle}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onCategorySurprise={surpriseCategory}
            onClearQuery={() => setQuery("")} />
          <div className="flex flex-col gap-ds-xl lg:sticky lg:top-ds-xl" data-oid="7d1a6e69f3">
            <AppsCard />
            <DirectionPanel
              brief={brief}
              onBriefChange={setBrief}
              selected={selected}
              onRemove={toggle}
              onJumpCategory={jumpToCategory}
              onClearSelection={() => setSelected([])}
              output={output}
              onOutputChange={setOutput}
              onGenerate={generate}
              onRegenerate={regenerate}
              onClearOutput={() => setOutput("")} />
            
          </div>
        </div>
        </>}
        {view === "remix" && <CreativeRemix />}
        <footer className="mt-ds-3xl flex items-center justify-between border-t border-border pt-ds-lg" data-oid="5aac26680b">
          <p className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="5005f86da7">Art Direction Palette — find the words for what you already see.</p>
          <p className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="7b11a4a4a5" data-oid-text-editable="false" data-oid-text-source="expression:5c6505ae3c86|text|expression:69aa634b62af|text">{TOTAL} terms across {CATEGORIES.length} categories · hover any word for its meaning</p>
        </footer>
      </div>
    </main>);

}