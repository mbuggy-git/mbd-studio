import { Search, Shuffle, X } from "lucide-react";
import { ConfirmClearButton } from "./ConfirmClearButton";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onSurprise: () => void;
  onClearAll: () => void;
  selectedCount: number;
  totalCount: number;
};

export function AppHeader({ query, onQueryChange, onSurprise, onClearAll, selectedCount, totalCount }: Props) {
  return (
    <header className="grid grid-cols-1 items-end gap-ds-xl border-b border-border pb-ds-2xl lg:grid-cols-[1.4fr_1fr]" data-oid="16c9cd25fc" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      <div className="flex flex-col gap-ds-md" data-oid="1a40fe62e7">
        <p className="font-caption text-caption font-medium uppercase tracking-[0.24em] text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="819c8f61db" style={{ color: "#d5e4e6" }}>
          A visual thesaurus for art directors · Brought to you by <a href="https://mbd.studio" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white" data-oid="9b13e48b7d">MBD.studio</a>
        </p>
        <h1 className="font-display text-[64px] font-semibold leading-[0.9] tracking-[-0.02em] text-primary xl:text-[112px]" data-oid="4ea119445e">
          Art Direction <em className="text-primary" data-oid="74dcf6ef49" style={{ color: "#cfe0e0", fontStyle: "normal" }}>Palette</em>
        </h1>
      </div>
      <div className="flex flex-col gap-ds-lg" data-oid="afc2fcba4b">
        <p className="max-w-md text-body text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="ff47c8eb7f" style={{ color: "#d5e4e6" }}>
          You can see it — now say it. Hover a word to see what it means, collect the ones that
          match the picture in your head, and turn them into a precise image prompt.
        </p>
        <div className="flex items-center gap-ds-sm" data-oid="b3b8a95fff">
          <div className="relative flex-1" data-oid="75c60573f6" data-oid-text-editable="false">
            <Search className="pointer-events-none absolute left-ds-md top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="9d02c84572" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search all categories — try “glow”, “angle” or “print”"
              aria-label="Search vocabulary"
              className="ds-input w-full rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] pl-10 pr-10" data-oid="215b366a7e" />
            
            {query &&
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-ds-sm top-1/2 -translate-y-1/2 rounded-full p-ds-xs text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))] hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] hover:text-primary" data-oid="36aa86710f">
              
                <X className="h-4 w-4" data-oid="9a21bf8fad" />
              </button>
            }
          </div>
          <button type="button" onClick={onSurprise} title="Creative Remix: replaces your picks with a fresh combination across categories" className="ds-button ds-button-primary h-[42px] rounded-lg px-ds-lg" data-oid="b2e1f6cd44">
            <Shuffle className="h-4 w-4" data-oid="6d9b7d0325" />
            Remix All
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-ds-sm" data-oid="dd260305fa">
        <ConfirmClearButton
          onConfirm={onClearAll}
          title="Start over?"
          message="This clears every selected word, your brief, the search and the generated prompt." />
        <p className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="e29f1499c0" data-oid-text-editable="false" data-oid-text-source="expression:e492821252e6|text|expression:9458287cdcd6|text" style={{ color: "#d5e4e6" }}>
          {selectedCount} of {totalCount} words selected · Remix All replaces your picks
        </p>
        </div>
      </div>
    </header>);

}