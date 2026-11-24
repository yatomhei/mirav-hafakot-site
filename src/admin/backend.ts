import { localStoreEnabled } from "@/content/backend-config";
import type { StoredDocs } from "@/content/docs";
import { PHOTO_WIDTHS, preparePhotoSet } from "./image";
import { deletePhoto, listPhotos, saveDocs, uploadFile } from "./store-fns";

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
  /** Every photo in storage (the photo library), newest first. */
  listPhotos(): Promise<{ name: string; uploaded: number }[]>;
  /** Deletes an uploaded photo for good (refused while the saved content uses it). */
  deletePhoto(name: string): Promise<void>;
}

function send(name: string, file: Blob) {
  const form = new FormData();
  form.set("name", name);
  form.set("file", file);
  return uploadFile({ data: form });
}

/**
 * Saves go to D1 and R2 on the live site, to files on this computer in development (the
 * server decides; see store-fns.ts).
 */
export function getBackend(): AdminBackend {
  return {
    local: localStoreEnabled(),
    async save(docs) {
      await saveDocs({ data: docs });
    },
    async uploadPhoto(file) {
      const { files, ratio } = await preparePhotoSet(file);
      const id = `u-${crypto.randomUUID()}`;
      let address = "";
      for (const width of PHOTO_WIDTHS) {
        const saved = await send(`${id}-${width}.webp`, files[width]);
        address = saved.replace(/-\d+\.webp$/, "");
      }
      return { name: address, ratio };
    },
    async uploadVideo(file, extension) {
      return send(`u-${crypto.randomUUID()}.${extension}`, file);
    },
    listPhotos() {
      return listPhotos();
    },
    async deletePhoto(name) {
      await deletePhoto({ data: name });
    },
  };
}
