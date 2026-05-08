import { lazy, type ComponentType } from "react";
import { isStaleChunkError, recoverAndReload } from "./sw-recovery";

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
