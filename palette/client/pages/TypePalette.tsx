import { useEffect, useState } from "react";
import { TypeHeader } from "../components/type/TypeHeader";
import { TypeTabs } from "../components/type/TypeTabs";
import { OptionSwitch } from "../components/type/OptionSwitch";
import { FontSlotPanel } from "../components/type/FontSlotPanel";
import { TypeColorPanel } from "../components/type/TypeColorPanel";
import { TypeLibrary } from "../components/type/TypeLibrary";
import { TypePreview, type GroundMode } from "../components/type/TypePreview";
import { ensureFontLoaded, resolveFont } from "../lib/brand/fonts";
import { duplicateInLibrary, loadLibrary, saveToLibrary, storeLibrary, type SavedType } from "../lib/type/library";
import {
  blankState,
  createOption,
  clearOption,
  loadState,
  MAX_OPTIONS,
  OPTION_LABELS,
  remixOption,
  saveState,
  type TypeOption,
  type TypeState,
  type TypeTab,
} from "../lib/type/state";

export default function TypePalette() {
  const [state, setState] = useState<TypeState>(loadState);
  const [tab, setTab] = useState<TypeTab>("display");
  const [mode, setMode] = useState<GroundMode>("both");
  const [library, setLibrary] = useState<SavedType[]>(loadLibrary);
  const [showLibrary, setShowLibrary] = useState(false);
  // Undo covers the big moves (Surprise Me, clear, new, open, remove), not every keystroke or slider nudge.
  const [history, setHistory] = useState<TypeState[]>([]);
  const { options, headline, body } = state;
  const activeIndex = Math.max(0, options.findIndex((o) => o.id === state.activeId));
  const active = options[activeIndex];
  const activeLabel = OPTION_LABELS[activeIndex];

  useEffect(() => saveState(state), [state]);

  // Load every family currently in use so the previews render in the real typefaces.
  const families = options
    .flatMap((o) => [resolveFont(o.display, [], "display").name, resolveFont(o.body, [], "body").name])
    .join("|");
  useEffect(() => {
    families.split("|").forEach(ensureFontLoaded);
  }, [families]);

  const updateActive = (fn: (o: TypeOption) => TypeOption) =>
    setState((s) => ({ ...s, options: s.options.map((o) => (o.id === active.id ? fn(o) : o)) }));

  /** A change Undo can take back. */
  const commit = (fn: (s: TypeState) => TypeState) => {
    setHistory((h) => [...h.slice(-29), state]);
    setState(fn);
  };
  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setState(prev);
  };

  const updateLibrary = (list: SavedType[]) => {
    setLibrary(list);
    storeLibrary(list);
  };
  const savedId = library.some((s) => s.id === state.savedId) ? state.savedId ?? null : null;
  const save = () => {
    const { list, id } = saveToLibrary(library, state);
    updateLibrary(list);
    setState((s) => ({ ...s, savedId: id }));
  };
  const startNew = () => {
    commit(() => blankState());
    setTab("display");
    setShowLibrary(false);
  };

  const select = (id: string) => setState((s) => ({ ...s, activeId: id }));

  const add = () =>
    setState((s) => {
      if (s.options.length >= MAX_OPTIONS) return s;
      const next = createOption(s.options.length);
      return { ...s, options: [...s.options, next], activeId: next.id };
    });

  const remove = (id: string) =>
    commit((s) => {
      if (s.options.length <= 1) return s;
      const options = s.options.filter((o) => o.id !== id);
      return { ...s, options, activeId: s.activeId === id ? options[0].id : s.activeId };
    });

  return (
    <main className="min-h-screen bg-[#954b9d]">
      <div className="mx-auto max-w-[1760px] px-ds-xl py-ds-2xl xl:px-ds-3xl">
        <TypeHeader
          onSurprise={() => commit((s) => ({ ...s, options: s.options.map((o) => (o.id === active.id ? remixOption(o) : o)) }))}
          onShowLibrary={() => setShowLibrary(true)}
          onNew={startNew}
          onSave={save}
          isSaved={!!savedId}
          onUndo={undo}
          canUndo={history.length > 0}
          onClear={() => {
            commit((s) => ({ ...blankState(), savedId: s.savedId }));
            setTab("display");
          }} />

        <div className="mt-ds-2xl grid grid-cols-1 items-start gap-ds-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-ds-lg">
            {showLibrary ? (
              <TypeLibrary
                library={library}
                savedId={savedId}
                onSave={save}
                onOpen={(id) => {
                  const saved = library.find((s) => s.id === id);
                  if (!saved) return;
                  commit(() => JSON.parse(JSON.stringify({ ...saved.state, savedId: id })) as TypeState);
                  setShowLibrary(false);
                }}
                onDuplicate={(id) => updateLibrary(duplicateInLibrary(library, id))}
                onRename={(id, name) => updateLibrary(library.map((s) => (s.id === id ? { ...s, name } : s)))}
                onDelete={(id) => updateLibrary(library.filter((s) => s.id !== id))}
                onNew={startNew}
                onClose={() => setShowLibrary(false)} />
            ) : (<>
            <OptionSwitch options={options} activeId={active.id} onSelect={select} onAdd={add} />
            <TypeTabs active={tab} onChange={setTab} />
            <div id="type-step-panel" role="tabpanel" aria-labelledby={`type-tab-${tab}`}>
              {tab === "display" && (
                <FontSlotPanel
                  role="display"
                  option={active}
                  optionLabel={activeLabel}
                  onChange={updateActive}
                  copy={headline}
                  onCopyChange={(v) => setState((s) => ({ ...s, headline: v }))}
                />
              )}
              {tab === "body" && (
                <FontSlotPanel
                  role="body"
                  option={active}
                  optionLabel={activeLabel}
                  onChange={updateActive}
                  copy={body}
                  onCopyChange={(v) => setState((s) => ({ ...s, body: v }))}
                />
              )}
              {tab === "color" && <TypeColorPanel option={active} optionLabel={activeLabel} onChange={updateActive} />}
            </div>
            </>)}
          </div>

          <aside aria-label="Live type preview" className="lg:sticky lg:top-ds-xl lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-ds-xs">
            <TypePreview
              options={options}
              activeId={active.id}
              onSelect={select}
              onRemove={remove}
              onClear={(id) => commit((s) => ({ ...s, options: s.options.map((o) => (o.id === id ? clearOption(o) : o)) }))}
              onAdd={add}
              headline={headline}
              body={body}
              mode={mode}
              onModeChange={setMode}
            />
          </aside>
        </div>

        <footer className="mt-ds-3xl flex flex-wrap items-center justify-between gap-ds-md border-t border-[#b77fbe] pt-ds-lg">
          <p className="font-caption text-caption text-[#f0dcf2]">Type Palette — a sister app to Brand Palette. Pick, pair, color, compare.</p>
          <p className="font-caption text-caption text-[#f0dcf2]">All families are open-source on Google Fonts · your options are saved in this browser</p>
        </footer>
      </div>
    </main>
  );
}
