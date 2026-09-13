// =============================================================================
// usePersistentState — useState that persists through the storage adapter.
// =============================================================================
import { useEffect, useState, useCallback } from "react";
import { getStorage } from "../storage/index.js";
import { warnOnShapeChange } from "../data/appStateShape.js";

const storage = getStorage();

/**
 * @param {string} key
 * @param {*} initial
 * @param {(saved:*) => *} [reconcile]
 *   v103 — optional. Given the raw saved value, return the value to use.
 *
 *   Without it this hook REPLACED `initial` with whatever was in storage, so a
 *   save written by an older version of the app arrived with every key added
 *   since it missing, and a save with a wrong-typed value took a screen down
 *   with no way back. localStorage is shared across every version that has run
 *   on the device and can be edited by hand; it is an input to validate, not a
 *   value to trust. See src/data/appStateShape.js.
 */
export function usePersistentState(key, initial, reconcile) {
  const [value, setValueRaw] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage.get(key).then((v) => {
      if (cancelled) return;
      if (v !== null && v !== undefined) {
        setValueRaw(reconcile ? reconcile(v) : v);
      } else if (reconcile) {
        // Nothing saved yet — still run it, so a first run starts from the
        // same normalised shape a returning one does.
        setValueRaw(reconcile(null));
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
    // `reconcile` is intentionally not a dependency: it is defined inline at
    // the call site, so listing it would re-read storage on every render.
  }, [key]);

  const setValue = useCallback(
    (updater) => {
      setValueRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (import.meta.env?.DEV) warnOnShapeChange(key, initial, prev, next);
        storage.set(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, setValue, loaded];
}
