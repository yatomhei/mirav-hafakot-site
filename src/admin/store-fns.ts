import { createServerFn } from "@tanstack/react-start";
import { validateDoc, type StoredDocs } from "@/content/docs";
import { docSchemas, type DocKey } from "@/content/schema";

// The admin saves through these: to D1 and R2 on the live site, to files on this computer in
// development. Each one checks the admin sign-in first (auth/auth.server.ts), and the server
// checks every record and file itself, not just the admin page.

async function signedInAdmin() {
  const { requireAdmin } = await import("./auth/auth.server");
  return requireAdmin();
}

export const saveDocs = createServerFn({ method: "POST" })
  .inputValidator((docs: StoredDocs) => {
    if (!docs || typeof docs !== "object" || Array.isArray(docs))
      throw new Error("Expected sections");
    for (const [key, value] of Object.entries(docs)) {
      if (!(key in docSchemas)) throw new Error(`Unknown section: ${key}`);
      if (!validateDoc(key as DocKey, value).success) throw new Error(`Invalid section: ${key}`);
    }
    return docs;
  })
  .handler(async ({ data }) => {
    const email = await signedInAdmin();
    const { localStoreEnabled } = await import("@/content/backend-config");
    if (localStoreEnabled()) {
      const { writeLocalDocs } = await import("@/content/dev-store.server");
      return writeLocalDocs(data);
    }
    const { database } = await import("@/content/cloudflare.server");
    const db = database();
    if (!db) throw new Error("Content storage isn't connected");
    const { writeD1Docs } = await import("@/content/d1-store.server");
    await writeD1Docs(db, data, email);
  });

/** One photo size or the hero video, sent as the file itself. Returns its address. */
export const uploadFile = createServerFn({ method: "POST" })
  .inputValidator((form: FormData) => {
    if (!(form instanceof FormData)) throw new Error("Expected a form");
    const name = form.get("name");
    const file = form.get("file");
    if (typeof name !== "string") throw new Error("Bad file name");
    if (!(file instanceof Blob)) throw new Error("Missing file");
    return { name, file };
  })
  .handler(async ({ data }) => {
    // Signed in before the file is even read.
    await signedInAdmin();
    const { storeUpload, PHOTO_MAX_BYTES, VIDEO_MAX_BYTES } =
      await import("@/content/uploads.server");
    if (data.file.size > Math.max(PHOTO_MAX_BYTES, VIDEO_MAX_BYTES))
      throw new Error("File too large");
    return storeUpload(data.name, new Uint8Array(await data.file.arrayBuffer()));
  });
