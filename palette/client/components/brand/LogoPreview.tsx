import type { CSSProperties, ReactNode } from "react";

type Props = {
  direction: string;
  name: string;
  colors: string[];
  fontStack: string;
  size?: "sm" | "md";
  variant?: number;
  /** Concept seed. When provided, the sketch's frame, shapes, colors and lettering vary with it. */
  seed?: number;
};

/** Small deterministic generator so the same seed always draws the same sketch. */
function seeded(seed: number) {
  let t = (seed * 2654435761) >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * A typographic, code-drawn concept sketch. It is a quick visual stand-in for a direction —
 * not an AI-rendered or finished logo.
 */
export function LogoPreview({ direction, name, colors, fontStack, size = "md", variant = 0, seed }: Props) {
  const [primary, secondary, accent, light, deep] = colors;
  const label = name.trim() || "Brand";
  const initials = label.split(/[\s&]+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("") || "B";
  const scale = size === "sm" ? 0.62 : 1;
  const hasSeed = typeof seed === "number";
  const r = seeded(hasSeed ? seed : 1);
  const pick = <T,>(xs: T[]): T => xs[Math.floor(r() * xs.length)];

  // Base colors: the original variant scheme when no seed, otherwise a seeded background.
  let bg = variant === 1 ? deep : variant === 2 ? primary : light;
  let ink = variant === 0 ? deep : light;
  let pop = variant === 0 ? accent : variant === 1 ? accent : secondary;
  if (hasSeed) {
    bg = pick([light, light, deep, primary, secondary]);
    ink = luminance(bg) > 0.55 ? deep : light;
    pop = pick([accent, secondary, primary].filter((c) => c !== bg && c !== ink)) ?? accent;
  }

  // Seeded lettering knobs (neutral defaults without a seed).
  const weight = hasSeed ? pick([400, 600, 700, 800]) : 600;
  const upper = hasSeed ? r() < 0.4 : false;
  const tracking = hasSeed ? pick(["-0.04em", "0em", "0.06em", "0.18em"]) : "0.04em";
  const italic = hasSeed ? r() < 0.2 : false;
  const shape = hasSeed ? Math.floor(r() * 4) : 0;
  const font: CSSProperties = {
    fontFamily: fontStack,
    fontWeight: weight,
    fontStyle: italic ? "italic" : "normal",
    textTransform: upper ? "uppercase" : "none",
  };

  let mark: ReactNode;
  switch (direction) {
    case "Monogram": {
      const radius = ["50%", "18%", "4%", "50% 50% 12% 12%"][shape];
      const rotate = shape === 2 && hasSeed && r() < 0.5 ? 45 : 0;
      mark = (
        <div className="flex items-center justify-center" style={{ width: 120 * scale, height: 120 * scale, borderRadius: radius, transform: `rotate(${rotate}deg)`, border: `${2 * scale}px solid ${ink}`, boxShadow: `inset 0 0 0 ${6 * scale}px ${bg}, inset 0 0 0 ${7 * scale}px ${pop}` }} data-oid="f399a1394a" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height,borderRadius,transform,border,boxShadow">
          <span style={{ ...font, color: ink, fontSize: 52 * scale, letterSpacing: "-0.04em", transform: `rotate(${-rotate}deg)`, textTransform: "uppercase" }} data-oid="827bc0478f" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="*">{initials}</span>
        </div>
      );
      break;
    }
    case "Combination Mark": {
      const stacked = hasSeed && r() < 0.4;
      const icons: ReactNode[] = [
        <>
          <div className="absolute inset-0 rounded-full" style={{ background: pop }} data-oid="6ccd239143" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute rounded-full" style={{ inset: `${14 * scale}px`, background: bg }} data-oid="f65611a4b9" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="inset,background" />
          <div className="absolute" style={{ left: "50%", top: 0, bottom: 0, width: 3 * scale, background: ink, transform: "translateX(-50%) rotate(35deg)" }} data-oid="a19b65eaef" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,background" />
        </>,
        <>
          <div className="absolute inset-0" style={{ background: pop, borderRadius: "50% 50% 0 0" }} data-oid="a5fd5bc384" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute" style={{ left: "30%", right: "30%", bottom: 0, height: "45%", background: bg, borderRadius: "50% 50% 0 0" }} data-oid="48e722185f" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
        </>,
        <>
          <div className="absolute" style={{ inset: "12%", background: pop, transform: "rotate(45deg)" }} data-oid="97523c9d7d" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute rounded-full" style={{ inset: "38%", background: ink }} data-oid="003352d935" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
        </>,
        <>
          <div className="absolute rounded-full" style={{ left: 0, top: "20%", width: "60%", height: "60%", background: pop }} data-oid="f526240862" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute rounded-full" style={{ right: 0, top: "20%", width: "60%", height: "60%", border: `${3 * scale}px solid ${ink}` }} data-oid="f59713ae9a" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="border" />
        </>,
      ];
      mark = (
        <div className={stacked ? "flex flex-col items-center" : "flex items-center"} style={{ gap: 14 * scale }} data-oid="41065d6edd" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="gap" data-oid-classname-dynamic="true">
          <div className="relative shrink-0" style={{ width: 54 * scale, height: 54 * scale }} data-oid="9f28583658" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height">{icons[shape]}</div>
          <span style={{ ...font, color: ink, fontSize: 34 * scale, lineHeight: 1, letterSpacing: hasSeed ? tracking : undefined }} data-oid="724ff3d9a4" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="*">{label}</span>
        </div>
      );
      break;
    }
    case "Emblem": {
      const radius = ["50%", "24px 24px 50% 50%", "12px", "50%"][shape];
      mark = (
        <div className="flex flex-col items-center justify-center text-center" style={{ width: 150 * scale, height: 150 * scale, borderRadius: radius, border: `${2 * scale}px solid ${ink}`, outline: `${1 * scale}px ${shape === 3 ? "dashed" : "solid"} ${ink}`, outlineOffset: -8 * scale }} data-oid="891148eea9" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height,borderRadius,border,outline,outlineOffset">
          <span style={{ fontFamily: "'Space Mono', monospace", color: ink, fontSize: 8 * scale, letterSpacing: "0.3em" }} data-oid="1c860ad6e9" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="color,fontSize">{hasSeed ? pick(["EST. MMXXV", "SINCE 2025", "EST · 25", "HOUSE OF"]) : "EST. MMXXV"}</span>
          <span style={{ ...font, color: pop, fontSize: 40 * scale, lineHeight: 1.1, textTransform: "uppercase", fontWeight: hasSeed ? weight : 700 }} data-oid="71bddabccf" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="*">{initials}</span>
          <span className="px-2" style={{ ...font, color: ink, fontSize: 11 * scale, letterSpacing: "0.18em", textTransform: "uppercase", maxWidth: 120 * scale, fontWeight: hasSeed ? weight : 400 }} data-oid="2e3678037f" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="*">{label}</span>
        </div>
      );
      break;
    }
    case "Symbol": {
      const s = 110 * scale;
      const symbols: ReactNode[] = [
        <>
          <div className="absolute" style={{ left: 0, top: 0, width: "62%", height: "62%", background: pop, borderRadius: "100% 0 100% 0" }} data-oid="157e241e0e" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute" style={{ right: 0, bottom: 0, width: "62%", height: "62%", background: ink, borderRadius: "0 100% 0 100%", mixBlendMode: "multiply" }} data-oid="c1d1ddd3ca" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
        </>,
        <>
          <div className="absolute inset-0 rounded-full" style={{ border: `${6 * scale}px solid ${ink}` }} data-oid="f1bcb785a7" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="border" />
          <div className="absolute rounded-full" style={{ inset: "26%", background: pop }} data-oid="0e43980f65" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
        </>,
        <>
          <div className="absolute" style={{ left: "10%", right: "10%", top: "14%", height: "18%", background: ink, borderRadius: 999 }} data-oid="5adfc00085" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute" style={{ left: "22%", right: "22%", top: "41%", height: "18%", background: pop, borderRadius: 999 }} data-oid="5de75c4e71" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute" style={{ left: "34%", right: "34%", top: "68%", height: "18%", background: ink, borderRadius: 999 }} data-oid="ad4b32018f" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
        </>,
        <>
          <div className="absolute" style={{ left: "8%", right: "8%", bottom: 0, top: "10%", background: pop, borderRadius: "50% 50% 0 0" }} data-oid="560230315c" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
          <div className="absolute" style={{ left: "32%", right: "32%", bottom: 0, top: "46%", background: bg, borderRadius: "50% 50% 0 0" }} data-oid="10d98cc12c" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background" />
        </>,
      ];
      mark = <div className="relative" style={{ width: s, height: s, transform: hasSeed ? `rotate(${pick([0, 0, 90, 180])}deg)` : undefined }} data-oid="470e582a79" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height,transform">{symbols[shape]}</div>;
      break;
    }
    case "Hand-lettered":
      mark = (
        <div className="flex flex-col items-center" data-oid="e2090a3357" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true">
          <span style={{ fontFamily: "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', cursive", color: ink, fontSize: 46 * scale, fontStyle: "italic", lineHeight: 1.1, transform: hasSeed ? `rotate(${pick([-6, -3, 0, 3])}deg)` : undefined }} data-oid="fcf410725f" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="color,fontSize,transform">{label}</span>
          <span style={{ width: shape % 2 ? "55%" : "80%", height: 10 * scale, borderBottom: `${3 * scale}px ${shape === 3 ? "dotted" : "solid"} ${pop}`, borderRadius: shape === 2 ? "0" : "0 0 50% 50%" }} data-oid="8c05e503a7" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height,borderBottom,borderRadius" />
        </div>
      );
      break;
    case "Typographic": {
      const words = label.split(/\s+/);
      const half = Math.ceil(words.length / 2);
      const top = words.length > 1 ? words.slice(0, half).join(" ") : label.slice(0, Math.ceil(label.length / 2));
      const bottom = words.length > 1 ? words.slice(half).join(" ") : label.slice(Math.ceil(label.length / 2));
      const centered = shape === 1 || shape === 3;
      mark = (
        <div className={centered ? "flex flex-col items-center" : "flex flex-col"} style={{ fontFamily: fontStack, color: ink, fontWeight: hasSeed ? Math.max(weight, 600) : 800, fontSize: 40 * scale, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: hasSeed ? tracking : "-0.03em" }} data-oid="ef922661e0" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="fontFamily,color,fontWeight,fontSize,letterSpacing" data-oid-classname-dynamic="true">
          <span data-oid="edfc009f35" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">{top}</span>
          <span style={{ color: pop, paddingLeft: centered ? 0 : 28 * scale, borderTop: shape >= 2 ? `${3 * scale}px solid ${ink}` : shape === 0 ? `${3 * scale}px solid ${ink}` : "none", paddingTop: 4 * scale }} data-oid="3b13384689" data-oid-callsite-deletable="true" data-oid-callsite-editable="true" data-oid-style-dynamic="color,paddingLeft,borderTop,paddingTop">{bottom}</span>
        </div>
      );
      break;
    }
    default: {
      const accents: ReactNode[] = [
        <span style={{ color: pop }} data-oid="c867da0369" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="color">.</span>,
        <span className="ml-1 inline-block rounded-full align-middle" style={{ width: 10 * scale, height: 10 * scale, background: pop }} data-oid="8b8907e91c" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height,background" />,
        <span className="ml-2 inline-block align-middle" style={{ width: 24 * scale, height: 4 * scale, background: pop }} data-oid="4aa4b530d6" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="width,height,background" />,
        <span style={{ color: pop }} data-oid="b7e8c57181" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="color">*</span>,
      ];
      mark = (
        <span style={{ ...font, color: ink, fontSize: 44 * scale, letterSpacing: tracking, lineHeight: 1, borderBottom: hasSeed && shape === 2 ? `${2 * scale}px solid ${pop}` : undefined }} data-oid="ed9385fc7b" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-text-editable="false" data-oid-text-source="expression:64c65374dbab|expression:c0e430e8f938" data-oid-style-dynamic="*">
          {label}
          {accents[hasSeed ? shape : 0]}
        </span>
      );
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-ds-md text-center transition-colors duration-300" style={{ background: bg }} data-oid="9aa4e1e507" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-style-dynamic="background">
      {mark}
    </div>
  );
}
