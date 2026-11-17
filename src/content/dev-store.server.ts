import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { StoredDocs } from "./docs";

// Local development only (see localStoreEnabled): saved records go to a JSON file and
// uploaded photos and videos to public/local-uploads/, both git-ignored.

const DOCS_DIR = join(process.cwd(), ".local-content");
const DOCS_FILE = join(DOCS_DIR, "site-content.json");
const UPLOAD_DIR = join(process.cwd(), "public", "local-uploads");

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

/** Saves one uploaded file (base64 text or raw bytes) and returns its address on the site. */
export async function writeLocalUpload(name: string, data: string | Uint8Array) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    join(UPLOAD_DIR, name),
    typeof data === "string" ? Buffer.from(data, "base64") : data,
  );
  return `/local-uploads/${name}`;
}
