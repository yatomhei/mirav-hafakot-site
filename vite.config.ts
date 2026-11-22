// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Local development only: serves photos uploaded in the admin straight from disk. Vite learns
 * about new files in public/ a moment after they are written, so a preview requested right
 * after an upload got a 404 and stayed broken until the page was reloaded. The live site keeps
 * uploads in Cloudflare storage instead.
 */
function freshLocalUploads(): Plugin {
  const PHOTO = /^\/local-uploads\/(u-[\w-]{8,64}-(?:480|960|1600)\.webp)$/;
  return {
    name: "fresh-local-uploads",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const name = PHOTO.exec((req.url ?? "").split("?")[0] ?? "")?.[1];
        if (!name) return next();
        try {
          const file = await readFile(join(process.cwd(), "public", "local-uploads", name));
          res.setHeader("Content-Type", "image/webp");
          res.setHeader("Cache-Control", "no-cache");
          res.end(file);
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [freshLocalUploads()],
    server: {
      // This computer only: other devices on the network can't reach the dev server.
      host: "localhost",
      fs: {
        // Vite's defaults, plus the local admin data (its sign-in secret must never be served).
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.local-content/**"],
      },
    },
  },
});
