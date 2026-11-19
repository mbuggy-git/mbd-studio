import { previewStyle, resolveFont } from "../brand/fonts";
import { colorName, inkOn, luminance, PALETTE_ROLES } from "../brand/color";
import { displaySpacingEm, OPTION_LABELS, type TypeOption } from "./state";

const W = 1600;
const PAD = 64;
const CARD_PAD = 40;
const PANEL_PAD = 48;
const BODY_SIZE = 22;
const BODY_LH = BODY_SIZE * 1.6;
const COLORS_ROW = 24 + 20 + 44;
const UI_SANS = "'Space Grotesk', sans-serif";
const UI_MONO = "'Space Mono', monospace";

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(test).width > maxW) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    lines.push(line);
  }
  return lines;
}

function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

function setFont(ctx: Ctx, font: string, spacing = "0px") {
  ctx.font = font;
  if ("letterSpacing" in ctx) ctx.letterSpacing = spacing;
}

/** Lays out (and optionally draws) one option card; returns its height. */
function drawOption(ctx: Ctx, o: TypeOption, index: number, y: number, head: string, copy: string, draw: boolean) {
  const d = resolveFont(o.display, [], "display");
  const b = resolveFont(o.body, [], "body");
  const ds = previewStyle(o.display, d);
  const bs = previewStyle(o.body, b);
  const headFont = `${ds.fontWeight} ${o.displaySize}px ${d.stack}`;
  const bodyFont = `${bs.fontWeight} ${BODY_SIZE}px ${b.stack}`;
  const headSpacing = String(displaySpacingEm(o, ds.letterSpacing as string | undefined));
  const kern = o.displayTracking ?? 0;
  const bodySpacing = typeof bs.letterSpacing === "string" ? bs.letterSpacing.replace("em", "") : "0";
  const p = o.palette;
  const x = PAD;
  const cardW = W - PAD * 2;
  const innerX = x + CARD_PAD;
  const innerW = cardW - CARD_PAD * 2;
  const textW = innerW - PANEL_PAD * 2;
  const headLH = o.displaySize * 1.05;

  setFont(ctx, headFont, `${parseFloat(headSpacing) * o.displaySize}px`);
  const headLines = wrap(ctx, head, textW);
  setFont(ctx, bodyFont, `${parseFloat(bodySpacing) * BODY_SIZE}px`);
  const bodyLines = wrap(ctx, copy, Math.min(textW, 900));
  const panelH = PANEL_PAD + 18 + 28 + headLines.length * headLH + 28 + bodyLines.length * BODY_LH + COLORS_ROW + PANEL_PAD;
  const headerH = 92;
  const chipH = 150 + 78;
  const total = CARD_PAD + headerH + panelH * 2 + 16 + 24 + chipH + CARD_PAD;
  if (!draw) return total;

  rrect(ctx, x, y, cardW, total, 20, "#ecd9ee");
  let cy = y + CARD_PAD;

  // Header: option label + font names and sizes
  ctx.textBaseline = "top";
  setFont(ctx, `400 14px ${UI_MONO}`, "2.8px");
  ctx.fillStyle = "#6e4a73";
  ctx.fillText(`OPTION ${OPTION_LABELS[index]}`, innerX, cy);
  setFont(ctx, `600 26px ${UI_SANS}`);
  ctx.fillStyle = "#3f1a44";
  ctx.fillText(`Display: ${d.name} · ${ds.fontWeight} · ${o.displaySize}px · kerning ${kern > 0 ? `+${kern}` : kern}`, innerX, cy + 26);
  setFont(ctx, `400 18px ${UI_SANS}`);
  ctx.fillStyle = "#6e4a73";
  ctx.fillText(`Supporting: ${b.name} · ${bs.fontWeight} · ${BODY_SIZE}px / ${BODY_LH.toFixed(0)}px`, innerX, cy + 62);
  cy += headerH;

  const panel = (bg: string, label: string, labelColor: string, headColor: string, bodyColor: string, bodyAlpha: number) => {
    ctx.save();
    rrect(ctx, innerX, cy, innerW, panelH, 12, bg);
    ctx.clip();
    let ty = cy + PANEL_PAD;
    setFont(ctx, `400 14px ${UI_MONO}`, "2.8px");
    ctx.fillStyle = labelColor;
    ctx.fillText(label, innerX + PANEL_PAD, ty);
    ty += 18 + 28;
    setFont(ctx, headFont, `${parseFloat(headSpacing) * o.displaySize}px`);
    ctx.fillStyle = headColor;
    headLines.forEach((l, k) => ctx.fillText(l, innerX + PANEL_PAD, ty + k * headLH + (headLH - o.displaySize) / 2));
    ty += headLines.length * headLH + 28;
    setFont(ctx, bodyFont, `${parseFloat(bodySpacing) * BODY_SIZE}px`);
    ctx.fillStyle = bodyColor;
    ctx.globalAlpha = bodyAlpha;
    bodyLines.forEach((l, k) => ctx.fillText(l, innerX + PANEL_PAD, ty + k * BODY_LH + (BODY_LH - BODY_SIZE) / 2));
    ctx.globalAlpha = 1;
    ty += bodyLines.length * BODY_LH + 24;
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = bodyColor;
    ctx.fillRect(innerX + PANEL_PAD, ty, textW, 1);
    ctx.globalAlpha = 1;
    ty += 20;
    const colW = textW / 3;
    [0, 1, 2].forEach((k) => {
      const cx = innerX + PANEL_PAD + k * colW;
      const isDark = bg === p[4].hex && headColor === p[3].hex;
      const hex = k === 0 && isDark ? headColor : p[k].hex;
      const role = k === 0 && isDark ? "Display · Light neutral" : PALETTE_ROLES[k];
      const [hi, lo] = [luminance(hex), luminance(bg)].sort((a, b) => b - a);
      const ratio = (hi + 0.05) / (lo + 0.05);
      setFont(ctx, `${ds.fontWeight} 40px ${d.stack}`);
      ctx.fillStyle = hex;
      ctx.fillText("Aa", cx, ty);
      const aw = ctx.measureText("Aa").width + 14;
      setFont(ctx, `400 13px ${UI_MONO}`);
      ctx.fillStyle = bodyColor;
      ctx.fillText(`${role} ${hex.toUpperCase()}`, cx + aw, ty + 4);
      ctx.fillText(`${ratio.toFixed(1)}:1 ${ratio >= 4.5 ? "· reads well" : ratio >= 3 ? "· large type only" : "· low contrast"}`, cx + aw, ty + 24);
    });
    ctx.restore();
    cy += panelH;
  };
  panel(p[3].hex, "LIGHT GROUND", p[2].hex, p[0].hex, p[4].hex, 1);
  cy += 16;
  panel(p[4].hex, "DARK GROUND", p[2].hex, p[3].hex, p[3].hex, 0.8);
  cy += 24;

  // Color chips
  const gap = 12;
  const chipW = (innerW - gap * 4) / 5;
  p.forEach((sw, k) => {
    const cx = innerX + k * (chipW + gap);
    rrect(ctx, cx, cy, chipW, chipH, 12, "#f5eaf6");
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx, cy, chipW, 150, [12, 12, 0, 0]);
    else ctx.rect(cx, cy, chipW, 150);
    ctx.fillStyle = sw.hex;
    ctx.fill();
    ctx.restore();
    setFont(ctx, `400 13px ${UI_MONO}`);
    ctx.fillStyle = inkOn(sw.hex);
    ctx.fillText(PALETTE_ROLES[k], cx + 14, cy + 14);
    ctx.fillText(colorName(sw.hex), cx + 14, cy + 150 - 28);
    setFont(ctx, `600 20px ${UI_SANS}`);
    ctx.fillStyle = "#3f1a44";
    ctx.fillText(sw.hex.toUpperCase(), cx + 14, cy + 150 + 16);
    setFont(ctx, `400 13px ${UI_MONO}`);
    ctx.fillStyle = "#6e4a73";
    ctx.fillText(PALETTE_ROLES[k], cx + 14, cy + 150 + 46);
  });

  return total;
}

