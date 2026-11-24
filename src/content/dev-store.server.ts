import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { StoredDocs } from "./docs";

// Local development only (see localStoreEnabled): saved records go to a JSON file and
// uploaded photos and videos to .local-content/uploads, both git-ignored and never part of a
// build. vite.config.ts serves the uploads at /local-uploads/<name>.

const DOCS_DIR = join(process.cwd(), ".local-content");
const DOCS_FILE = join(DOCS_DIR, "site-content.json");
export const UPLOAD_DIR = join(DOCS_DIR, "uploads");

export async function readLocalDocs(): Promise<StoredDocs> {
  try {
    return JSON.parse(await readFile(DOCS_FILE, "utf8")) as StoredDocs;
  } catch {
    return {};
  }
}

export async function writeLocalDocs(docs: StoredDocs) {
  const current = await readLocalDocs();
  await mkdir(DOCS_DIR, { recursive: true });
  await writeFile(DOCS_FILE, JSON.stringify({ ...current, ...docs }, null, 2));
}

/** Saves one uploaded file (checked by storeUpload) and returns its address on the site. */
/** The files in the local uploads folder, with when each was written. */
export async function listLocalUploads() {
  const { readdir, stat } = await import("node:fs/promises");
  let names: string[] = [];
  try {
    names = await readdir(UPLOAD_DIR);
  } catch {
    return [];
  }
  return Promise.all(
    names.map(async (name) => {
      const info = await stat(join(UPLOAD_DIR, name));
      return { name, modified: info.mtimeMs, size: info.size };
    }),
  );
}

/** Deletes files from the local uploads folder (any already gone are skipped). */
export async function deleteLocalUploads(names: string[]) {
  const { rm } = await import("node:fs/promises");
  await Promise.all(names.map((name) => rm(join(UPLOAD_DIR, name), { force: true })));
}

export async function writeLocalUpload(name: string, data: Uint8Array) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, name), data);
  return `/local-uploads/${name}`;
}
