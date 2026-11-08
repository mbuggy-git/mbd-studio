/**
 * AI integration boundary.
 *
 * No AI service is connected in this build, and no credentials are bundled. Every request falls back to the
 * local generators. To connect a real service later, call `registerBrandAI()` with a provider that implements
 * this interface (for example one that calls your own backend, which holds the API key server-side).
 */
import { generateNames, generateTaglines, type CopyContext } from "./generate";
import type { LockedText } from "./types";

export type NameRequest = { industry: string; traits: string[]; exclude: string[] };

export interface BrandAIProvider {
  label: string;
  generateNames(req: NameRequest): Promise<string[]>;
  generateTaglines?(ctx: CopyContext): Promise<string[]>;
}

let provider: BrandAIProvider | null = null;

export function registerBrandAI(p: BrandAIProvider | null) {
  provider = p;
}

export function aiStatus() {
  return provider ? { connected: true, label: provider.label } : { connected: false, label: "Local generator · AI not connected" };
}

export async function requestNames(req: NameRequest, seed: number): Promise<{ names: string[]; source: "ai" | "local" }> {
  if (provider) {
    try {
      const names = await provider.generateNames(req);
      if (names.length) return { names: names.slice(0, 5), source: "ai" };
    } catch {
      /* fall through to the local generator */
    }
  }
  return { names: generateNames(req.industry, req.traits, seed, req.exclude), source: "local" };
}

export async function requestTaglines(ctx: CopyContext, seed: number, current: LockedText[]): Promise<LockedText[]> {
  if (provider?.generateTaglines) {
    try {
      const lines = await provider.generateTaglines(ctx);
      let i = 0;
      if (lines.length) return current.map((t) => (t.locked ? t : { text: lines[i++] ?? t.text, locked: false }));
    } catch {
      /* fall through */
    }
  }
  return generateTaglines(ctx, seed, current);
}
