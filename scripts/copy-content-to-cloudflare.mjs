// One-time copy of the content saved in the local admin into Cloudflare: the sections into the
// D1 database, the added admins too, and every uploaded photo and video the content uses into
// R2 (addresses change from /local-uploads/<name> to /uploads/<name>).
//
//   node scripts/copy-content-to-cloudflare.mjs --local --persist-to <dir>   a local test copy
//   node scripts/copy-content-to-cloudflare.mjs --remote                     the live site
//
// The live database must still be empty (it refuses otherwise, so edits made on the live admin
// are never overwritten); --force skips that check.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const remote = args.includes("--remote");
const local = args.includes("--local");
const force = args.includes("--force");
const persistAt = args.indexOf("--persist-to");
const persistTo = persistAt >= 0 ? args[persistAt + 1] : undefined;
if (remote === local) {
  console.error("Choose one: --local (a test copy) or --remote (the live site).");
  process.exit(1);
}

const CONFIG = "wrangler.jsonc";
const DATABASE = "mirav-content";
const BUCKET = "mirav-uploads";
const LOCAL = ".local-content";
const UPLOADS = join(LOCAL, "uploads");

const where = remote
  ? ["--remote"]
  : ["--local", ...(persistTo ? ["--persist-to", persistTo] : [])];
const wrangler = (...rest) =>
  execFileSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", ...rest], {
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
  });

// What's saved locally.
const docs = JSON.parse(readFileSync(join(LOCAL, "site-content.json"), "utf8"));
const emailsFile = join(LOCAL, "admin-emails.json");
const emails = existsSync(emailsFile) ? JSON.parse(readFileSync(emailsFile, "utf8")) : [];

// Refuse to overwrite live edits.
const count = JSON.parse(
  wrangler(
    "d1",
    "execute",
    DATABASE,
    "--config",
    CONFIG,
    ...where,
    "--json",
    "--command",
    "SELECT COUNT(*) AS n FROM docs",
  ),
)[0].results[0].n;
if (count > 0 && !force) {
  console.error(
    `The database already has ${count} saved sections. Nothing copied (--force to overwrite).`,
  );
  process.exit(1);
}

// Uploads the content uses: "/local-uploads/u-…" photo sets (name without "-<width>.webp") and
// videos.
const text = JSON.stringify(docs);
const used = new Set();
for (const [, name] of text.matchAll(
  /\/local-uploads\/(u-[\w-]{8,64}?(?:\.(?:mp4|webm))?)(?=")/g,
)) {
  if (/\.(mp4|webm)$/.test(name)) used.add(name);
  else for (const width of [480, 960, 1600]) used.add(`${name}-${width}.webp`);
}
for (const name of used) {
  const file = join(UPLOADS, name);
  if (!existsSync(file)) {
    console.error(`Missing upload ${file}; nothing copied.`);
    process.exit(1);
  }
}
for (const name of used) {
  const type = name.endsWith(".webp") ? "image/webp" : `video/${name.split(".").pop()}`;
  wrangler(
    "r2",
    "object",
    "put",
    `${BUCKET}/${name}`,
    "--config",
    CONFIG,
    ...where,
    "--file",
    join(UPLOADS, name),
    "--content-type",
    type,
  );
  console.log(`uploaded ${name}`);
}

// The sections and admins, in one file of SQL.
const live = JSON.parse(text.replaceAll('"/local-uploads/', '"/uploads/'));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const now = Date.now();
const sql = [
  ...Object.entries(live).map(
    ([key, value]) =>
      `INSERT OR REPLACE INTO docs (key, value, updated_at, updated_by) VALUES (${quote(key)}, ${quote(JSON.stringify(value))}, ${now}, 'copy from local admin');`,
  ),
  ...emails.map(
    (email) =>
      `INSERT OR IGNORE INTO admin_emails (email, added_at) VALUES (${quote(email)}, ${now});`,
  ),
].join("\n");
const sqlFile = join(mkdtempSync(join(tmpdir(), "mirav-copy-")), "copy.sql");
writeFileSync(sqlFile, sql);
wrangler("d1", "execute", DATABASE, "--config", CONFIG, ...where, "--file", sqlFile);

console.log(
  `Copied ${Object.keys(live).length} sections, ${emails.length} added admins and ${used.size} upload files (${remote ? "live site" : "local test copy"}).`,
);
