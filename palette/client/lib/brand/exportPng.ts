import type { BrandState } from "./types";
import { brandFacts } from "./prompts";
import { inkOn } from "./color";

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 6) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = w;
      if (++lines >= maxLines - 1) break;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

/**
 * Renders a flat raster PNG of the brand board with the Canvas 2D API.
 * The output is an image — it does not contain editable vector or text layers.
 */
export async function exportBoardPng(s: BrandState) {
  const f = brandFacts(s);
  const W = 1600;
  const H = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
  const sans = "'Space Grotesk', system-ui, sans-serif";
  const mono = "'Space Mono', ui-monospace, monospace";
  const ink = "#2a1d38";

  ctx.fillStyle = "#f4eefb";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#5f5f7a";
  ctx.font = `16px ${mono}`;
  ctx.fillText(`BRAND BOARD · ${f.industry.toUpperCase()}`, 72, 92);

  ctx.fillStyle = ink;
  ctx.font = `600 104px ${f.display.stack}`;
  wrap(ctx, f.name, 72, 200, 900, 104, 2);

  ctx.font = `italic 32px ${f.display.stack}`;
  ctx.fillStyle = "#4a3a5c";
  if (f.tagline) ctx.fillText(f.tagline, 72, 330);

  // Palette
  const px = 72;
  const py = 400;
  const widths = [300, 200, 160, 160, 160];
  let x = px;
  f.colors.forEach((c, i) => {
    ctx.fillStyle = c.hex;
    ctx.fillRect(x, py, widths[i] - 12, 260);
    ctx.fillStyle = inkOn(c.hex);
    ctx.font = `16px ${mono}`;
    ctx.fillText(c.hex, x + 18, py + 230);
    ctx.font = `14px ${sans}`;
    ctx.fillText(c.name, x + 18, py + 205);
    x += widths[i];
  });

  // Description + keywords
  ctx.fillStyle = ink;
  ctx.font = `20px ${sans}`;
  wrap(ctx, s.description.text, 72, 730, 900, 30, 4);
  ctx.font = `15px ${mono}`;
  ctx.fillStyle = "#5f5f7a";
  ctx.fillText(s.traits.join("  ·  ").toUpperCase(), 72, 900);

  // Right column: typography + logo
  const rx = 1080;
  ctx.fillStyle = "#e6dbf6";
  ctx.fillRect(rx, 72, 448, 400);
  ctx.fillStyle = ink;
  ctx.font = `600 150px ${f.display.stack}`;
  ctx.fillText("Aa", rx + 32, 250);
  ctx.font = `16px ${mono}`;
  ctx.fillText(`DISPLAY · ${f.display.name}`, rx + 32, 320);
  ctx.fillText(`BODY · ${f.body.name}`, rx + 32, 350);
  ctx.font = `18px ${f.body.stack}`;
  wrap(ctx, "The quick brown fox jumps over the lazy dog.", rx + 32, 400, 380, 26, 2);

  const logoBg = f.colors[3].hex;
  ctx.fillStyle = logoBg;
  ctx.fillRect(rx, 500, 448, 300);
  ctx.fillStyle = f.colors[4].hex;
  ctx.textAlign = "center";
  ctx.font = `600 46px ${f.display.stack}`;
  ctx.fillText(f.name, rx + 224, 660, 400);
  ctx.font = `14px ${mono}`;
  ctx.fillText((f.logo?.direction ?? "Logo direction").toUpperCase(), rx + 224, 770);
  ctx.textAlign = "left";

  ctx.font = `14px ${mono}`;
  ctx.fillStyle = "#5f5f7a";
  ctx.fillText(`VOICE · ${f.voice.join(" / ").toUpperCase()}`, rx, 860);
  ctx.fillText("Made with Brand Palette · exploratory board", rx, 900);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(f.name || "brand").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-board.png`;
  a.click();
}
