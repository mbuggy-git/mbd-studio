import { useCallback, useEffect, useRef, useState } from "react";
import type { BrandState, SavedBrand } from "./types";
import { createBlankBrand } from "./state";
import { loadDraft, loadLibrary, saveDraft, saveLibrary } from "./storage";
import { uid } from "./random";

export type Updater = (fn: (s: BrandState) => BrandState) => void;

const HISTORY_LIMIT = 40;

/** Central brand state with an undo stack and browser-local library persistence. */
export function useBrandStore() {
  const [brand, setBrand] = useState<BrandState>(() => loadDraft() ?? createBlankBrand());
  const [history, setHistory] = useState<BrandState[]>([]);
  const [library, setLibrary] = useState<SavedBrand[]>(() => loadLibrary());
  const brandRef = useRef(brand);
  brandRef.current = brand;

  useEffect(() => {
    const id = window.setTimeout(() => saveDraft(brand), 300);
    return () => window.clearTimeout(id);
  }, [brand]);

  useEffect(() => saveLibrary(library), [library]);

  /** Small edits such as typing — no undo entry. */
  const set: Updater = useCallback((fn) => setBrand((s) => fn(s)), []);

  /** Meaningful changes (regenerate, surprise, open) — recorded for undo. */
  const commit: Updater = useCallback((fn) => {
    const prev = brandRef.current;
    setHistory((h) => [...h.slice(-HISTORY_LIMIT + 1), prev]);
    setBrand(fn(prev));
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      setBrand(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  const savedId = library.some((b) => b.id === brand.id) ? brand.id : null;

  const saveCurrent = useCallback(() => {
    const s = brandRef.current;
    setLibrary((lib) => {
      const entry: SavedBrand = { id: s.id, name: s.name.trim() || "Untitled brand", savedAt: Date.now(), state: s };
      return lib.some((b) => b.id === s.id) ? lib.map((b) => (b.id === s.id ? { ...entry, name: b.name === b.state.name ? entry.name : b.name } : b)) : [entry, ...lib];
    });
  }, []);

  const openBrand = useCallback((id: string) => {
    const entry = library.find((b) => b.id === id);
    if (entry) commit(() => entry.state);
  }, [library, commit]);

  const duplicateBrand = useCallback((id: string) => {
    setLibrary((lib) => {
      const entry = lib.find((b) => b.id === id);
      if (!entry) return lib;
      const newId = uid();
      const copy: SavedBrand = { id: newId, name: `${entry.name} copy`, savedAt: Date.now(), state: { ...entry.state, id: newId } };
      return [copy, ...lib];
    });
  }, []);

  const renameBrand = useCallback((id: string, name: string) => {
    setLibrary((lib) => lib.map((b) => (b.id === id ? { ...b, name } : b)));
  }, []);

  const deleteBrand = useCallback((id: string) => {
    setLibrary((lib) => lib.filter((b) => b.id !== id));
  }, []);

  const startNew = useCallback(() => {
    commit(() => createBlankBrand());
  }, [commit]);

  return { brand, set, commit, undo, canUndo: history.length > 0, library, savedId, saveCurrent, openBrand, duplicateBrand, renameBrand, deleteBrand, startNew };
}
