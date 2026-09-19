// Extracted from App.jsx (Stage 3 of frontend restructuring plan).
// Persistence: localStorage with a graceful in-memory fallback.
// Some sandboxed preview frames block storage; the app must still run.

export const STORE_KEY = "khetha.career.v1";

// The Njinji-era key. A rename alone would have silently orphaned the saved
// work of everyone already using the app — favourites, questionnaire results,
// subject choices — because localStorage has no concept of a rename. So the
// old key is read once, copied across, and removed.
const LEGACY_STORE_KEY = "njinji.career.v1";

const memoryStore = {};

export const storage = {
  available: (() => {
    try {
      const k = "__khetha_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })(),
  read() {
    try {
      let raw = this.available ? window.localStorage.getItem(STORE_KEY) : memoryStore[STORE_KEY];
      if (raw == null && this.available) raw = this.migrateLegacy();
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** One-time move of Njinji-era data onto the Khetha key. Returns the raw
   *  JSON string if there was anything to move, otherwise null. */
  migrateLegacy() {
    try {
      const legacy = window.localStorage.getItem(LEGACY_STORE_KEY);
      if (legacy == null) return null;
      window.localStorage.setItem(STORE_KEY, legacy);
      window.localStorage.removeItem(LEGACY_STORE_KEY);
      return legacy;
    } catch {
      return null;
    }
  },
  write(value) {
    const raw = JSON.stringify(value);
    try {
      if (this.available) window.localStorage.setItem(STORE_KEY, raw);
      else memoryStore[STORE_KEY] = raw;
      return true;
    } catch {
      memoryStore[STORE_KEY] = raw;
      return false;
    }
  },
  clear() {
    try {
      if (this.available) window.localStorage.removeItem(STORE_KEY);
    } catch { /* ignore */ }
    delete memoryStore[STORE_KEY];
  },
};
