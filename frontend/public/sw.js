/* Service worker for the Khetha PWA.
 *
 * Deliberately conservative, because this app carries learner personal
 * information and talks to a real API:
 *
 *   - App shell (HTML, JS, CSS, icons) is cached so the app opens with no
 *     signal. That is the whole point for a learner on a capped data bundle.
 *   - API responses are NEVER cached. Marks, profiles and mentor messages are
 *     personal and must not be served stale from a shared or borrowed device.
 *     They also carry auth headers, which have no business in a cache.
 *   - Navigations are network-first with a cached fallback, so a learner with
 *     signal always gets the current build and only falls back offline.
 *
 * KNOWN BEHAVIOUR: offline works from the SECOND visit onward. Vite fingerprints
 * asset filenames at build time, so this worker cannot precache them by name —
 * they are cached as they are first requested, which only happens once the
 * worker is controlling the page. The first visit needs a connection anyway,
 * since that is when the app is downloaded. If first-visit-offline ever
 * matters, vite-plugin-pwa generates a precache manifest of the hashed names
 * and would replace this file.
 */

const VERSION = "khetha-v1";
const SHELL = `${VERSION}-shell`;

const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // a failed precache must not block install
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch the API, Supabase, or anything cross-origin with credentials.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network first, fall back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put("/index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/index.html").then((r) => r || Response.error()))
    );
    return;
  }

  // Static assets: cache first, since Vite fingerprints filenames.
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});

// Lets the page trigger an immediate update rather than waiting for a reload.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
