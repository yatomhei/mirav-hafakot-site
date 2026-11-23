import type { StoredDocs } from "./docs";
import { localStoreEnabled } from "./backend-config";

/**
 * Reads every saved record: from files on this computer in development, from D1 on the live
 * site. Any failure returns no records, so the site falls back to its launch content rather
 * than an error page.
 */
export async function readStoredDocs(): Promise<StoredDocs> {
  try {
    if (localStoreEnabled()) {
      const { readLocalDocs } = await import("./dev-store.server");
      return await readLocalDocs();
    }
    const { database } = await import("./cloudflare.server");
    const db = database();
    if (!db) return {};
    const { readD1Docs } = await import("./d1-store.server");
    return await readD1Docs(db);
  } catch (error) {
    console.error("[content] reading saved content failed", error);
    return {};
  }
}
