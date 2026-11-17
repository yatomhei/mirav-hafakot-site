// The shareable preview has no server, so the root loader gets the launch content directly
// (replaces src/content/load.ts in vite.preview.config.ts).
import { defaultContent } from "@/content/docs";

export const loadSiteContent = async () => defaultContent;
