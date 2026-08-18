// Build-time sync: copy the repo's GitBook markdown (single source of truth, left
// untouched so GitBook keeps rendering) into Starlight's content dir, converting
// GitBook constructs to Starlight equivalents and preserving every live slug exactly.
//
// Slug rules (verified against docs.sail.money):
//   README.md                     -> /
//   SECTION/README.md (top level)  -> /SECTION/SECTION   (group-node doubling)
//   A/B/README.md (nested index)   -> /A/B
//   anything/leaf.md               -> /anything/leaf
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.argv[2] || path.join(process.cwd(), ".."));
const OUT = path.resolve(process.cwd(), "src/content/docs");
const ASSET_SRC = path.join(ROOT, ".gitbook/assets");
const ASSET_OUT = path.resolve(process.cwd(), "public/assets");

const TOP_SECTIONS = new Set(["sailor", "protocol", "legal"]);
const EXCLUDE_DIRS = new Set([".git", "node_modules", "site", ".gitbook", ".assets-inbox", ".github"]);
const EXCLUDE_FILES = new Set(["SUMMARY.md", "llms.txt", "llms-full.txt"]);

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full);
    if (fs.statSync(full).isDirectory()) {
      if (EXCLUDE_DIRS.has(name)) continue;
      walk(full, acc);
    } else if (name.endsWith(".md") && !EXCLUDE_FILES.has(name)) {
      acc.push(rel.split(path.sep).join("/"));
    }
  }
  return acc;
}

function toSlug(src) {
  if (src === "README.md") return "/";
  let p = src.replace(/\.md$/, "");
  const parts = p.split("/");
  if (parts[parts.length - 1] === "README") {
    parts.pop();
    if (parts.length === 1) return "/" + parts[0] + "/" + parts[0]; // doubled overview
    return "/" + parts.join("/");
  }
  return "/" + parts.join("/");
}
function toOut(src) {
  const slug = toSlug(src);
  return slug === "/" ? "index" : slug.slice(1);
}

const sources = walk(ROOT).sort();
const slugMap = new Map(); // src -> slug
for (const s of sources) slugMap.set(s, toSlug(s));
const exists = (s) => slugMap.has(s);

const flags = [];

function resolveLink(target, curSrc) {
  if (/^(https?:|mailto:|tel:)/i.test(target)) return target;
  if (target.startsWith("#")) return target; // same-page anchor
  const hashI = target.indexOf("#");
  const pathPart = hashI >= 0 ? target.slice(0, hashI) : target;
  const anchor = hashI >= 0 ? target.slice(hashI) : "";
  if (pathPart === "") return target;
  if (pathPart.includes(".gitbook/assets/")) {
    return "/assets/" + pathPart.split("/").pop() + anchor;
  }
  const curDir = path.posix.dirname(curSrc);
  let resolved = path.posix.normalize(path.posix.join(curDir, pathPart));
  if (resolved.endsWith("/")) resolved = resolved.slice(0, -1);
  let cand;
  if (resolved.endsWith(".md")) cand = resolved;
  else if (exists(resolved + "/README.md")) cand = resolved + "/README.md";
  else if (exists(resolved + ".md")) cand = resolved + ".md";
  else cand = resolved + "/README.md";
  const slug = slugMap.get(cand);
  if (!slug) {
    flags.push(`UNRESOLVED LINK in ${curSrc}: "${target}" -> ${cand}`);
    return target;
  }
  return slug + anchor;
}

// Rewrite all markdown links [text](target) and bare <a href>, plus img srcs.
function rewriteLinks(body, curSrc) {
  body = body.replace(/\]\(([^)]+)\)/g, (m, t) => "](" + resolveLink(t.trim(), curSrc) + ")");
  body = body.replace(/src="([^"]+)"/g, (m, t) => 'src="' + resolveLink(t.trim(), curSrc) + '"');
  return body;
}

// GitBook hint -> Starlight aside
const HINT = { info: "note", warning: "caution", success: "tip", danger: "danger" };
function convertHints(body) {
  return body.replace(/{%\s*hint\s+style="([a-z]+)"\s*%}([\s\S]*?){%\s*endhint\s*%}/g, (m, style, inner) => {
    const kind = HINT[style] || "note";
    return ":::" + kind + "\n" + inner.trim() + "\n:::";
  });
}

