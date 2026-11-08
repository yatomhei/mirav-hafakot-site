// Turns dist-preview/index.html into the body-only page a claude.ai artifact expects
// (the host adds <!doctype>, <html>, <head> and <body>) and lists the files to publish.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = new URL("../dist-preview/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const html = readFileSync(join(dist, "index.html"), "utf8");
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\.\/assets\/[^"]+)"[^>]*>/g)].map(
  (m) => m[1],
);
const js = [
  ...html.matchAll(/<script type="module"[^>]*src="(\.\/assets\/[^"]+)"[^>]*><\/script>/g),
].map((m) => m[1]);

const page = `<title>הפקת המרב — תצוגה מקדימה</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500&display=swap">
${css.map((h) => `<link rel="stylesheet" href="${h.slice(2)}">`).join("\n")}
<style>html,body{background:#FAF0EB}</style>
<div id="app" dir="rtl" lang="he"></div>
${js.map((s) => `<script type="module" src="${s.slice(2)}"></script>`).join("\n")}
`;
writeFileSync(join(dist, "page.html"), page);

const files = {};
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else {
      const rel = relative(dist, p).split(sep).join("/");
      if (rel.startsWith("assets/") || rel.startsWith("images/")) files[rel] = rel;
    }
  }
};
walk(dist);
writeFileSync(join(dist, "files.json"), JSON.stringify(files, null, 2));
console.log(page);
console.log(Object.keys(files).length, "files");
