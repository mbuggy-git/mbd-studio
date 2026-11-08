import type { CSSProperties } from "react";

type Props = {
  direction: string;
  name: string;
  colors: string[];
  fontStack: string;
  size?: "sm" | "md";
  variant?: number;
  seed?: number;
};

/**
 * A schematic, not a logo. The brand name is set in the chosen display face; a dashed outline
 * marks where the generated element will go, shaped by the direction. Nothing here pretends to
 * be the mark itself — the prompt on the card produces that.
 */
export function LogoPreview({ direction, name, colors, fontStack, size = "md" }: Props) {
  const [primary, , , light, deep] = colors;
  const label = name.trim() || "Brand";
  const initial = label.split(/[\s&]+/).filter(Boolean)[0]?.[0]?.toUpperCase() ?? "B";
  const sm = size === "sm";
  const dash: CSSProperties = { border: `${sm ? 1.5 : 2}px dashed ${primary}`, opacity: 0.8 };
  const word: CSSProperties = { fontFamily: fontStack, color: deep, fontWeight: 600, letterSpacing: "0.01em", fontSize: sm ? 15 : 28, lineHeight: 1.05 };
  const box = sm ? 28 : 56;
  const d = direction.toLowerCase();

  let body;
  if (d === "monogram") {
    body = (
      <div className="flex flex-col items-center gap-2">
        <span className="flex items-center justify-center rounded-md" style={{ ...dash, width: box * 1.3, height: box * 1.3, ...word, fontSize: sm ? 16 : 32 }}>{initial}</span>
        {!sm && <span style={{ ...word, fontSize: 13, opacity: 0.6 }}>{label}</span>}
      </div>
    );
  } else if (d === "emblem") {
    body = (
      <span className="flex items-center justify-center rounded-full px-4 text-center" style={{ ...dash, minWidth: box * 2.4, height: box * 2.4, ...word, fontSize: sm ? 11 : 16 }}>{label}</span>
    );
  } else if (d === "symbol") {
    body = (
      <div className="flex flex-col items-center gap-2">
        <span className="block rounded-full" style={{ ...dash, width: box * 1.4, height: box * 1.4 }} />
        {!sm && <span className="font-caption text-caption" style={{ color: deep, opacity: 0.55 }}>symbol</span>}
      </div>
    );
  } else if (d === "combination mark") {
    body = (
      <div className="flex items-center gap-3">
        <span className="block shrink-0 rounded-full" style={{ ...dash, width: box, height: box }} />
        <span style={word}>{label}</span>
      </div>
    );
  } else {
    // Wordmark, Typographic and anything else: the name alone, in the brand's display face.
    body = <span className="text-center" style={word}>{label}</span>;
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center" style={{ background: light }} aria-label={`${direction} placeholder for ${label}`}>
      <div className={sm ? "px-2" : "px-6"}>{body}</div>
      {!sm && (
        <span className="absolute bottom-2 right-3 font-caption text-[10px] uppercase tracking-[0.18em]" style={{ color: deep, opacity: 0.45 }}>
          Sketch · the prompt generates the mark
        </span>
      )}
    </div>
  );
}
