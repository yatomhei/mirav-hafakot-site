// Favicons from the camera mark (media-src/favicon-mark.png, transparent).
// Run: node scripts/favicons.mjs
//  - favicon-32.png and favicon.ico: the mark alone, for browser tabs.
//  - favicon-192.png (Android) and apple-touch-icon.png (iPhone): the mark on the site's cream,
//    since phones fill transparent corners with black.
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "media-src/favicon-mark.png";
const cream = { r: 250, g: 240, b: 235, alpha: 1 };
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

/** The mark, fitted inside `inner` px and centred on a `size` px square. */
async function icon(size, inner, background) {
  const mark = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: clear })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

const tab = await icon(32, 32, clear);
await writeFile("public/favicon-32.png", tab);
await writeFile("public/favicon-192.png", await icon(192, 150, cream));
await writeFile("public/apple-touch-icon.png", await icon(180, 140, cream));

// favicon.ico for browsers that ask for it by name: one 32px PNG inside an ICO wrapper.
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // no palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(tab.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
await writeFile("public/favicon.ico", Buffer.concat([header, tab]));

console.log("favicons done");
