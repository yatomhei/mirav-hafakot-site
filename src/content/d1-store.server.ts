import type { EmailStore } from "@/admin/auth/allowlist";
import type { D1Database } from "./cloudflare.server";
import type { StoredDocs } from "./docs";

// The live site's saved content and added admins, in D1 (tables in migrations/0001_init.sql).

export async function readD1Docs(db: D1Database): Promise<StoredDocs> {
  const { results } = await db.prepare("SELECT key, value FROM docs").all<{
    key: string;
    value: string;
  }>();
  const docs: StoredDocs = {};
  for (const row of results) {
    try {
      (docs as Record<string, unknown>)[row.key] = JSON.parse(row.value);
    } catch {
      // A broken row costs that section its edits (the launch content shows), never the page.
      console.warn(`[content] saved "${row.key}" is not valid JSON`);
    }
  }
  return docs;
}

/** Saves the given sections together: either all of them are saved or none. */
export async function writeD1Docs(db: D1Database, docs: StoredDocs, by: string) {
  const now = Date.now();
  const statements = Object.entries(docs).map(([key, value]) =>
    db
      .prepare(
        `INSERT INTO docs (key, value, updated_at, updated_by) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3, updated_by = ?4`,
      )
      .bind(key, JSON.stringify(value), now, by),
  );
  if (statements.length) await db.batch(statements);
}

export function d1EmailStore(db: D1Database): EmailStore {
  return {
    async all() {
      const { results } = await db
        .prepare("SELECT email FROM admin_emails ORDER BY email")
        .all<{ email: string }>();
      return results.map((r) => r.email);
    },
    async add(email) {
      await db
        .prepare("INSERT OR IGNORE INTO admin_emails (email, added_at) VALUES (?1, ?2)")
        .bind(email, Date.now())
        .run();
    },
    async remove(email) {
      await db.prepare("DELETE FROM admin_emails WHERE email = ?1").bind(email).run();
    },
  };
}