// GitBook tabs -> Starlight <Tabs><TabItem>
function convertTabs(body) {
  let used = false;
  body = body.replace(/{%\s*tabs\s*%}([\s\S]*?){%\s*endtabs\s*%}/g, (m, inner) => {
    used = true;
    const items = [];
    const re = /{%\s*tab\s+title="([^"]+)"\s*%}([\s\S]*?){%\s*endtab\s*%}/g;
    let mm;
    while ((mm = re.exec(inner)) !== null) {
      items.push(`<TabItem label=${JSON.stringify(mm[1])}>\n${mm[2].trim()}\n</TabItem>`);
    }
    return `<Tabs>\n${items.join("\n")}\n</Tabs>`;
  });
  return { body, used };
}

// Landing card table -> faithful clickable HTML cards (plain HTML, so the page stays
// .md). Preserves the exact copy, the <strong> audience lead-ins, order, and links.
function convertCards(body) {
  let used = false; // HTML cards need no component import
  body = body.replace(/<table data-view="cards">[\s\S]*?<\/table>/g, (tbl) => {
    const rows = [...tbl.matchAll(/<tr><td><strong>([\s\S]*?)<\/strong><\/td><td>([\s\S]*?)<\/td><td><a href="([^"]+)">[\s\S]*?<\/a><\/td><\/tr>/g)];
    const cards = rows.map(([, title, desc, href]) => {
      const link = resolveLink(href.trim(), "README.md");
      const t = title.replace(/&#x26;/g, "&").trim();
      const d = desc.replace(/&#x26;/g, "&").trim(); // keeps inner <strong> lead-in
      return `  <a class="sail-card" href="${link}"><strong class="sail-card-title">${t}</strong><span class="sail-card-body">${d}</span></a>`;
    });
    return `<div class="sail-cards">\n${cards.join("\n")}\n</div>`;
  });
  return { body, used };
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm && mm[2] !== "") fm[mm[1]] = mm[2].trim();
  }
  return { fm, body: raw.slice(m[0].length) };
}

function extractTitle(body) {
  const m = body.match(/^\s*#\s+(.+?)\s*$/m);
  if (!m) return { title: null, body };
  const title = m[1].trim();
  const body2 = body.replace(m[0] + "\n", "").replace(m[0], "");
  return { title, body: body2 };
}

function yamlEscape(s) {
  return JSON.stringify(s);
}

// ---- run ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ASSET_OUT, { recursive: true });
if (fs.existsSync(ASSET_SRC)) {
  for (const f of fs.readdirSync(ASSET_SRC)) {
    fs.copyFileSync(path.join(ASSET_SRC, f), path.join(ASSET_OUT, f));
  }
}

let count = 0;
for (const src of sources) {
  const raw = fs.readFileSync(path.join(ROOT, src), "utf8");
  const { fm, body: b0 } = parseFrontmatter(raw);
  let { title, body } = extractTitle(b0);
  title = title || fm.title || path.basename(src, ".md");

  body = convertHints(body);
  const t = convertTabs(body); body = t.body;
  const c = convertCards(body); body = c.body;
  body = rewriteLinks(body, src);

  const needsMdx = t.used || c.used;
  const imports = [];
  if (t.used) imports.push('import { Tabs, TabItem } from "@astrojs/starlight/components";');
  if (c.used) imports.push('import { CardGrid, LinkCard } from "@astrojs/starlight/components";');

  const outRel = toOut(src) + (needsMdx ? ".mdx" : ".md");
  const outFull = path.join(OUT, outRel);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });

  const fmLines = ["---", `title: ${yamlEscape(title)}`];
  if (fm.description) fmLines.push(`description: ${yamlEscape(fm.description)}`);
  fmLines.push("---");
  const head = fmLines.join("\n") + "\n" + (imports.length ? imports.join("\n") + "\n" : "") + "\n";
  fs.writeFileSync(outFull, head + body.trimStart());
  count++;
}

fs.writeFileSync(path.resolve(process.cwd(), "slug-map.json"),
  JSON.stringify(Object.fromEntries([...slugMap].map(([s, sl]) => [s, sl])), null, 2));

console.log(`synced ${count} pages`);
if (flags.length) { console.log("FLAGS:"); for (const f of flags) console.log("  " + f); }
else console.log("no link flags");
