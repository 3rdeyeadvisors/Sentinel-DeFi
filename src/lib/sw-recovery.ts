/**
 * Self-heal stale service-worker / chunk-load failures.
 *
 * After a redeploy, returning visitors may still have an old service worker
 * serving a cached index.html that references hashed chunk filenames that no
 * longer exist. The dynamic import then throws "Importing a module script
 * failed" / "Failed to fetch dynamically imported module".
 *
 * On first such error, we unregister all SWs, wipe caches, and reload once.
 * A sessionStorage flag prevents reload loops.
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

function isStaleChunkError(message: unknown): boolean {
  if (!message) return false;
  const text =
    typeof message === "string"
      ? message
      : (message as { message?: string })?.message ?? String(message);
  return STALE_PATTERNS.some((p) => text.includes(p));
}

let recovering = false;

async function recover() {
  if (recovering) return;
  recovering = true;

  try {
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(RECOVERY_FLAG)) {
        // Already tried once this session — give up and let ErrorBoundary show.
        return;
      }
      sessionStorage.setItem(RECOVERY_FLAG, String(Date.now()));
    }

    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => undefined)));
    }

    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
  } catch {
    // ignore — proceed to reload regardless
  }

  // Cache-bust the navigation so the browser re-fetches a fresh index.html
  // pointing at the current chunk hashes.
  const url = new URL(window.location.href);
  url.searchParams.set("_swr", Date.now().toString(36));
  window.location.replace(url.toString());
}

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
      void recover();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (isStaleChunkError(event.reason)) {
      void recover();
    }
  });
}
