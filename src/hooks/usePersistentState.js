// =============================================================================
// usePersistentState — useState that persists through the storage adapter.
// =============================================================================
import { useEffect, useState, useCallback } from "react";
import { getStorage } from "../storage/index.js";

const storage = getStorage();

export function usePersistentState(key, initial) {
  const [value, setValueRaw] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage.get(key).then((v) => {
      if (cancelled) return;
      if (v !== null && v !== undefined) setValueRaw(v);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [key]);

  const setValue = useCallback(
    (updater) => {
      setValueRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        storage.set(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, setValue, loaded];
}
