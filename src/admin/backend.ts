import { localStoreEnabled } from "@/content/backend-config";
import type { StoredDocs } from "@/content/docs";
import { PHOTO_WIDTHS, preparePhotoSet } from "./image";
import { saveLocalDocs, uploadLocalImage } from "./local-store";

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
  };
}

/**
 * Null when there is nowhere to save yet. Deploy phase: a Cloudflare backend (D1 for the
 * records, R2 for photos, the admin behind Cloudflare Access) goes here.
 */
export function getBackend(): AdminBackend | null {
  return localStoreEnabled() ? localBackend() : null;
}
