// Extracted from App.jsx (Stage 3 of frontend restructuring plan).
// Offline: IndexedDB with a localStorage fallback.

// Deliberately NOT renamed to "khetha-career" with the rest of the rebrand.
// This database holds the offline pack a learner has already paid for in mobile
// data. Opening a differently-named database creates an empty one, so the
// rename would present as "your offline content is gone, download it again" —
// on a metered connection, for the learners least able to afford it. The name
// is an internal identifier no one sees; the cost of changing it is real.
const IDB_NAME = "njinji-career";
const IDB_STORE = "kv";

export function idbOpen() {
  return new Promise((resolve, reject) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) { reject(e); }
  });
}

export async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}
