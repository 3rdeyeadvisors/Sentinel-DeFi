// Kill-switch service worker.
//
// Replaces the previous Workbox-based PWA worker that was caching the
// app shell (index.html) and pinning returning users to stale chunk
// hashes after deploys, causing "Importing a module script failed" errors.
//
// On install/activate, this worker:
//   1) takes control of all open clients,
//   2) deletes every cache it can see,
//   3) navigates open tabs to a cache-busting URL,
//   4) unregisters itself.
//
// Keep this file shipping for at least one full release cycle so that
// every previously-affected device gets cleaned up.

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.clients.claim();
      } catch {}

      try {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n).catch(() => false)));
      } catch {}

      try {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        await Promise.all(
          clients.map((c) => {
            try {
              const url = new URL(c.url);
              url.searchParams.set("sw-cleanup", Date.now().toString(36));
              return c.navigate(url.toString()).catch(() => undefined);
            } catch {
              return undefined;
            }
          })
        );
      } catch {}

      try {
        await self.registration.unregister();
      } catch {}
    })()
  );
});

// Pass through any fetches untouched while we're alive.
self.addEventListener("fetch", () => {});
