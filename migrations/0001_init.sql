-- The live site's content database (Cloudflare D1). Apply with:
--   npx wrangler d1 migrations apply mirav-content --config wrangler.jsonc --local   (this computer)
--   npx wrangler d1 migrations apply mirav-content --config wrangler.jsonc --remote  (live)

-- One row per admin section ("site", "home.hero", "services", ...): the saved value as JSON.
CREATE TABLE docs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT
);

-- Emails added in the admin's "מנהלים" tab. The owners come from ADMIN_EMAILS, not from here.
CREATE TABLE admin_emails (
  email TEXT PRIMARY KEY,
  added_at INTEGER NOT NULL
);
