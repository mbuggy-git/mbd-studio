import { contrastRatio } from "../../lib/brand/color";

const AA_TEXT = 4.5;

/** Small ratio pill next to a text sample: green at 4.5:1 or better, amber below. */
export function ContrastBadge({ fg, bg }: { fg: string; bg: string }) {
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= AA_TEXT;
  return (
    <span
      title={ok ? "Meets WCAG AA for body text (4.5:1)" : "Below 4.5:1 — hard to read at text sizes"}
      className="inline-flex items-center rounded-full px-2 py-0.5 font-caption text-[11px] leading-none ring-1"
      style={{ background: ok ? "#e7f6ec" : "#fff1d6", color: ok ? "#1f6b3a" : "#8a5a00", boxShadow: "none", borderColor: "transparent" }}
    >
      {ratio.toFixed(1)}:1 {ok ? "✓" : "low"}
    </span>
  );
}

/** One plain-language line when any pair fails, so the fix is obvious. */
export function ContrastNote({ pairs }: { pairs: [label: string, fg: string, bg: string][] }) {
  const failing = pairs.filter(([, fg, bg]) => contrastRatio(fg, bg) < AA_TEXT).map(([label]) => label);
  if (!failing.length) return null;
  return (
    <p className="mt-ds-sm rounded-lg bg-[#fff1d6] px-ds-sm py-ds-xs font-caption text-caption text-[#8a5a00]">
      Low contrast for text: {failing.join("; ")}. Darken or lighten one of the pair, or keep that color for large shapes and buttons rather than words.
    </p>
  );
}
