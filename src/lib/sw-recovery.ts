/**
 * Shared stale-chunk recovery logic.
 *
 * After a deploy, returning users may hold an old index.html that
 * references hashed chunk URLs that no longer exist.
 */

export const RECOVERY_FLAG = "__sw_recovered_v1";

export const STALE_PATTERNS = [
  "Importing a module script failed",
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "ChunkLoadError",
  "Loading chunk",
  "Loading CSS chunk",
  "TypeError: Failed to fetch", // Often accompanies failed dynamic imports on mobile
];

/**
 * Check if an error object or message corresponds to a stale chunk failure.
 */
export function isStaleChunkError(err: unknown): boolean {
  if (!err) return false;

  // Specifically ignore "Stale chunk recovery already attempted" to avoid re-triggering
  if ((err as Error)?.message === "Stale chunk recovery already attempted") {
    return false;
  }

  const msg =
    typeof err === "string"
      ? err
      : (err as { message?: string })?.message ?? String(err);

  return STALE_PATTERNS.some((p) => msg.includes(p));
}

let recovering = false;

/**
 * Unregister service workers, clear caches, and reload the page with a cache-buster.
 */
export async function recoverAndReload(): Promise<never> {
  if (recovering) {
    // Block while already recovering
    return new Promise<never>(() => undefined);
  }

  recovering = true;

  try {
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(RECOVERY_FLAG)) {
        // Already tried once this session — throw to let ErrorBoundary handle it.
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
    // ignore other errors — proceed to reload regardless
  }

  const url = new URL(window.location.href);
  url.searchParams.set("_swr", Date.now().toString(36));
  window.location.replace(url.toString());

  // Block forever while the reload is happening.
  return new Promise<never>(() => undefined);
}

/**
 * Initialize global listeners for stale chunk errors.
 */
export function installSwRecovery() {
  if (typeof window === "undefined") return;

  // Clear the recovery flag on a successful, fully-loaded page so future
  // failures (after another deploy) can self-heal again.
  window.addEventListener("load", () => {
    try {
      sessionStorage.removeItem(RECOVERY_FLAG);
    } catch {
      // ignore
    }
  });

  window.addEventListener("error", (event) => {
    if (isStaleChunkError(event.message) || isStaleChunkError(event.error)) {
      void recoverAndReload().catch(() => {
        // Error is expected if recovery was already attempted;
        // let it bubble to the global handler/ErrorBoundary.
      });
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (isStaleChunkError(event.reason)) {
      void recoverAndReload().catch(() => {
        // Error is expected if recovery was already attempted.
      });
    }
  });
}
