import { localStoreEnabled } from "@/content/backend-config";
import type { StoredDocs } from "@/content/docs";
import { PHOTO_WIDTHS, preparePhotoSet } from "./image";
import { saveLocalDocs, uploadLocalImage, uploadLocalVideo } from "./local-store";

/** What the admin needs from wherever content is stored. */
export interface AdminBackend {
  /** True when this is the local stand-in on this computer. */
  local: boolean;
  save(docs: StoredDocs): Promise<void>;
  /**
   * Stores a photo in the three site sizes. Returns the name the site uses for it (an
   * address; Picture adds "-<width>.webp") and its shape.
   */
  uploadPhoto(file: File): Promise<{ name: string; ratio: number }>;
  /** Stores a video file as is (checked first by prepareVideo). Returns its address. */
  uploadVideo(file: File, extension: string): Promise<string>;
}

async function toBase64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** Local development: saves go to files on this computer. */
function localBackend(): AdminBackend {
  return {
    local: true,
    async save(docs) {
      await saveLocalDocs({ data: docs });
    },
    async uploadPhoto(file) {
      const { files, ratio } = await preparePhotoSet(file);
      const id = `u-${crypto.randomUUID()}`;
      let address = "";
      for (const width of PHOTO_WIDTHS) {
        const saved = await uploadLocalImage({
          data: { name: `${id}-${width}.webp`, base64: await toBase64(files[width]) },
        });
        address = saved.replace(/-\d+\.webp$/, "");
      }
      return { name: address, ratio };
    },
    async uploadVideo(file, extension) {
      const form = new FormData();
      form.set("name", `u-${crypto.randomUUID()}.${extension}`);
      form.set("file", file);
      return uploadLocalVideo({ data: form });
    },
  };
}

/**
 * Null when there is nowhere to save yet. Deploy phase: a Cloudflare backend (D1 for the
 * records, R2 for photos and the hero video) goes here. Its server functions call
 * requireAdmin first, like the local ones, so only a signed-in admin can save.
 */
export function getBackend(): AdminBackend | null {
  return localStoreEnabled() ? localBackend() : null;
}
