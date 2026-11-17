import { createServerFn } from "@tanstack/react-start";
import { assembleContent } from "./docs";

/** The site's content: launch content with every valid saved record applied. */
export const loadSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { readStoredDocs } = await import("./store.server");
  return assembleContent(await readStoredDocs());
});
