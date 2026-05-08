// Mirror of /sw.js — see that file for full notes.
// Some older clients may have registered the worker at this path.

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try { await self.clients.claim(); } catch {}
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
      try { await self.registration.unregister(); } catch {}
    })()
  );
});

self.addEventListener("fetch", () => {});
