import { lazy, type ComponentType } from "react";

/**
 * Lazy-load a route component with stale-chunk recovery.
 *
 * After a deploy, returning users may hold an old index.html that
 * references hashed chunk URLs that no longer exist. The first dynamic
 * import then throws "Importing a module script failed" /
 * "Failed to fetch dynamically imported module".
 *
 * On the first such failure per session we:
 *   1) unregister any service workers,
 *   2) delete all caches,
 *   3) hard-reload to fetch a fresh index.html with current chunk hashes.
 *
 * A sessionStorage flag prevents infinite reload loops.
 */

const RECOVERY_FLAG = "__sw_recovered_v1";

const STALE_PATTERNS = [
  "Importing a module script failed",
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "ChunkLoadError",
  "Loading chunk",
  "Loading CSS chunk",
];

function isStaleChunkError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    typeof err === "string"
      ? err
      : (err as { message?: string })?.message ?? String(err);
  return STALE_PATTERNS.some((p) => msg.includes(p));
}

let recovering = false;

async function recoverAndReload(): Promise<never> {
  if (!recovering) {
    recovering = true;
    try {
      if (typeof sessionStorage !== "undefined") {
        if (sessionStorage.getItem(RECOVERY_FLAG)) {
          // Already tried once this session — let the error bubble so
          // the ErrorBoundary can render rather than reloading forever.
          throw new Error("Stale chunk recovery already attempted");
        }
        sessionStorage.setItem(RECOVERY_FLAG, String(Date.now()));
      }

      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          regs.map((r) => r.unregister().catch(() => undefined))
        );
      }

      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(
          keys.map((k) => caches.delete(k).catch(() => false))
        );
      }
    } catch (e) {
      if ((e as Error)?.message === "Stale chunk recovery already attempted") {
        throw e;
      }
      // ignore — proceed to reload regardless
    }

    const url = new URL(window.location.href);
    url.searchParams.set("_swr", Date.now().toString(36));
    window.location.replace(url.toString());
  }

  // Block forever while the reload is happening so React's Suspense
  // never sees the rejection (and never falls through to ErrorBoundary).
  return new Promise<never>(() => undefined);
}

export function safeLazy<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      if (isStaleChunkError(err)) {
        return recoverAndReload();
      }
      throw err;
    })
  );
}
