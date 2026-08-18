// Post-build: overwrite dist/llms.txt with a full page index (every page, with
// docs.sail.money links), in SUMMARY.md order. Keeps the plugin's llms-full.txt.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const BASE = "https://docs.sail.money";
const summary = fs.readFileSync(path.join(ROOT, "SUMMARY.md"), "utf8");

function toSlug(src) {
  if (src === "README.md") return "/";
  let p = src.replace(/\.md$/, "");
  const parts = p.split("/");
  if (parts[parts.length - 1] === "README") {
    parts.pop();
    if (parts.length === 1) return "/" + parts[0] + "/" + parts[0];
    return "/" + parts.join("/");
  }
  return "/" + parts.join("/");
}

const lines = summary.split("\n");
const out = [];
out.push("# Sail");
out.push("");
out.push("> Onchain Separately Managed Accounts Run By Agents.");
out.push("");
out.push(`Full text of every page: [llms-full.txt](${BASE}/llms-full.txt)`);
out.push("");

let inTop = true;
for (const raw of lines) {
  const grp = raw.match(/^##\s+(.+?)\s*$/);
  if (grp) {
    out.push("");
    out.push(`## ${grp[1].trim()}`);
    out.push("");
    inTop = false;
    continue;
  }
  const item = raw.match(/^\s*\*\s+\[([^\]]+)\]\(([^)]+)\)/);
  if (item) {
    const label = item[1].trim();
    const src = item[2].trim();
    if (label === "Sail.Money") continue; // the home page, listed implicitly
    const slug = toSlug(src);
    out.push(`- [${label}](${BASE}${slug})`);
  }
}

fs.writeFileSync(path.join(process.cwd(), "dist", "llms.txt"), out.join("\n") + "\n");
console.log("llms.txt rewritten as full page index");
