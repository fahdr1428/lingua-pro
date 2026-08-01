// =============================================================================
// useProfile (v73) — one learner profile per language, shared by every screen.
//
// The profile is written from several places (a speaking round, an in-lesson
// speak moment, a mission) and read from several others (the coach's brief, the
// fluency dashboard, mission recommendations). If each screen loaded its own
// copy, a write in one place would be silently overwritten by a stale copy in
// another — so it's owned once, at the App level, and passed down.
//
// Writes are queued. Two turns graded in quick succession would otherwise both
// read the same starting profile and the second would clobber the first; the
// chain below guarantees each mutation sees the result of the one before it.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { getStorage } from "../storage/index.js";
import { emptyProfile, loadProfile, saveProfile } from "../engine/profile.js";

const storage = getStorage();

export function useProfile(langCode) {
  const [profile, setProfile] = useState(() => emptyProfile(langCode || "xx"));
  const [loaded, setLoaded] = useState(false);
  // Serialises writes. Every mutation appends to this chain.
  const queue = useRef(Promise.resolve());
  const current = useRef(profile);

  useEffect(() => {
    if (!langCode) return;
    let cancelled = false;
    setLoaded(false);
    loadProfile(storage, langCode).then((p) => {
      if (cancelled) return;
      current.current = p;
      setProfile(p);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [langCode]);

  /**
   * Apply a pure profile function and persist the result.
   * @param {(profile: object) => object} fn
   * @returns {Promise<object>} the saved profile
   */
  const mutate = useCallback((fn) => {
    if (!langCode) return Promise.resolve(current.current);
    queue.current = queue.current.then(async () => {
      const next = fn(current.current) || current.current;
      const saved = await saveProfile(storage, langCode, next);
      current.current = saved;
      setProfile(saved);
      return saved;
    });
    return queue.current;
  }, [langCode]);

  return { profile, loaded, mutate };
}
