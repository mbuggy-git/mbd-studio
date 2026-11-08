import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Search, Shuffle } from "lucide-react"
import { cn } from "@/lib/utils"
import { REMIX_VOCAB, findTerm, type IngredientKey } from "../lib/remix"

type Props = {
  ingredient: IngredientKey
  index: string
  label: string
  hint: string
  value: string
  onShuffle: () => void
  onChoose: (name: string) => void
  accentClass: string
  glowClass: string
}

const swap = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.2 } },
}

export function IngredientCard({
  ingredient,
  index,
  label,
  hint,
  value,
  onShuffle,
  onChoose,
  accentClass,
  glowClass,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const term = findTerm(ingredient, value)
  const options = REMIX_VOCAB[ingredient].filter((o) =>
    `${o.name} ${o.note}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="group relative flex min-h-[340px] flex-col rounded-xl border border-border bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))] p-ds-xl shadow-[0_24px_60px_-34px_rgba(0,0,0,0.3)] transition-[border-color,box-shadow] duration-300" data-oid="73fb436cb5" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="element:div|element:div|element:button|expression:ad58c3ea6fb0"
    >
      <div className={cn("pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-40 blur-3xl", glowClass)} data-oid="5da145ff84" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-classname-dynamic="true" />

      <div className="relative flex items-start justify-between gap-ds-md" data-oid="03bb5d6b3b" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
        <div className="flex flex-col gap-ds-xs" data-oid="1a27045633" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          <span className={cn("font-caption text-caption font-semibold uppercase tracking-[0.24em]", accentClass)} data-oid="9743f09157" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-classname-dynamic="true">{index}</span>
          <h3 className="font-heading text-heading font-semibold text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="17b1b69653" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{label}</h3>
          <p className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="c2e97c3f65" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{hint}</p>
        </div>
        <div className="flex items-center gap-ds-xs" data-oid="3f055580dd" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          <button
            type="button"
            onClick={onShuffle}
            aria-label={`Shuffle ${label}`}
            title="Shuffle this ingredient"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] transition hover:rotate-180 hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:rotate-0" data-oid="a538d11995" data-oid-callsite-deletable="true" data-oid-callsite-editable="true"
          >
            <Shuffle className="h-4 w-4" data-oid="1325065d8d" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setQuery("")
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="relative mt-auto flex w-full flex-col items-start gap-ds-sm rounded-lg pt-ds-xl text-left" data-oid="ad1b3ac32b" data-oid-callsite-deletable="true" data-oid-callsite-editable="true"
      >
        <div className="relative min-h-[130px] w-full overflow-hidden" data-oid="3c492e77e1" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={value} variants={swap} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-ds-sm" data-oid="c75e0faabb" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
              <span className="font-display text-[48px] font-semibold leading-[0.95] tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] underline-offset-8 group-hover:underline xl:text-[56px]" data-oid="4804da7469" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
                {term.name}
              </span>
              <span className="font-label text-label font-normal text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="89694feaa5" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{term.note}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="inline-flex items-center gap-ds-xs font-caption text-caption font-medium uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]" data-oid="464c6e2680" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          Choose a term <ChevronDown className="h-3 w-3" data-oid="1d810bdb57" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />
        </span>
      </button>

      {open && (
        <div className="absolute inset-x-ds-md top-[calc(100%-1rem)] z-30 flex flex-col gap-ds-sm rounded-lg border border-border bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))] p-ds-sm shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]" data-oid="02b841a748" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
          <div className="relative" data-oid="7889fba892" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
            <Search className="pointer-events-none absolute left-ds-md top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="b683083c08" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${REMIX_VOCAB[ingredient].length} ${label.toLowerCase()} terms`}
              aria-label={`Search ${label}`}
              className="ds-input w-full bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] pl-10" data-oid="9a11de1c74" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-attr-dynamic="placeholder"
            />
          </div>
          <ul role="listbox" className="ds-listbox max-h-72 bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] overflow-y-auto" data-oid="8957da38f2" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="expression:393ab7350351|expression:503e00d11df4">
            {options.length === 0 && <li className="px-ds-md py-ds-sm font-label text-label text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="efca0f49fa" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">No matches</li>}
            {options.map((o, i) => (
              <li
                key={o.name}
                role="option"
                data-index={i}
                aria-selected={o.name === value}
                onClick={() => {
                  onChoose(o.name)
                  setOpen(false)
                }}
                className="ds-listbox-option flex cursor-pointer flex-col items-start" data-oid="b1266d575c" data-oid-shared="true"
              >
                <span className="font-label text-label font-semibold" data-oid="3ddd7464da" data-oid-shared="true">{o.name}</span>
                <span className="font-caption text-caption text-[color-mix(in_srgb,var(--primary)_30%,var(--muted-foreground))]" data-oid="2d125804af" data-oid-shared="true">{o.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
