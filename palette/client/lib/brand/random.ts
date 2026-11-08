/** Deterministic RNG so regenerating with the same seed is reproducible and a bumped seed gives a new variation. */
export function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = () => number;

export const pickR = <T,>(r: Rand, items: T[]): T => items[Math.floor(r() * items.length)];

export function sampleR<T>(r: Rand, items: T[], n: number): T[] {
  const copy = [...items];
  const out: T[] = [];
  while (copy.length && out.length < n) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  return out;
}

export const newSeed = () => Math.floor(Math.random() * 1_000_000_000);

export const uid = () => Math.random().toString(36).slice(2, 10);

export function listJoin(items: string[], conj = "and") {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conj} ${items[items.length - 1]}`;
}

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");
