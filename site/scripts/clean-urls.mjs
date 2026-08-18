// Post-build: make internal URLs extensionless + trailing-slash-free to match the
// current GitBook URLs exactly. Files stay `foo.html` (Azure SWA serves them at `/foo`);
// only the links, canonicals, redirects, and sitemap entries are rewritten.
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else a.push(f);
  }
  return a;
}

// /path/index.html -> /path ; /index.html -> / ; /path.html -> /path (keeps #anchor / query)
function cleanHref(url) {
  let [p, rest = ""] = url.split(/(?=[#?])/);
  if (p === "/index.html") p = "/";
  else if (p.endsWith("/index.html")) p = p.slice(0, -"/index.html".length) || "/";
  else if (p.endsWith(".html")) p = p.slice(0, -5);
  return p + rest;
}

let htmlCount = 0;
for (const f of walk(DIST)) {
  if (f.endsWith(".html")) {
    let s = fs.readFileSync(f, "utf8");
    // Only rewrite root-relative internal targets ("/...").
    s = s.replace(/(href|content)="(\/[^":]*?\.html(?:[#?][^"]*)?)"/g, (m, attr, url) => `${attr}="${cleanHref(url)}"`);
    fs.writeFileSync(f, s);
    htmlCount++;
  } else if (f.endsWith(".xml")) {
    let s = fs.readFileSync(f, "utf8");
    s = s.replace(/<loc>(https?:\/\/[^<]+?)\.html<\/loc>/g, (m, u) => `<loc>${u}</loc>`);
    s = s.replace(/<loc>(https?:\/\/[^<]+?)\/index<\/loc>/g, (m, u) => `<loc>${u}</loc>`);
    fs.writeFileSync(f, s);
  }
}
console.log(`clean-urls: rewrote ${htmlCount} html files`);
