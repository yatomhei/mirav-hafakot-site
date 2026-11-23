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
  const object = await bucket.get(name, {
    ...(range ? { range: request.headers } : {}),
    onlyIf: request.headers,
  });
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
