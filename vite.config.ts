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
 * Local development only: serves photos and videos uploaded in the admin from
 * .local-content/uploads (outside public/, so a build never ships them). The live site keeps
 * uploads in Cloudflare R2 and serves them at /uploads/<name> instead.
 */
function localUploads(): Plugin {
  const UPLOAD = /^\/local-uploads\/(u-[\w-]{8,64}(?:-(?:480|960|1600)\.webp|\.(mp4|webm)))$/;
  return {
    name: "local-uploads",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = UPLOAD.exec((req.url ?? "").split("?")[0] ?? "");
        if (!match) return next();
        try {
          const file = await readFile(join(process.cwd(), ".local-content", "uploads", match[1]!));
          res.setHeader("Content-Type", match[2] ? `video/${match[2]}` : "image/webp");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Accept-Ranges", "bytes");
          // Video players ask for parts of the file.
          const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
          if (range && (range[1] || range[2])) {
            const size = file.length;
            const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
            const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
            res.statusCode = 206;
            res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
            res.end(file.subarray(start, end + 1));
            return;
          }
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
    plugins: [localUploads()],
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
