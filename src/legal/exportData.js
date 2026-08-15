// =============================================================================
// DATA EXPORT (v77) — the portability half of "your data is yours".
//
// The app already had a Delete button. Delete without Export is the worse half
// of the pair: it lets someone destroy their data but not take it. GDPR Art. 20
// asks for a structured, commonly used, machine-readable format, and the honest
// version of that here is the actual stored objects, not a prettified summary
// that quietly drops the fields we'd rather not show.
//
// TWO RULES THIS FOLLOWS:
//
//   EVERYTHING, ENUMERATED. The key list comes from storage, not from a
//   hand-written array — a list maintained by hand is wrong the first time a
//   feature adds a key, and an export that silently omits something is a false
//   answer to a subject access request.
//
//   NO NETWORK. The file is built and saved in the browser. An "export" that
//   posts your data to a server to generate a download would be the single
//   most ironic possible implementation.
// =============================================================================

import { getStorage } from "../storage/index.js";
import { LAST_UPDATED } from "./policies.js";

export const EXPORT_VERSION = 1;

/**
 * Read every key this app owns and return one plain object.
 * @returns {Promise<object>}
 */
export async function exportEverything() {
  const storage = getStorage();
  const keys = (await storage.keys?.()) || [];
  const data = {};
  for (const k of keys.sort()) {
    data[k] = await storage.get(k);
  }
  return {
    app: "Zaban",
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    policyVersion: LAST_UPDATED,
    note:
      "This is everything Zaban holds about you. It all lived in this browser's " +
      "local storage on your own device — there is no server-side copy to request. " +
      "Keys are the app's internal names; values are exactly as stored.",
    keyCount: keys.length,
    data,
  };
}

/** Rough size of the export, for showing a number before the download starts. */
export async function exportSize() {
  try {
    return JSON.stringify(await exportEverything()).length;
  } catch {
    return 0;
  }
}

/**
 * Save the export as a file.
 *
 * Returns the number of keys written so the caller can say something specific
 * ("14 records") rather than a bare "done" the learner has to take on trust.
 */
export async function downloadExport() {
  const payload = await exportEverything();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zaban-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoked on the next tick rather than immediately: Safari has historically
  // cancelled the download if the object URL dies in the same frame as the click.
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return payload.keyCount;
}
