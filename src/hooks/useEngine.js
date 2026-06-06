// =============================================================================
// useEngine — the React hook the UI uses to talk to the engine.
// =============================================================================
// Wraps the Engine in React state. Owns the singleton, manages loading,
// keeps stats in sync. Components import this and never import Engine directly.
// =============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { Engine } from "../engine/Engine.js";
import { getStorage } from "../storage/index.js";

let singleton = null;
function getEngine() {
  if (!singleton) singleton = new Engine(getStorage());
  return singleton;
}

export function useEngine(languageCode) {
  const [pack, setPack] = useState(null);
  const [stats, setStats] = useState({ total: 0, learned: 0, due: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  const engineRef = useRef(getEngine());

  // Load language pack when code changes
  useEffect(() => {
    if (!languageCode) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    engineRef.current.loadLanguage(languageCode).then(async (loaded) => {
      if (cancelled) return;
      setPack(loaded);
      const s = await engineRef.current.getStats();
      setStats(s);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [languageCode]);

  const refreshStats = useCallback(async () => {
    const s = await engineRef.current.getStats();
    setStats(s);
  }, []);

  return {
    engine: engineRef.current,
    pack,
    stats,
    loading,
    refreshStats,
  };
}
