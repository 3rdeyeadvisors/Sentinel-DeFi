## What's actually wrong

The live site error you screenshotted is:

> TypeError: Importing a module script failed.

This is **not** a code bug in any component. It is the classic PWA stale-cache problem:

1. Your app uses `vite-plugin-pwa` with `registerType: 'autoUpdate'` and aggressive Workbox caching (`globPatterns: ['**/*.{js,css,html,...}']` + `skipWaiting: true`).
2. A returning visitor (you, on iOS Safari) still has the **old service worker** active. It serves a cached `index.html` that references old hashed chunks like `assets/index-CYAFCS6A.js` and old lazy chunks for `Index`, `HeroSection`, etc.
3. Those old chunk filenames no longer exist on the new deploy (because you've shipped 50+ file changes since). The browser tries to `import()` them, gets a 404 / wrong MIME, and throws `Importing a module script failed`.
4. React's lazy/Suspense bubbles it to `ErrorBoundary` → "Something went wrong".

The other console noise (X-Frame-Options meta warning, apple-touch-icon manifest warning, GA blocked) is unrelated and harmless.

## The fix (2 small, surgical changes)

### 1. Self-heal on dynamic-import failure

Add a tiny script (loaded as early as possible from `index.html`, or from `src/main.tsx` before anything else) that:

- Listens for `window` `error` and `unhandledrejection`.
- If the message matches any of: `Importing a module script failed`, `Failed to fetch dynamically imported module`, `error loading dynamically imported module`, `ChunkLoadError`:
  1. Unregister all service workers.
  2. `caches.keys()` → `caches.delete(...)` for every cache.
  3. Set a one-shot `sessionStorage` flag (`__sw_recovered`) so we don't reload-loop.
  4. `location.reload()` once.
- If the flag is already set, do nothing (let `ErrorBoundary` show).

This unblocks every existing visitor automatically on next page load — they won't need to clear cache manually.

### 2. Make future deploys safer

In `vite.config.ts` for the `VitePWA` block:

- Add `skipWaiting: true` + `clientsClaim: true` are already set — keep them.
- Tighten `globPatterns` so the SW does **not** precache `index.html` (the html fallback is what pins users to old chunk URLs). Replace with: precache only hashed `assets/**/*.{js,css}` (these are content-hashed and safe), and use `NetworkFirst` runtime caching for `index.html` / navigation requests.
- Set `navigateFallback: 'index.html'` together with a `NetworkFirst` route for navigations so a fresh `index.html` (with current chunk hashes) is fetched whenever online.

Net effect: future redeploys can never strand a returning user on stale chunk URLs.

### 3. (Optional cleanup, low priority)

- Remove `<meta http-equiv="X-Frame-Options" ...>` from `index.html` if present — must be an HTTP header, not a meta tag (that's what's spamming console).
- Verify `/apple-touch-icon.png?v=3` actually exists in `public/` (manifest warning).

## Files touched

- `src/main.tsx` (or new `src/lib/sw-recovery.ts` imported first thing) — add the self-heal listener.
- `vite.config.ts` — adjust `VitePWA` precache + add `NetworkFirst` for navigations.
- `index.html` — remove stray `X-Frame-Options` meta if present.

## What you do after

1. Approve the plan; I implement the 3 edits.
2. Click **Publish → Update**.
3. Reload `sentineldefi.online` once. Your phone will hit the recovery path, swap to the fresh worker, and the homepage will render. Every other returning visitor heals the same way automatically.

## Why this isn't an ErrorBoundary issue

ErrorBoundary already shows the right message ("Importing a module script failed") — it's doing its job. There is no React render bug to fix; the failure happens at the network/module-loader level before any component mounts. The cure is at the service-worker layer, not in app code.
