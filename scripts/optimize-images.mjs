// Builds the web images in public/images/ from the originals in media-src/.
// Photos get three WebP widths (480, 960, 1600) for srcset; logos keep transparency as
// WebP. Run: node scripts/optimize-images.mjs
import { readdir, mkdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC = "media-src";
const OUT = "public/images";
const WIDTHS = [480, 960, 1600];
const LOGO_HEIGHTS = { "logo-color": 144, "logo-cream": 280 };

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

for (const file of files) {
  const { name } = parse(file);
  const input = join(SRC, file);
  const meta = await sharp(input).metadata();

  if (name.startsWith("logo-")) {
    // Logos: one crisp size, 3x the display height. The colour logo sits in the header and
    // footer at 48px; the cream one is the large logo over the hero video.
    const height = LOGO_HEIGHTS[name] ?? 280;
    await sharp(input)
      .resize({ height, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(join(OUT, `${name}.webp`));
    console.log(`${name}: logo`);
    if (name === "logo-color") {
      // The landing page shows it large at the top (up to 128px tall): a sharper copy.
      await sharp(input)
        .resize({ height: 384, withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(join(OUT, "logo-color-lg.webp"));
      console.log("logo-color-lg: logo");
    }
    continue;
  }

  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width ?? w);
    await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(join(OUT, `${name}-${w}.webp`));
  }
  const size = (await stat(join(OUT, `${name}-960.webp`))).size;
  console.log(`${name}: ${meta.width}x${meta.height} → 960w ${(size / 1024).toFixed(0)} KB`);
}
