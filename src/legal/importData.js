// =============================================================================
// RESTORE FROM A BACKUP (v118) — the other half of the export.
//
// Everything a learner has done lives in this browser and nowhere else. There
// was a button to save it all to a file (exportData.js) and no way to put the
// file back: a backup that can't be restored is a souvenir. A new phone, a
// cleared browser, or Safari's seven-day rule for sites that aren't on the
// Home Screen, and months of progress were gone for good.
//
// TWO RULES:
//
//   READ BEFORE WRITING. The file is parsed and checked completely, and shown
//   to the learner (which languages, how many words, when it was saved),
//   before a single key is touched. Nothing is half-restored.
//
//   IT REPLACES, AND SAYS SO. Restoring means the device ends up holding
//   exactly what the file holds — keys the file doesn't have are removed — so
//   two half-histories are never stitched together into a state no version of
//   the app ever wrote. The app's own loader then reconciles it
//   (appStateShape.js), exactly as it does for any older save.
//
// No network: the file is read in the browser.
// =============================================================================

import { EXPORT_VERSION } from "./exportData.js";

export const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
const KEY_OK = /^[A-Za-z0-9_.:-]{1,64}$/;

/**
 * Check a backup file's text. Pure: touches no storage.
 * @returns {{ ok: true, data: object, summary: object } | { ok: false, reason: string }}
 */
export function readBackup(text) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, reason: "That file is empty." };
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, reason: "That file is too large to be a Zaban backup." };
  let parsed;
  try { parsed = JSON.parse(text); } catch { return { ok: false, reason: "That isn't a Zaban backup: it can't be read as a data file." }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || parsed.app !== "Zaban") {
    return { ok: false, reason: "That isn't a Zaban backup. Choose the file saved by “Download my data”." };
  }
  if (typeof parsed.exportVersion !== "number" || parsed.exportVersion > EXPORT_VERSION) {
    return { ok: false, reason: "That backup was made by a newer version of Zaban than this one. Reload the app and try again." };
  }
  const data = parsed.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, reason: "That backup holds no data." };
  const keys = Object.keys(data);
  if (!keys.length) return { ok: false, reason: "That backup holds no data." };
  const bad = keys.find((k) => !KEY_OK.test(k));
  if (bad !== undefined) return { ok: false, reason: "That backup has an entry this app doesn't recognise, so it hasn't been used." };
  const app = data.app;
  if (!app || typeof app !== "object" || Array.isArray(app)) {
    return { ok: false, reason: "That backup has no learner in it (it may have been saved before any lesson)." };
  }

  const progress = data.progress && typeof data.progress === "object" && !Array.isArray(data.progress) ? data.progress : {};
  const languages = Object.entries(progress)
    .map(([code, cards]) => ({
      code,
      words: cards && typeof cards === "object" ? Object.values(cards).filter((c) => c && (c.reps || 0) > 0).length : 0,
    }))
    .filter((l) => l.words > 0)
    .sort((a, b) => b.words - a.words);
  return {
    ok: true,
    data,
    summary: {
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : null,
      keyCount: keys.length,
      currentLanguage: typeof app.currentLanguage === "string" ? app.currentLanguage : null,
      streak: Number.isFinite(app.streak) ? app.streak : 0,
      languages,
    },
  };
}

/**
 * Make storage hold exactly what the backup holds. Call only with the `data`
 * of a readBackup() that returned ok. Returns the number of records written.
 */
export async function restoreBackup(data, storage) {
  const keys = Object.keys(data || {});
  if (!keys.length || keys.some((k) => !KEY_OK.test(k))) throw new Error("not a checked backup");
  const existing = (await storage.keys?.()) || [];
  for (const k of keys) await storage.set(k, data[k]);
  for (const k of existing) if (!(k in data)) await storage.remove?.(k);
  return keys.length;
}
