// Builds the shareable preview (see preview/main.tsx) into dist-preview/ with relative
// paths, so it can be published as a static page anywhere. Not used by Lovable.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "preview"),
  base: "./",
  publicDir: path.resolve(__dirname, "public"),
  plugins: [tsconfigPaths({ root: __dirname }), react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    outDir: path.resolve(__dirname, "dist-preview"),
    emptyOutDir: true,
  },
});
