import { localStoreEnabled } from "./backend-config";

// Photos and videos uploaded in the admin: checked, then kept in R2 on the live site (files on
// this computer in development), and served back at /uploads/<name>.

/** An uploaded file's name: made by the admin, never by a visitor. */
export const UPLOAD_NAME = /^u-[\w-]{8,64}(?:-(?:480|960|1600)\.webp|\.(?:mp4|webm))$/;
export const PHOTO_NAME = /^u-[\w-]{8,64}-(?:480|960|1600)\.webp$/;
export const VIDEO_NAME = /^u-[\w-]{8,64}\.(?:mp4|webm)$/;
export const PHOTO_MAX_BYTES = 6 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 8 * 1024 * 1024;

/** The type each file is served with, from its name: never what the browser claimed. */
export function contentTypeOf(name: string) {
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  return null;
}

const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.subarray(from, to));

/**
 * Whether the file's first bytes match its name's type, so a renamed file of another kind
 * (a page, a script) is refused.
 */
export function signatureMatches(name: string, bytes: Uint8Array) {
  const type = contentTypeOf(name);
  if (type === "image/webp") return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
  if (type === "video/mp4") return ascii(bytes, 4, 8) === "ftyp";
  if (type === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
}

/** Checks and stores one upload; returns its address on the site. */
export async function storeUpload(name: string, bytes: Uint8Array) {
  if (!UPLOAD_NAME.test(name)) throw new Error("Bad file name");
  const max = PHOTO_NAME.test(name) ? PHOTO_MAX_BYTES : VIDEO_MAX_BYTES;
  if (bytes.byteLength > max) throw new Error("File too large");
  if (!signatureMatches(name, bytes)) throw new Error("File content doesn't match its type");

  if (localStoreEnabled()) {
    const { writeLocalUpload } = await import("./dev-store.server");
    return writeLocalUpload(name, bytes);
  }
  const { uploadsBucket } = await import("./cloudflare.server");
  const bucket = uploadsBucket();
  if (!bucket) throw new Error("Uploads storage isn't connected");
  await bucket.put(name, bytes, { httpMetadata: { contentType: contentTypeOf(name)! } });
  return `/uploads/${name}`;
}

export type StoredPhoto = { name: string; uploaded: number };

/**
 * Every photo in storage (the admin's photo library), newest first: one entry per set, by the
 * address the site uses for it. Videos are left out.
 */
export async function listStoredPhotos(): Promise<StoredPhoto[]> {
  const small = /^(u-[\w-]{8,64})-480\.webp$/;
  const found: StoredPhoto[] = [];
  if (localStoreEnabled()) {
    const { listLocalUploads } = await import("./dev-store.server");
    for (const { name, modified } of await listLocalUploads()) {
      const match = small.exec(name);
      if (match) found.push({ name: `/local-uploads/${match[1]}`, uploaded: modified });
    }
  } else {
    const { uploadsBucket } = await import("./cloudflare.server");
    const bucket = uploadsBucket();
    if (!bucket) throw new Error("Uploads storage isn't connected");
    let cursor: string | undefined;
    do {
      const page = await bucket.list({ prefix: "u-", ...(cursor ? { cursor } : {}) });
      for (const object of page.objects) {
        const match = small.exec(object.key);
        if (match)
          found.push({ name: `/uploads/${match[1]}`, uploaded: object.uploaded.getTime() });
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
  }
  return found.sort((a, b) => b.uploaded - a.uploaded);
}

/** An uploaded photo set's address: "/uploads/u-…" (live) or "/local-uploads/u-…". */
export const STORED_PHOTO = /^\/(?:uploads|local-uploads)\/(u-[\w-]{8,64})$/;

/**
 * Whether the saved content uses this address anywhere (as a whole value). Takes the records
 * themselves, or their saved text (a list of strings).
 */
export const contentUses = (docs: unknown, name: string) => {
  const quoted = JSON.stringify(name);
  if (Array.isArray(docs) && docs.every((d) => typeof d === "string"))
    return docs.some((text) => text.includes(quoted));
  return JSON.stringify(docs).includes(quoted);
};

/**
 * Deletes a photo set (all three sizes) from storage, for good. Refuses a photo the saved
 * content still uses, whatever the admin page thinks.
 */
export async function deleteStoredPhoto(name: string) {
  const match = STORED_PHOTO.exec(name);
  if (!match) throw new Error("Bad photo address");
  // Read strictly: if the saved content can't be read, nothing is deleted.
  let saved: unknown;
  if (localStoreEnabled()) {
    const { readLocalDocs } = await import("./dev-store.server");
    saved = await readLocalDocs();
  } else {
    const { database } = await import("./cloudflare.server");
    const db = database();
    if (!db) throw new Error("Content storage isn't connected");
    // The raw saved text, so even a section that no longer parses counts.
    const { results } = await db.prepare("SELECT value FROM docs").all<{ value: string }>();
    saved = results.map((row) => row.value);
  }
  if (contentUses(saved, name)) throw new Error("התמונה בשימוש באתר");
  const files = [480, 960, 1600].map((width) => `${match[1]}-${width}.webp`);
  if (localStoreEnabled()) {
    const { deleteLocalUploads } = await import("./dev-store.server");
    await deleteLocalUploads(files);
    return;
  }
  const { uploadsBucket } = await import("./cloudflare.server");
  const bucket = uploadsBucket();
  if (!bucket) throw new Error("Uploads storage isn't connected");
  await bucket.delete(files);
}

/** Names never change content (a new upload gets a new name), so browsers may keep them. */
const CACHE_FOREVER = "public, max-age=31536000, immutable";

/**
 * Serves an upload from R2, with range requests so the hero video can start before it has
 * fully downloaded and Safari can play it at all.
 */
export async function serveUpload(request: Request, name: string) {
  const type = contentTypeOf(name);
  const { uploadsBucket } = await import("./cloudflare.server");
  const bucket = uploadsBucket();
  if (!UPLOAD_NAME.test(name) || !type || !bucket)
    return new Response("Not found", { status: 404 });

  const range = request.headers.get("range");
  let object;
  try {
    object = await bucket.get(name, {
      ...(range ? { range: request.headers } : {}),
      onlyIf: request.headers,
    });
  } catch {
    // A range R2 can't serve (past the end, malformed): answer it, not the error page.
    const head = await bucket.head(name);
    if (!head) return new Response("Not found", { status: 404 });
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${head.size}` },
    });
  }
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": type,
    "Cache-Control": CACHE_FOREVER,
    ETag: object.httpEtag,
    "Accept-Ranges": "bytes",
    // Served as media only, never as a page.
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });
  // A conditional request whose copy is still current: R2 returns no body.
  if (!("body" in object)) return new Response(null, { status: 304, headers });

  const part = object.range;
  // A start past the end: R2 hands back the whole file, which isn't what was asked for.
  const from = /^bytes=(\d+)-/.exec(range ?? "")?.[1];
  if (from !== undefined && Number(from) >= object.size) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${object.size}` },
    });
  }
  if (range && part) {
    const start = part.offset ?? (part.suffix ? object.size - part.suffix : 0);
    const length = part.length ?? part.suffix ?? object.size - start;
    headers.set("Content-Range", `bytes ${start}-${start + length - 1}/${object.size}`);
    headers.set("Content-Length", String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { headers });
}