/** Renders every option (fonts, sizes, both grounds and color chips) to a PNG and downloads it. */
export async function exportOptionsPng(allOptions: TypeOption[], headline: string, body: string, only?: number) {
  const entries = allOptions.map((o, i) => ({ o, i })).filter((e) => only === undefined || e.i === only);
  const options = entries.map((e) => e.o);
  const head = headline.trim() || "Your headline";
  const copy = body.trim() || "Your body copy appears here.";

  // Make sure the real typefaces are ready before drawing.
  const loads: Promise<unknown>[] = [];
  options.forEach((o) => {
    const d = resolveFont(o.display, [], "display");
    const b = resolveFont(o.body, [], "body");
    const dw = previewStyle(o.display, d).fontWeight;
    const bw = previewStyle(o.body, b).fontWeight;
    loads.push(document.fonts.load(`${dw} 40px "${d.name}"`), document.fonts.load(`${bw} 20px "${b.name}"`));
  });
  loads.push(document.fonts.load(`600 20px "Space Grotesk"`), document.fonts.load(`400 14px "Space Mono"`));
  await Promise.allSettled(loads);
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d") as Ctx;
  const titleH = 120;
  const gap = 32;
  let height = PAD + titleH;
  entries.forEach(({ o, i }) => (height += drawOption(ctx, o, i, 0, head, copy, false) + gap));
  height += PAD - gap;

  const scale = 2;
  canvas.width = W * scale;
  canvas.height = height * scale;
  ctx = canvas.getContext("2d") as Ctx;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  ctx.fillStyle = "#954b9d";
  ctx.fillRect(0, 0, W, height);
  ctx.textBaseline = "top";
  setFont(ctx, `600 56px ${UI_SANS}`, "-1px");
  ctx.fillStyle = "#f8f1f8";
  ctx.fillText("Type Palette", PAD, PAD);
  setFont(ctx, `400 16px ${UI_MONO}`);
  ctx.fillStyle = "#f0dcf2";
  ctx.fillText(
    only !== undefined
      ? `Option ${OPTION_LABELS[only]} · ${new Date().toLocaleDateString()} · Brought to you by MBD.studio`
      : `${options.length} option${options.length > 1 ? "s" : ""} · ${new Date().toLocaleDateString()} · Brought to you by MBD.studio`,
    PAD,
    PAD + 72,
  );

  let y = PAD + titleH;
  entries.forEach(({ o, i }) => (y += drawOption(ctx, o, i, y, head, copy, true) + gap));

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("Could not create PNG");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = only !== undefined ? `type-palette-option-${OPTION_LABELS[only]}-${Date.now()}.png` : `type-palette-options-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
