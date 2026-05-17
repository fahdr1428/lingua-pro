// =============================================================================
// STORAGE ADAPTER — single interface, swappable backends.
// =============================================================================
// All persistence (progress, sessions, settings) goes through this. To
// migrate from localStorage to Supabase / Firebase / your-own-API:
//   1. Implement the same 4 methods in a new file
//   2. Change the factory below
// The engine and UI never change.
// =============================================================================

import { LocalStorageAdapter } from "./localStorageAdapter.js";
// import { SupabaseAdapter } from "./supabaseAdapter.js";

/**
 * @typedef {Object} StorageAdapter
 * @property {(key: string) => Promise<any>} get
 * @property {(key: string, value: any) => Promise<void>} set
 * @property {(key: string) => Promise<void>} remove
 * @property {(key: string, fn: (current: any) => any) => Promise<any>} update
 */

let instance = null;

/** Get the configured adapter. Singleton. */
export function getStorage() {
  if (instance) return instance;

  // Switch backends here — one line.
  instance = new LocalStorageAdapter("lingua:");
  // instance = new SupabaseAdapter(supabaseClient);

  return instance;
}
