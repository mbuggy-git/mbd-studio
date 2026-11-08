import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Beaker, Check, Copy, FlaskConical, Heart, Sparkles, Trash2, Wand2, Zap } from "lucide-react";
import { IngredientCard } from "./IngredientCard";
import { AppSwitcher } from "./AppSwitcher";
import {
  buildConcept,
  buildRemixPrompt,
  isContrasting,
  randomTerm,
  remix,
  type Combo,
  type IngredientKey } from
"../lib/remix";

const STORAGE_KEY = "adp-remix-favorites";
type Favorite = Combo & {id: string;subject: string;};

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
};

const initialCombo = (): Combo =>
remix({ style: "", influence: "", treatment: "" }, { style: false, influence: false, treatment: false });

function loadFavorites(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Favorite[];
  } catch {
    return [];
  }
}

const NONE_LOCKED: Record<IngredientKey, boolean> = { style: false, influence: false, treatment: false };

export function CreativeRemix() {
  const [combo, setCombo] = useState<Combo>(initialCombo);
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);
  const [mixCount, setMixCount] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const concept = buildConcept(combo, subject);
  const contrasting = isContrasting(combo);
  const isSaved = favorites.some((f) => f.style === combo.style && f.influence === combo.influence && f.treatment === combo.treatment);

  const mix = (wild = false) => {
    setCombo((c) => remix(c, NONE_LOCKED, wild));
    setMixCount((n) => n + 1);
  };
  const shuffleOne = (key: IngredientKey) => setCombo((c) => ({ ...c, [key]: randomTerm(key, c[key]) }));
  const choose = (key: IngredientKey, name: string) => setCombo((c) => ({ ...c, [key]: name }));

  const generate = () => {
    const next = seed + 1;
    setSeed(next);
    setPrompt(buildRemixPrompt(combo, subject, next));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const area = document.createElement("textarea");
      area.value = prompt;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const save = () => {
    if (isSaved) return;
    setFavorites((f) => [{ ...combo, subject, id: `${Date.now()}` }, ...f].slice(0, 12));
  };

  return (
    <section id="creative-remix" className="relative mt-ds-3xl scroll-mt-ds-xl overflow-hidden rounded-xl border border-border bg-[#d6c7ee] p-ds-xl xl:p-ds-3xl" data-oid="4753c05ae0" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" style={{ borderColor: "#c0c0cf" }}>
      <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_12%_0%,color-mix(in_srgb,var(--secondary)_14%,transparent),transparent_40%),radial-gradient(circle_at_90%_10%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_40%),radial-gradient(circle_at_50%_100%,color-mix(in_srgb,var(--warning)_12%,transparent),transparent_45%)]" data-oid="ed8208e7ba" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" data-oid="ac184c8fa7" />

      <div className="relative flex flex-col gap-ds-2xl" data-oid="1ead82ec07">
        <div className="grid grid-cols-1 items-center gap-ds-xl lg:grid-cols-[1.3fr_1fr]" data-oid="656a65da23">
          <div className="flex flex-col gap-ds-md" data-oid="8a8e08429c">
            <p className="inline-flex items-center gap-ds-sm font-caption text-caption font-medium uppercase tracking-[0.24em] text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="149cc91171">
              <FlaskConical className="h-4 w-4 text-primary" data-oid="22e2b1d500" />
              The mixing lab · Brought to you by <a href="https://mbd.studio" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground" data-oid="f6105815c9">MBD.studio</a>
            </p>
            <h2 className="font-display text-[56px] font-semibold leading-[0.9] tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] xl:text-[88px]" data-oid="74373510d2">
              Creative <em className="text-accent" data-oid="edbc23e766">Remix</em>
            </h2>
            <p className="max-w-xl text-body text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="5e9db15555">
              Three ingredients, one unexpected direction. Shuffle one card or all three, and let a
              style collide with an influence and a mood you’d never have paired yourself.
            </p>
          </div>
          <div className="flex flex-col gap-ds-lg lg:items-end" data-oid="24818ddbf8">
          <AppSwitcher current="remix" className="flex flex-wrap items-center gap-ds-sm lg:justify-end" />
          <div className="flex flex-wrap items-center gap-ds-sm lg:justify-end" data-oid="9ff7f2ad66">
            <button
              type="button"
              onClick={() => mix(false)}
              className="ds-button ds-button-primary h-14 rounded-lg px-ds-xl text-body" data-oid="38a019bcda">
              
              <Beaker className="h-5 w-5" data-oid="1f3c5447d5" />
              Mix It Up
            </button>
            <button
              type="button"
              onClick={() => mix(true)}
              className="ds-button h-14 rounded-lg border border-foreground bg-foreground px-ds-xl text-body text-background hover:opacity-90" data-oid="0adbb091cc">
              
              <Zap className="h-5 w-5" data-oid="7ff6d93112" />
              Surprise Me
            </button>
          </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 gap-ds-lg md:grid-cols-3" data-oid="22468c3b7b">
          <IngredientCard
            ingredient="style"
            index="01 · Base"
            label="Style"
            hint="Art movements, illustration styles, design aesthetics"
            value={combo.style}
            onShuffle={() => shuffleOne("style")}
            onChoose={(n) => choose("style", n)}
            accentClass="text-primary"
            glowClass="bg-primary" />
          
          <IngredientCard
            ingredient="influence"
            index="02 · Catalyst"
            label="Influence"
            hint="Unexpected subjects, eras, or visual concepts"
            value={combo.influence}
            onShuffle={() => shuffleOne("influence")}
            onChoose={(n) => choose("influence", n)}
            accentClass="text-accent"
            glowClass="bg-accent" />
          
          <IngredientCard
            ingredient="treatment"
            index="03 · Finish"
            label="Mood & Treatment"
            hint="Lighting, color, texture, and atmosphere"
            value={combo.treatment}
            onShuffle={() => shuffleOne("treatment")}
            onChoose={(n) => choose("treatment", n)}
            accentClass="text-warning"
            glowClass="bg-warning" />
          
        </div>

        <div className="grid grid-cols-1 items-start gap-ds-xl lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" data-oid="aac7fc6073">
          <div className="flex flex-col gap-ds-lg rounded-xl border border-border bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))] p-ds-xl" data-oid="608b3c80f0">
            <div className="flex items-center justify-between gap-ds-md" data-oid="827c930d88" data-oid-text-editable="false" data-oid-text-source="element:h3|expression:61147b07a313">
              <h3 className="inline-flex items-center gap-ds-sm font-label text-label font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="63e5e3a878">
                <Sparkles className="h-4 w-4 text-primary" data-oid="5b375fbd41" />
                The concept
              </h3>
              {contrasting ?
              <span className="rounded-full bg-warning/15 px-ds-md py-ds-xs font-caption text-caption font-semibold text-warning" data-oid="1181e8de09">Contrast reaction</span> :

              <span className="rounded-full bg-accent/15 px-ds-md py-ds-xs font-caption text-caption font-semibold text-accent" data-oid="ac58d22863">Harmonious blend</span>
              }
            </div>
            <div className="min-h-[120px]" data-oid="b4b4753319">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={concept} variants={fade} initial="initial" animate="animate" exit="exit" data-oid="52383293c7">
                  <p className="font-display text-[30px] font-medium leading-[1.2] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] xl:text-[34px]" data-oid="0bfc61a9dc">{concept}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="ds-field" data-oid="6dd6b6281c">
              <label htmlFor="remix-subject" className="ds-field-label" data-oid="bb0e40c159">What are you creating? (optional)</label>
              <input
                id="remix-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="a concert poster, a perfume ad, a portrait, a book cover…"
                className="ds-input bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))]" data-oid="680bcdba00" />
              
            </div>
            <div className="flex flex-wrap gap-ds-sm" data-oid="b5aa6126a6">
              <button type="button" onClick={generate} className="ds-button ds-button-primary h-12 flex-1 rounded-lg text-body" data-oid="e2cfec53d2">
                <Wand2 className="h-4 w-4" data-oid="10d8a71717" />
                Generate Prompt
              </button>
              <button
                type="button"
                onClick={save}
                aria-pressed={isSaved}
                className="ds-button ds-button-secondary h-12 rounded-lg bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-ds-lg text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-pressed:border-destructive aria-pressed:text-destructive" data-oid="4d2b878b50" data-oid-text-editable="false">
                
                <Heart className={isSaved ? "h-4 w-4 fill-current" : "h-4 w-4"} data-oid="6a6535ad33" data-oid-classname-dynamic="true" />
                {isSaved ? "Saved" : "Save combo"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-ds-sm rounded-xl border border-border bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))] p-ds-xl" data-oid="f8708b7b60">
            <div className="flex items-center justify-between" data-oid="57b17947d5">
              <label htmlFor="remix-prompt" className="font-label text-label font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="6a7b6de8c6">Remix prompt</label>
              <span className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="592bd66e29" data-oid-text-editable="false" data-oid-text-source="expression:90082c0afbe9|text">{mixCount} mixes this session</span>
            </div>
            <textarea
              id="remix-prompt"
              rows={9}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Hit Generate Prompt to turn this combination into a detailed image-generation prompt."
              className="ds-input resize-y bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] p-ds-md text-body leading-[1.55] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="8a510977e1" />
            
            <button type="button" onClick={copy} disabled={!prompt} className="ds-button rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] hover:border-foreground hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]" data-oid="0a9e1cd7ab" data-oid-text-editable="false" data-oid-text-source="expression:38dbdb057c74|expression:e562b1923d4d">
              {copied ? <Check className="h-4 w-4 text-success" data-oid="3c3202e7a5" /> : <Copy className="h-4 w-4" data-oid="9903fd93ad" />}
              {copied ? "Copied" : "Copy Prompt"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-ds-md" data-oid="20d1c907c2" data-oid-text-editable="false" data-oid-text-source="element:h3|expression:fd1a61cd6c97">
          <h3 className="inline-flex items-center gap-ds-sm font-label text-label font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="c6a62fe54f" data-oid-text-editable="false">
            <Heart className="h-4 w-4 text-destructive" data-oid="b41d96b03a" />
            Favorite combinations · {favorites.length}
          </h3>
          {favorites.length === 0 ?
          <p className="rounded-lg border border-dashed border-border px-ds-md py-ds-lg font-label text-label font-normal text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="38d3914f3b">
              Saved recipes will collect here. Click one to load it back onto the bench.
            </p> :

          <ul className="grid grid-cols-1 gap-ds-sm md:grid-cols-2 xl:grid-cols-4" data-oid="5501c67abd">
              {favorites.map((fav, index) =>
            <li key={fav.id} data-index={index} className="group flex items-start gap-ds-sm rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))] p-ds-md transition hover:border-foreground" data-oid="893f46dafd" data-oid-shared="true" data-oid-instance-targetable="true">
                  <button
                type="button"
                onClick={() => {
                  setCombo({ style: fav.style, influence: fav.influence, treatment: fav.treatment });
                  setSubject(fav.subject);
                }}
                className="flex flex-1 flex-col items-start gap-ds-xs text-left" data-oid="5edafa877c" data-oid-shared="true" data-oid-instance-targetable="true">
                
                    <span className="font-display text-[22px] font-semibold leading-tight text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="bd9cec698b" data-oid-shared="true" data-oid-instance-targetable="true">{fav.style}</span>
                    <span className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="a4524b5886" data-oid-shared="true" data-oid-instance-targetable="true" data-oid-text-editable="false" data-oid-text-source="text|expression:0736c0845a4b|text|expression:f18c863d6608">
                      × {fav.influence} · {fav.treatment}
                    </span>
                  </button>
                  <button
                type="button"
                aria-label="Remove favorite"
                onClick={() => setFavorites((f) => f.filter((x) => x.id !== fav.id))}
                className="rounded-full p-ds-xs text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))] opacity-0 transition hover:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] hover:text-destructive group-hover:opacity-100" data-oid="d074fb3658" data-oid-shared="true" data-oid-instance-targetable="true">
                
                    <Trash2 className="h-4 w-4" data-oid="637c2cb4fe" data-oid-shared="true" data-oid-instance-targetable="true" />
                  </button>
                </li>
            )}
            </ul>
          }
        </div>
      </div>
    </section>);

}