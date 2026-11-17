import type { StoredDocs } from "./docs";
import { localStoreEnabled } from "./backend-config";

/**
 * Reads every saved record. Any failure returns no records, so the site falls back to its
 * launch content rather than an error page.
 *
 * Deploy phase: on Cloudflare this reads the D1 table instead (see the deploy checklist).
 */
export async function readStoredDocs(): Promise<StoredDocs> {
  if (localStoreEnabled()) {
    const { readLocalDocs } = await import("./dev-store.server");
    return readLocalDocs();
  }
  return {};
}
