import { useCallback, useEffect, useRef, useState } from "react";
import type { BrandState, SavedBrand } from "./types";
import { clearLocks, createBlankBrand } from "./state";
import { loadDeleted, loadDraft, loadLibrary, markDeleted, saveDeleted, saveDraft, saveLibrary, syncLibrary } from "./storage";
import { getAccessToken } from "../access";
import { uid } from "./random";

export type Updater = (fn: (s: BrandState) => BrandState) => void;

/** local = this browser only (no purchase link here); error = couldn't reach the server, still saved locally. */
export type SyncStatus = "local" | "syncing" | "synced" | "error";

const HISTORY_LIMIT = 40;

/** Central brand state with an undo stack; the library is kept in the browser and synced to the purchase link. */
export function useBrandStore() {
  const [brand, setBrand] = useState<BrandState>(() => { const d = loadDraft(); return d ? clearLocks(d) : createBlankBrand(); });
  const [history, setHistory] = useState<BrandState[]>([]);
  const [library, setLibrary] = useState<SavedBrand[]>(() => loadLibrary());
  const [sync, setSync] = useState<SyncStatus>(() => (getAccessToken() ? "syncing" : "local"));
  const [retry, setRetry] = useState(0);
  const brandRef = useRef(brand);
  brandRef.current = brand;
  /** The library exactly as the server last returned it — matching it means there is nothing to send. */
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => saveDraft(brand), 300);
    return () => window.clearTimeout(id);
  }, [brand]);

  // Save locally at once, then send to the server. The server merges and answers
  // with the full library, which is how brands saved on another device arrive here.
  useEffect(() => {
    saveLibrary(library);
    const token = getAccessToken();
    if (!token) return;
    const snapshot = JSON.stringify(library);
    if (snapshot === syncedRef.current) return;
    setSync("syncing");
    let live = true;
    const id = window.setTimeout(async () => {
      const result = await syncLibrary(token, library, loadDeleted());
      if (!live) return; // the library changed while this was in flight; the newer run takes over
      if (!result) {
        setSync("error");
        return;
      }
      saveDeleted(result.deleted);
      const merged = JSON.stringify(result.library);
      syncedRef.current = merged;
      if (merged !== snapshot) setLibrary(result.library);
      setSync("synced");
    }, syncedRef.current === null ? 0 : 800);
    return () => {
      live = false;
      window.clearTimeout(id);
    };
  }, [library, retry]);

  // Back online after a failed sync: try again.
  useEffect(() => {
    const onOnline = () => setRetry((n) => n + 1);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

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
    if (entry) commit(() => clearLocks(entry.state));
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
    setLibrary((lib) => lib.map((b) => (b.id === id ? { ...b, name, updatedAt: Date.now() } : b)));
  }, []);

  const deleteBrand = useCallback((id: string) => {
    markDeleted(id);
    setLibrary((lib) => lib.filter((b) => b.id !== id));
  }, []);

  const startNew = useCallback(() => {
    commit(() => createBlankBrand());
  }, [commit]);

  return { brand, set, commit, undo, canUndo: history.length > 0, library, sync, savedId, saveCurrent, openBrand, duplicateBrand, renameBrand, deleteBrand, startNew };
}
