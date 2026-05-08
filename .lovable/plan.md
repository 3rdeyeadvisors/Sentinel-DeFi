## What’s actually wrong

Your platform is not broadly “down” — the live failure is a **stale PWA/service-worker deployment bug affecting returning clients**, especially mobile Safari/home-screen users.

### Root cause
- The app currently ships `vite-plugin-pwa` in `vite.config.ts`.
- The live `sw.js` is still registering a Workbox navigation fallback:
  `createHandlerBoundToURL("index.html")`
- That means the service worker can keep serving an **old app shell / old `index.html`** after a new deploy.
- Your app uses **`React.lazy()` for nearly every route/page** in `src/App.tsx`.
- When the old HTML tries to import a chunk from the previous deploy, that hashed JS file no longer exists, so users get:
  `TypeError: Importing a module script failed.`
- The visible card in your screenshot is coming from `src/components/ErrorBoundary.tsx`.

### Why my previous “it’s working” statement was wrong
A fresh desktop visit loads the newest files and looks normal. That does **not** prove older mobile clients are healthy. Your screenshot is the real failure mode: **stale returning client + lazy chunk mismatch**.

## Evidence I verified

### In code
- `vite.config.ts`
  - PWA plugin is enabled
  - `navigateFallback: 'index.html'`
- `src/App.tsx`
  - many pages are loaded via `lazy(() => import(...))`
- `src/components/ErrorBoundary.tsx`
  - matches the exact UI shown in your screenshot
- `src/lib/sw-recovery.ts`
  - recovery exists, but it relies on global `error` / `unhandledrejection`

### On the live site
- The published `sw.js` still contains:
  - `NavigationRoute(createHandlerBoundToURL("index.html"))`
  - runtime HTML caching
- Current chunk files exist for fresh visits, which explains why new sessions can look fine while old cached clients still break.

## Why the current recovery is not enough
- `React.lazy()` failures are often surfaced inside React rendering flow.
- React can hand that failure to your `ErrorBoundary` before the global recovery handler can reliably self-heal.
- So affected users land on the error card instead of automatic cleanup/reload.

## Plan to fix

1. **Remove the service-worker dependency from the loading path**
   - Disable/remove full PWA service-worker behavior unless you explicitly need offline support.
   - Keep installability via manifest only if desired.

2. **Ship a kill-switch worker at the same SW path(s)**
   - Publish a static cleanup worker for `/sw.js` (and `/service-worker.js` if ever used)
   - It should claim clients, delete caches, navigate open tabs, and unregister itself.
   - This is necessary because simply removing the plugin does not uninstall old workers already on client devices.

3. **Stop caching navigations to the app shell**
   - No precached `index.html`
   - No `createHandlerBoundToURL("index.html")` app-shell fallback for this project
   - No offline-first shell behavior for HTML

4. **Make route-level lazy failures self-heal inside React**
   - Wrap lazy imports with a retry/reload-aware helper so stale-chunk failures trigger cleanup even when React catches them.
   - Do not rely only on `window` global listeners.

5. **Republish and validate on mobile Safari behavior**
   - Test a fresh session
   - Test a stale-client simulation
   - Test direct route loads and a returning-session reload

## Technical details

Files to change in implementation:
- `vite.config.ts`
- `src/App.tsx`
- `src/lib/sw-recovery.ts`
- likely `public/sw.js` and possibly `public/service-worker.js`

Implementation direction:
- Prefer **manifest-only installability** over full PWA for this project.
- Add a temporary cleanup worker release to flush existing bad clients.
- Replace plain `React.lazy()` for route imports with a safe lazy loader that can trigger recovery on chunk-load failures.

## Expected outcome
- Existing broken mobile clients recover after one revisit/reload cycle.
- New deploys stop breaking returning users with missing chunk hashes.
- The “Something went wrong / Importing a module script failed” card stops appearing for this deployment pattern.