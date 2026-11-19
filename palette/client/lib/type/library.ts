import { resolveFont } from "../brand/fonts";
import { uid } from "../brand/random";
import type { TypeState } from "./state";

/** One saved Type Palette: every option, the preview copy and a name. Kept in this browser only. */
export type SavedType = { id: string; name: string; savedAt: number; state: TypeState };

const KEY = "type-palette-library-v1";

export function loadLibrary(): SavedType[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedType[]) : [];
    return Array.isArray(list) ? list.filter((s) => s && s.id && s.state && Array.isArray(s.state.options)) : [];
  } catch {
    return [];
  }
}

export function storeLibrary(list: SavedType[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or unavailable */
  }
}

/** Default name for a save: the first option's pairing, e.g. "Bodoni Moda + DM Sans". */
export function defaultName(state: TypeState): string {
  const o = state.options[0];
  return `${resolveFont(o.display, [], "display").name} + ${resolveFont(o.body, [], "body").name}`;
}

const copy = (state: TypeState): TypeState => JSON.parse(JSON.stringify(state)) as TypeState;

/** Save the working state: updates its library entry if it has one, otherwise adds a new entry. */
export function saveToLibrary(list: SavedType[], state: TypeState): { list: SavedType[]; id: string } {
  const existing = list.find((s) => s.id === state.savedId);
  if (existing) {
    const id = existing.id;
    return { id, list: list.map((s) => (s.id === id ? { ...s, savedAt: Date.now(), state: { ...copy(state), savedId: id } } : s)) };
  }
  const id = uid();
  return { id, list: [{ id, name: defaultName(state), savedAt: Date.now(), state: { ...copy(state), savedId: id } }, ...list] };
}

export function duplicateInLibrary(list: SavedType[], id: string): SavedType[] {
  const src = list.find((s) => s.id === id);
  if (!src) return list;
  const nextId = uid();
  return [{ id: nextId, name: `${src.name} copy`, savedAt: Date.now(), state: { ...copy(src.state), savedId: nextId } }, ...list];
}
