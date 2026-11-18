import { createServerFn } from "@tanstack/react-start";
import { localStoreEnabled } from "@/content/backend-config";
import { validateDoc, type StoredDocs } from "@/content/docs";
import { docSchemas, type DocKey } from "@/content/schema";

// Local development only: the admin saves through these. They refuse to run anywhere else,
// so they do nothing on the live site (Cloudflare takes over there at deploy). Each one
// checks the admin sign-in first (auth/auth.server.ts), as the Cloudflare versions will.

async function assertAdminLocal() {
  const { requireAdmin } = await import("./auth/auth.server");
  await requireAdmin();
  if (!localStoreEnabled()) throw new Error("Local content store is disabled here");
}

export const saveLocalDocs = createServerFn({ method: "POST" })
  .inputValidator((docs: StoredDocs) => {
    // The server checks every record too, not just the admin page.
    for (const [key, value] of Object.entries(docs)) {
      if (!(key in docSchemas)) throw new Error(`Unknown section: ${key}`);
      if (!validateDoc(key as DocKey, value).success) throw new Error(`Invalid section: ${key}`);
    }
    return docs;
  })
  .handler(async ({ data }) => {
    await assertAdminLocal();
    const { writeLocalDocs } = await import("@/content/dev-store.server");
    await writeLocalDocs(data);
  });

export const uploadLocalImage = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; base64: string }) => {
    if (!/^u-[\w-]{8,64}-(480|960|1600)\.webp$/.test(input.name)) throw new Error("Bad file name");
    if (input.base64.length > 8_000_000) throw new Error("File too large");
    return input;
  })
  .handler(async ({ data }) => {
    await assertAdminLocal();
    const { writeLocalUpload } = await import("@/content/dev-store.server");
    return writeLocalUpload(data.name, data.base64);
  });

/** The hero video, sent as the file itself (too big to send as text). */
export const uploadLocalVideo = createServerFn({ method: "POST" })
  .inputValidator((form: FormData) => {
    if (!(form instanceof FormData)) throw new Error("Expected a form");
    const name = form.get("name");
    const file = form.get("file");
    if (typeof name !== "string" || !/^u-[\w-]{8,64}\.(mp4|webm)$/.test(name)) {
      throw new Error("Bad file name");
    }
    if (!(file instanceof Blob)) throw new Error("Missing file");
    if (file.size > 30 * 1024 * 1024) throw new Error("File too large");
    return { name, file };
  })
  .handler(async ({ data }) => {
    await assertAdminLocal();
    const { writeLocalUpload } = await import("@/content/dev-store.server");
    return writeLocalUpload(data.name, new Uint8Array(await data.file.arrayBuffer()));
  });
