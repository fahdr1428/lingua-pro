// =============================================================================
// LocalStorageAdapter — synchronous under the hood, but presents an async API
// so swapping for a network-backed adapter later doesn't change calling code.
// =============================================================================

export class LocalStorageAdapter {
  constructor(prefix = "lingua:") {
    this.prefix = prefix;
  }

  _k(key) { return this.prefix + key; }

  async get(key) {
    try {
      const raw = localStorage.getItem(this._k(key));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(this._k(key), JSON.stringify(value));
    } catch (e) {
      // Quota exceeded etc. — surface gracefully
      console.warn("[storage] set failed:", e);
    }
  }

  async remove(key) {
    localStorage.removeItem(this._k(key));
  }

  async update(key, fn) {
    const current = await this.get(key);
    const next = fn(current);
    await this.set(key, next);
    return next;
  }

  /**
   * Every key this app owns, without the prefix.
   *
   * v77: added for the data export. GDPR portability means handing someone
   * everything you hold about them, and "everything" can't be a hand-written
   * list that goes stale the first time a feature adds a key — it has to be
   * whatever is actually in there.
   */
  async keys() {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .map((k) => k.slice(this.prefix.length));
  }

  async clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => localStorage.removeItem(k));
  }
}
