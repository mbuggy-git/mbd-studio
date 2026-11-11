import { useEffect, useMemo, useState } from "react";
import { AppSwitcher } from "../components/AppSwitcher";
import { BrandHeader } from "../components/brand/BrandHeader";
import { SectionNav } from "../components/brand/SectionNav";
import { BrandBoard } from "../components/brand/BrandBoard";
import { PromptStudio } from "../components/brand/PromptStudio";
import { ConceptSection } from "../components/brand/sections/ConceptSection";
import { PersonalitySection } from "../components/brand/sections/PersonalitySection";
import { ColorSection } from "../components/brand/sections/ColorSection";
import { TypographySection } from "../components/brand/sections/TypographySection";
import { LogoSection } from "../components/brand/sections/LogoSection";
import { CopySection } from "../components/brand/sections/CopySection";
import { ImagerySection } from "../components/brand/sections/ImagerySection";
import { LibrarySection } from "../components/brand/sections/LibrarySection";
import { useBrandStore } from "../lib/brand/useBrandStore";
import { applyIndustry, createBlankBrand, CONTENT_SYNC_VERSION, sectionMeta, surpriseBrand } from "../lib/brand/state";
import { aiStatus } from "../lib/brand/ai";
import { ensureFontLoaded, resolveFont } from "../lib/brand/fonts";
import type { SectionId } from "../lib/brand/types";

export default function BrandPalette() {
  const store = useBrandStore();
  const { brand, set, commit } = store;
  const [section, setSection] = useState<SectionId>("personality");
  const [panel, setPanel] = useState<"board" | "prompts">("board");
  const meta = useMemo(() => sectionMeta(brand, store.library.length), [brand, store.library.length]);
  const props = { brand, set, commit };

  // New and Open both leave the library and land on step one, so the fresh brand is in front of you.
  const backToStepOne = () => {
    setSection("personality");
    setPanel("board");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const startNew = () => {
    store.startNew();
    backToStepOne();
  };

  // Load the brand's current display/body families so previews render in the real typeface.
  const displayFont = resolveFont(brand.display, brand.traits, "display").name;
  const bodyFont = resolveFont(brand.body, brand.traits, "body").name;
  useEffect(() => {
    ensureFontLoaded(displayFont);
    ensureFontLoaded(bodyFont);
  }, [displayFont, bodyFont]);

  // Content written for a previous business type (e.g. coffee) is re-derived for the current one.
  useEffect(() => {
    if (brand.contentIndustry !== brand.industry || brand.contentSync !== CONTENT_SYNC_VERSION) set((s) => applyIndustry(s, s.industry));
  }, [brand.contentIndustry, brand.contentSync, brand.industry, set]);

  return (
    <main className="min-h-screen bg-[#614a8a]" data-oid="9b1692ae53" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true">
      <div className="mx-auto max-w-[1760px] px-ds-xl py-ds-2xl xl:px-ds-3xl" data-oid="6c75f80925">
        <AppSwitcher current="brand" />
        <BrandHeader
          onSurprise={() => commit(surpriseBrand)}
          onUndo={store.undo}
          onClear={() => {
            commit(() => createBlankBrand());
            setSection("personality");
            setPanel("board");
          }}
          canUndo={store.canUndo}
          onSave={store.saveCurrent}
          isSaved={!!store.savedId}
          library={store.library}
          onOpen={store.openBrand}
          onShowLibrary={() => setSection("library")}
          onNew={startNew}
          aiLabel={aiStatus().label} />
        

        <div className="mt-ds-2xl grid grid-cols-1 items-start gap-ds-xl lg:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[minmax(0,1fr)_560px]" data-oid="cbff30a257">
          <div className="flex min-w-0 flex-col gap-ds-lg" data-oid="a403a01012">
            <SectionNav active={section} onChange={setSection} meta={meta} />
            <div id="brand-section-panel" role="tabpanel" aria-labelledby={`brand-tab-${section}`} data-oid="18a3364446" data-oid-text-editable="false" data-oid-text-source="expression:f4181b32ff6a|expression:fcfcd1650c8f|expression:09da34f87a37|expression:9ab98621e674|expression:bfb756a930fb|expression:81041e920338|expression:b54f8de8168b|expression:094a477892b0|expression:27f4b955e1e6">
              {section === "concept" && <ConceptSection {...props} />}
              {section === "personality" && <PersonalitySection {...props} />}
              {section === "color" && <ColorSection {...props} />}
              {section === "type" && <TypographySection {...props} />}
              {section === "logo" && <LogoSection {...props} />}
              {section === "copy" && <CopySection {...props} />}
              {section === "imagery" && <ImagerySection {...props} />}
              {section === "library" &&
              <LibrarySection
                brand={brand}
                library={store.library}
                savedId={store.savedId}
                onSave={store.saveCurrent}
                onOpen={(id) => {
                  store.openBrand(id);
                  backToStepOne();
                }}
                onDuplicate={store.duplicateBrand}
                onRename={store.renameBrand}
                onDelete={store.deleteBrand}
                onNew={startNew} />

              }
            </div>
          </div>

          <aside className="flex flex-col gap-ds-md lg:sticky lg:top-ds-xl" aria-label="Brand board and prompts" data-oid="01f67b85a6">
            <div role="tablist" aria-label="Right panel" data-panel={panel} className="group relative grid grid-cols-2 rounded-full border border-[#c4b0e6] bg-white p-1 shadow-[inset_0_1px_3px_rgba(60,40,100,0.18)]" data-oid="655180adbf">
              <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-foreground shadow-[0_2px_6px_rgba(30,10,50,0.35)] transition-transform duration-300 ease-out group-data-[panel=prompts]:translate-x-full" data-oid="33006ad7bd" />
              <button
                type="button"
                role="tab"
                id="panel-tab-board"
                aria-selected={panel === "board"}
                aria-controls="brand-right-panel"
                onClick={() => setPanel("board")}
                className="relative z-10 rounded-full px-ds-lg py-ds-sm text-center font-label text-label font-medium text-[#5f5f7a] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:text-background" data-oid="99452e9bb4">
                Brand Board
              </button>
              <button
                type="button"
                role="tab"
                id="panel-tab-prompts"
                aria-selected={panel === "prompts"}
                aria-controls="brand-right-panel"
                onClick={() => setPanel("prompts")}
                className="relative z-10 rounded-full px-ds-lg py-ds-sm text-center font-label text-label font-medium text-[#5f5f7a] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-selected:text-background" data-oid="50a048ae45">Prompt Studio

              </button>
            </div>
            <div id="brand-right-panel" role="tabpanel" aria-labelledby={`panel-tab-${panel}`} data-oid="4cf61d3fad">
              {panel === "board" ?
              <BrandBoard brand={brand} /> :

              <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:rounded-xl" data-oid="984a123fb8">
                  <PromptStudio {...props} />
                </div>
              }
            </div>
          </aside>
        </div>

        <footer className="mt-ds-3xl flex flex-wrap items-center justify-between gap-ds-md border-t border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] pt-ds-lg" data-oid="2481959373">
          <p className="font-caption text-caption text-[#cfcfe6]" data-oid="ce48ef3bc8">Brand Palette — a sister app to Art Direction Palette. Invent, remix, brief.</p>
          <p className="font-caption text-caption text-[#cfcfe6]" data-oid="4af3841b45">Saved brands live in this browser only · no AI service connected</p>
        </footer>
      </div>
    </main>);

}