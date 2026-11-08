// Square favicons from the colour logo on cream. Run: node scripts/favicons.mjs
import sharp from "sharp";
const bg = { r: 250, g: 240, b: 235, alpha: 1 };
for (const [name, size] of [
  ["favicon-32.png", 32],
  ["favicon-192.png", 192],
  ["apple-touch-icon.png", 180],
]) {
  const inner = Math.round(size * 0.86);
  const logo = await sharp("media-src/logo-color.png")
    .resize(inner, inner, { fit: "contain", background: { ...bg, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`public/${name}`);
}
console.log("favicons done");
