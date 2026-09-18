// Extracted from App.jsx (Stage 3 of frontend restructuring plan).
// Persistence: localStorage with a graceful in-memory fallback.
// Some sandboxed preview frames block storage; the app must still run.

export const STORE_KEY = "njinji.career.v1";
const memoryStore = {};

export const storage = {
  available: (() => {
    try {
      const k = "__njinji_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })(),
  read() {
    try {
      const raw = this.available ? window.localStorage.getItem(STORE_KEY) : memoryStore[STORE_KEY];
      return raw ? JSON.parse(raw) : null;
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
