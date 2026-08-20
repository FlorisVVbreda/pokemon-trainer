const SHELL_CACHE = "poketrainer-shell-v12-go";
const SPRITE_CACHE = "poketrainer-sprites-v2";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== SPRITE_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  // Live events data: always try the network first so events stay current;
  // only fall back to a cached copy when fully offline.
  if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("ScrapedDuck")) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          if (resp.ok) caches.open(SPRITE_CACHE).then((c) => c.put(event.request, resp.clone()));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pokemon sprite artwork: cache-first, store on first view for offline reuse
  if (url.hostname === "cdn.jsdelivr.net") {
    event.respondWith(
      caches.open(SPRITE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const resp = await fetch(event.request);
          if (resp.ok) cache.put(event.request, resp.clone());
          return resp;
        } catch (e) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // App shell: cache-first, fall back to network, update cache in background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((resp) => {
            if (resp.ok) caches.open(SHELL_CACHE).then((c) => c.put(event.request, resp.clone()));
            return resp;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
